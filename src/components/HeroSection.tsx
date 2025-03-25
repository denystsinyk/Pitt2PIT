import Image from 'next/image';
import { Button } from './ui/button';
import { ChevronRight, Users, Clock, DollarSign, PlaneTakeoff, School } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="min-h-screen relative flex items-center overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-pitt-blue via-pitt-blue/95 to-[#001F5C] z-0" />
      
      {/* Diagonal gold accent */}
      <div className="absolute -right-20 top-0 w-40 h-[200%] bg-pitt-gold/15 -rotate-45 z-0" />
      
      <main className="w-full px-4 md:px-6 lg:px-8 font-sans max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 md:gap-16">
          {/* Left side - Text content */}
          <div className="text-left space-y-8 flex-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-extrabold leading-tight text-white">
              Ubers to PIT from <span className="text-pitt-gold">$9</span>
            </h1>

            <div className="space-y-8 text-white">
              <h2 className="text-xl sm:text-2xl font-sans">
                Split your ride with other Pitt students
              </h2>

              {/* Benefits section */}
              <div className="space-y-4">
                <div className="flex items-center gap-x-3">
                  <div className="p-2 bg-pitt-gold/30 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg">Share rides with verified Pitt students only</p>
                </div>
                <div className="flex items-center gap-x-3">
                  <div className="p-2 bg-pitt-gold/30 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg">Schedule rides in advance or on-demand</p>
                </div>
                <div className="flex items-center gap-x-3">
                  <div className="p-2 bg-pitt-gold/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg">Save money by splitting the fare</p>
                </div>
              </div>

              <div className="flex items-center gap-x-6 text-base pt-4">
                <div className="flex-none">Powered by</div>
                <Image
                  src="/images/uber-logo.svg"
                  alt="Uber Logo"
                  width={60}
                  height={20}
                  className="w-24 invert"
                />
                <div>and</div>
                <Image
                  src="/images/Pitt_Logo.svg"
                  alt="Pitt Logo"
                  width={60}
                  height={20}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          {/* Right side - Card */}
          <div className="flex-1 w-full max-w-md">
            <div className="p-8 rounded-lg bg-white shadow-lg border border-pitt-gold/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-pitt-blue mb-2">Where are you headed?</h3>
                  <p className="text-sm text-gray-600">Choose your destination to get started</p>
                </div>

                <Button
                  variant="outline"
                  className="group w-full px-6 py-4 rounded-md bg-white hover:bg-pitt-blue text-pitt-blue hover:text-white border-2 border-pitt-blue transition-all duration-300 font-sans flex items-center justify-between h-auto mb-4 focus:outline-none hover:border-pitt-gold"
                >
                  <div className="flex items-center gap-x-3">
                    <PlaneTakeoff className="h-5 w-5" />
                    <span className="text-lg">Take me to the airport</span>
                  </div>
                  <ChevronRight className="h-5 w-5 group-hover:text-pitt-gold" />
                </Button>

                <Button
                  variant="outline"
                  className="group w-full px-6 py-4 rounded-md bg-white hover:bg-pitt-blue text-pitt-blue hover:text-white border-2 border-pitt-blue transition-all duration-300 font-sans flex items-center justify-between h-auto focus:outline-none hover:border-pitt-gold"
                >
                  <div className="flex items-center gap-x-3">
                    <School className="h-5 w-5" />
                    <span className="text-lg">Take me back to Pitt</span>
                  </div>
                  <ChevronRight className="h-5 w-5 group-hover:text-pitt-gold" />
                </Button>

                <p className="text-xs text-gray-600 mt-6">
                  By selecting a destination, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
