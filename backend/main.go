package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type config struct {
	supabaseURL     string
	supabaseAnonKey string
	supabaseKey     string
	corsOrigins     []string
}

type server struct {
	config config
	client *http.Client
}

type profile struct {
	ID                    string    `json:"id,omitempty"`
	Email                 string    `json:"email"`
	FullName              string    `json:"full_name"`
	PhoneNumber           string    `json:"phone_number"`
	DefaultPickupLocation string    `json:"default_pickup_location"`
	CreatedAt             time.Time `json:"created_at,omitempty"`
}

type authUser struct {
	ID       string            `json:"id"`
	Email    string            `json:"email"`
	Metadata map[string]string `json:"user_metadata"`
}

func main() {
	cfg, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}
	s := &server{config: cfg, client: &http.Client{Timeout: 10 * time.Second}}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", s.health)
	mux.HandleFunc("GET /api/profile", s.getProfile)
	mux.HandleFunc("PUT /api/profile", s.saveProfile)

	addr := ":" + env("PORT", "8000")
	log.Printf("Pitt2PIT API listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, s.withCORS(mux)))
}

func loadConfig() (config, error) {
	cfg := config{
		supabaseURL:     strings.TrimRight(os.Getenv("SUPABASE_URL"), "/"),
		supabaseAnonKey: os.Getenv("SUPABASE_ANON_KEY"),
		supabaseKey:     os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		corsOrigins:     strings.Split(env("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"), ","),
	}
	if cfg.supabaseURL == "" || cfg.supabaseAnonKey == "" || cfg.supabaseKey == "" {
		return config{}, errors.New("SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required")
	}
	return cfg, nil
}

func (s *server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "healthy"})
}

func (s *server) getProfile(w http.ResponseWriter, r *http.Request) {
	user, ok := s.authenticatedUser(w, r)
	if !ok {
		return
	}
	rows, err := s.queryProfiles(r, user.ID, nil)
	if err != nil {
		writeError(w, http.StatusBadGateway, "Could not load profile")
		return
	}
	if len(rows) == 0 {
		writeError(w, http.StatusNotFound, "Profile not found")
		return
	}
	writeJSON(w, http.StatusOK, rows[0])
}

func (s *server) saveProfile(w http.ResponseWriter, r *http.Request) {
	user, ok := s.authenticatedUser(w, r)
	if !ok {
		return
	}
	var input profile
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid profile JSON")
		return
	}
	if input.FullName == "" || input.PhoneNumber == "" || input.DefaultPickupLocation == "" {
		writeError(w, http.StatusBadRequest, "full_name, phone_number, and default_pickup_location are required")
		return
	}
	if !strings.HasSuffix(strings.ToLower(user.Email), "@pitt.edu") {
		writeError(w, http.StatusForbidden, "Only @pitt.edu email addresses are allowed")
		return
	}
	input.ID = user.ID
	input.Email = user.Email
	rows, err := s.queryProfiles(r, user.ID, &input)
	if err != nil {
		writeError(w, http.StatusBadGateway, "Could not save profile")
		return
	}
	if len(rows) == 0 {
		writeError(w, http.StatusBadGateway, "Profile save returned no profile")
		return
	}
	writeJSON(w, http.StatusOK, rows[0])
}

func (s *server) authenticatedUser(w http.ResponseWriter, r *http.Request) (authUser, bool) {
	parts := strings.Fields(r.Header.Get("Authorization"))
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		writeError(w, http.StatusUnauthorized, "Bearer token required")
		return authUser{}, false
	}
	request, err := http.NewRequestWithContext(r.Context(), http.MethodGet, s.config.supabaseURL+"/auth/v1/user", nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not verify session")
		return authUser{}, false
	}
	request.Header.Set("apikey", s.config.supabaseAnonKey)
	request.Header.Set("Authorization", "Bearer "+parts[1])
	response, err := s.client.Do(request)
	if err != nil {
		writeError(w, http.StatusBadGateway, "Could not verify session")
		return authUser{}, false
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		writeError(w, http.StatusUnauthorized, "Invalid or expired session")
		return authUser{}, false
	}
	var user authUser
	if err := json.NewDecoder(response.Body).Decode(&user); err != nil || user.ID == "" || user.Email == "" {
		writeError(w, http.StatusUnauthorized, "Invalid session user")
		return authUser{}, false
	}
	return user, true
}

func (s *server) queryProfiles(r *http.Request, userID string, update *profile) ([]profile, error) {
	url := s.config.supabaseURL + "/rest/v1/users?id=eq." + userID + "&select=id,email,full_name,phone_number,default_pickup_location,created_at"
	method := http.MethodGet
	var body io.Reader
	if update != nil {
		url += "&on_conflict=id"
		method = http.MethodPost
		encoded, err := json.Marshal(update)
		if err != nil {
			return nil, err
		}
		body = strings.NewReader(string(encoded))
	}
	request, err := http.NewRequestWithContext(r.Context(), method, url, body)
	if err != nil {
		return nil, err
	}
	request.Header.Set("apikey", s.config.supabaseKey)
	request.Header.Set("Authorization", "Bearer "+s.config.supabaseKey)
	if update != nil {
		request.Header.Set("Content-Type", "application/json")
		request.Header.Set("Prefer", "resolution=merge-duplicates,return=representation")
	}
	response, err := s.client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		message, _ := io.ReadAll(io.LimitReader(response.Body, 4096))
		return nil, fmt.Errorf("supabase returned %d: %s", response.StatusCode, strings.TrimSpace(string(message)))
	}
	var rows []profile
	if err := json.NewDecoder(response.Body).Decode(&rows); err != nil {
		return nil, err
	}
	return rows, nil
}

func (s *server) withCORS(next http.Handler) http.Handler {
	allowed := make(map[string]bool, len(s.config.corsOrigins))
	for _, origin := range s.config.corsOrigins {
		allowed[strings.TrimSpace(origin)] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowed[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
