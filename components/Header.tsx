import Image from 'next/image';

<header className="fixed top-0 left-0 right-0 z-50 bg-opacity-0">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-2">
        <Image
          src="/images/p2p_logo.svg"
          alt="Pitt2PIT Logo"
          width={40}
          height={40}
          className="invert"
        />
        <span className="text-xl font-bold text-white">Pitt2PIT</span>
      </div>
      <nav className="hidden md:flex space-x-8">
        <a href="#how-it-works" className="text-white hover:text-[#FFB81C] transition-colors">How it Works</a>
        <a href="#comparison" className="text-white hover:text-[#FFB81C] transition-colors">Comparison</a>
        <a href="#why-choose" className="text-white hover:text-[#FFB81C] transition-colors">Why Choose P2P</a>
      </nav>
      <div className="flex items-center space-x-4">
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
    </div>
  </div>
</header> 