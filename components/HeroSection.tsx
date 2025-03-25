import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#003594] to-[#001F5C] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Ubers to PIT from $9
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Batch your ride with verified Pitt2PIT students
          </p>
          <div className="flex justify-center space-x-4 mt-8">
            <a href="https://apps.apple.com/app/batch-rideshare/id1234567890" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FFB81C] transition-colors">
              <Image
                src="/images/app-store-badge.png"
                alt="Download on App Store"
                width={120}
                height={40}
                className="invert"
              />
            </a>
          </div>
          <div className="mt-12 flex items-center justify-center space-x-4">
            <span className="text-white text-sm">Powered by</span>
            <Image
              src="/images/uber-logo.png"
              alt="Uber"
              width={80}
              height={40}
              className="invert"
            />
            <Image
              src="/images/Pitt_Logo.svg"
              alt="Pitt Logo"
              width={80}
              height={40}
            />
          </div>
        </div>
      </div>
    </section>
  );
} 