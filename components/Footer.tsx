import Link from 'next/link';
import { Truck, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-orange" />
              <span className="text-xl font-bold font-poppins">
                Okano Logistics
              </span>
            </Link>
            <p className="text-gray-300">
              Delivering faster, smarter, better across Nigeria&rsquo;s logistics space.
            </p>
            <div className="flex space-x-4">
              {/* Facebook */}
              <a href="https://facebook.com/okanologistics" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-300 hover:text-orange transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />
                </svg>
              </a>
              {/* X (Twitter) */}
              <a href="https://x.com/okanologistics" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-gray-300 hover:text-orange transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.53 2.47a2.75 2.75 0 0 1 3.88 3.88l-5.2 5.2 5.2 5.2a2.75 2.75 0 0 1-3.88 3.88l-5.2-5.2-5.2 5.2a2.75 2.75 0 0 1-3.88-3.88l5.2-5.2-5.2-5.2A2.75 2.75 0 0 1 6.13 2.47l5.2 5.2 5.2-5.2z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com/company/okanologistics" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-300 hover:text-orange transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <line x1="16" y1="11" x2="16" y2="16" stroke="white" strokeWidth="2" />
                  <line x1="8" y1="11" x2="8" y2="16" stroke="white" strokeWidth="2" />
                  <line x1="8" y1="8" x2="8" y2="8" stroke="white" strokeWidth="2" />
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://tiktok.com/@okanologistics" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-300 hover:text-orange transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.75 2v12.25a2.75 2.75 0 11-2.75-2.75h.25V9.5a5.25 5.25 0 102.5 4.5V2h-2zM16.5 2v2.25a3.75 3.75 0 003.75 3.75H22V2h-5.5z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com/okanologistics" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-300 hover:text-orange transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-poppins">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-orange transition-colors">About Us</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-orange transition-colors">Services</Link></li>
              <li><Link href="/investment" className="text-gray-300 hover:text-orange transition-colors">Investment</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-orange transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-poppins">Services</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-300">Express Delivery</span></li>
              <li><span className="text-gray-300">Private Car Services</span></li>
              <li><span className="text-gray-300">Haulage Services</span></li>
              <li><span className="text-gray-300">Bike Investment</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-poppins">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange" />
                <span className="text-gray-300 text-sm">
                  1, Rebadu Road,Ikoyi,Lagos
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange" />
                <span className="text-gray-300 text-sm">+2347037221197, +2348129677481</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange" />
                <span className="text-gray-300 text-sm">info@okanologistic.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-orange" />
                <a href="https://wa.me/2347037221197" className="text-gray-300 text-sm hover:text-orange transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Okano Logistic Services. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms" className="text-gray-400 hover:text-orange transition-colors text-sm">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-orange transition-colors text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}