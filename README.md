# Pitt2PIT - Campus Airport Ride Sharing Platform

A full-stack ride-sharing platform connecting University of Pittsburgh students traveling to Pittsburgh International Airport. Save up to 73% by splitting Uber/Lyft costs with fellow Panthers!

## Features

- **Email Verification**: Only @pitt.edu emails allowed
- **Smart Matching**: Auto-match with rides within ±30 minutes
- **Group Coordination**: See everyone's contact info and pickup details
- **Cost Calculator**: Automatic cost-per-person calculation
- **Real-time Updates**: Live group status updates
- **Manual Browsing**: Browse and join groups manually if preferred

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with Pitt colors (#003594 Navy, #FFB81C Gold)
- **Routing**: React Router v6
- **Auth**: Supabase Auth
- **Date Handling**: date-fns

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Matching Algorithm**: Custom time-window based matching (±30 min)

## Project Structure

```
Pitt2PIT/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Login, Signup, Protected routes
│   │   │   ├── layout/      # Navigation, Layout
│   │   │   └── ...
│   │   ├── contexts/        # Auth context
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Supabase client
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   ├── .env.example
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Configuration
│   │   ├── db/              # Database client
│   │   ├── models/          # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── main.py
│   ├── tests/               # Pytest tests
│   ├── .env.example
│   └── requirements.txt
└── supabase/                # Database migrations
    ├── migrations/          # SQL migration files
    └── SETUP.md            # Supabase setup guide
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Supabase account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Pitt2PIT.git
cd Pitt2PIT
```

### 2. Set Up Supabase

Follow the detailed guide in `supabase/SETUP.md`:

1. Create a new Supabase project
2. Run all SQL migrations in order (001-005)
3. Configure email authentication
4. Enable Realtime for `ride_groups` and `group_members` tables
5. Get your API keys

### 3. Configure Environment Variables

#### Frontend (.env in `frontend/`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:8000
```

#### Backend (.env in `backend/`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Run the Application

#### Start Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

Backend will run on http://localhost:8000

#### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:5173

### 6. Test the Application

1. Open http://localhost:5173
2. Sign up with a @pitt.edu email
3. Check email for verification link
4. Create a ride request
5. Test the matching algorithm with a second user

## Running Tests

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

Tests cover:
- Matching algorithm logic
- Cost split calculations
- Group capacity management
- Time window matching

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/rides/create` - Create new ride request
- `GET /api/rides/groups` - Browse available groups
- `POST /api/rides/join/{group_id}` - Request to join group
- `GET /api/rides/my-group` - Get current user's group
- `POST /api/rides/approve-member/{member_id}` - Approve join request
- `POST /api/rides/calculate-split` - Calculate cost split

## Deployment

### Frontend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. From `frontend/` directory: `vercel`
3. Set environment variables in Vercel dashboard
4. Deploy: `vercel --prod`

### Backend (Railway/Render)

#### Railway

1. Create new project on Railway
2. Connect GitHub repository
3. Set root directory to `backend/`
4. Add environment variables
5. Deploy

#### Render

1. Create new Web Service
2. Connect GitHub repository
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Deploy

### Environment Variables for Production

Update these in your production environment:
- `VITE_API_URL` → Your production backend URL
- `CORS_ORIGINS` → Your production frontend URL
- Consider using a custom domain

## Key Features Explained

### Auto-Matching Algorithm

The matching algorithm (`backend/app/services/matching.py`) works as follows:

1. User creates ride request with pickup time and location
2. System searches for existing groups within ±30 minute window
3. If match found and group not full → add user to group
4. If no match found → create new group and wait for others
5. Group creator doesn't need to approve auto-matched members

### Manual Join with Approval

1. User browses available groups
2. Clicks "Request to Join"
3. Group creator receives notification
4. Creator approves or declines via pending requests
5. Once approved, user can see full group details

### Cost Splitting

- Default estimated cost: $45.00 (configurable)
- Split evenly among all accepted members
- Displayed on My Group page
- Users coordinate Venmo payments directly

## Security

- **Row Level Security (RLS)**: Enabled on all Supabase tables
- **Email Verification**: Required for all new users
- **Domain Restriction**: Only @pitt.edu emails allowed
- **JWT Authentication**: Supabase handles auth tokens
- **Service Role Key**: Kept server-side only

## Troubleshooting

### "Only @pitt.edu emails allowed" error
- Make sure email ends with @pitt.edu
- Check Supabase email domain allowlist settings
- Verify trigger function is created (migration 005)

### Backend can't connect to Supabase
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Use **service_role key** (not anon key) for backend
- Check if Supabase project is active

### Frontend auth not working
- Clear browser localStorage
- Check `VITE_SUPABASE_ANON_KEY` is correct
- Verify email confirmation was completed

### Groups not appearing
- Check RLS policies in Supabase
- Verify user is authenticated
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use this project as a template for your own ride-sharing platforms.

## Support

For issues or questions:
- Open a GitHub issue
- Contact: [your-email@pitt.edu]

## Acknowledgments

- University of Pittsburgh students for inspiration
- Supabase for amazing backend-as-a-service
- FastAPI for great Python API framework
- The Pitt community 🐾

---

**Made with 💙💛 for the Pitt community**
