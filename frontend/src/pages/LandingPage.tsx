import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';

export function LandingPage() {
  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-pitt-blue overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="text-center">
                  <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span className="block">Share Airport Rides</span>
                    <span className="block text-pitt-gold">Save Up to 73%</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-200 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
                    Connect with fellow Pitt students heading to Pittsburgh International Airport.
                    Split the cost of Uber/Lyft rides and save money together.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
                    <div className="rounded-md shadow">
                      <Link
                        to="/signup"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-pitt-gold hover:bg-pitt-gold/90 md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-pitt-blue bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Getting to PIT has never been easier or more affordable
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pitt-blue text-white text-xl font-bold mx-auto">
                    1
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Create a Ride Request</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Enter your pickup time and location on campus. Choose auto-match or browse groups manually.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pitt-blue text-white text-xl font-bold mx-auto">
                    2
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Get Matched</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Our algorithm finds students with similar departure times (within 30 minutes).
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pitt-blue text-white text-xl font-bold mx-auto">
                    3
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Coordinate & Split</h3>
                  <p className="mt-2 text-base text-gray-600">
                    See everyone's contact info, coordinate the ride, and split the cost via Venmo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why Use Pitt2PIT?
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="text-lg font-medium text-gray-900">Save Money</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Split a $45 ride 4 ways = $11.25 per person (vs $45 alone)
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="text-lg font-medium text-gray-900">Pitt Students Only</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Verified @pitt.edu emails ensure you're riding with fellow Panthers
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="text-lg font-medium text-gray-900">Easy Coordination</h3>
                <p className="mt-2 text-sm text-gray-600">
                  See everyone's contact info and pickup location in one place
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">🤝</div>
                <h3 className="text-lg font-medium text-gray-900">Meet New People</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Connect with other Pitt students while saving money
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-pitt-blue">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to save on your next airport trip?</span>
              <span className="block text-pitt-gold">Sign up now and start sharing rides.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-pitt-gold hover:bg-pitt-gold/90"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
