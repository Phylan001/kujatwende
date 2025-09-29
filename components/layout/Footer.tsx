import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/10 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="KujaTwende Icon"
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                  <span className="text-primary">KUJA</span>TWENDE.
                </span>
              </Link>
            </div>
            <p className="text-white/70 leading-relaxed">
              Your gateway to extraordinary Kenyan adventures. Discover the
              beauty, culture, and wildlife of Kenya with our expert-guided
              tours.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="text-white/60 hover:text-cyan-400 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-cyan-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-cyan-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-cyan-400 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/packages"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                Travel Packages
              </Link>
              <Link
                href="/destinations"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                Destinations
              </Link>
              <Link
                href="/about"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/bookings"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                My Bookings
              </Link>
            </div>
          </div>

          {/* Destinations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Popular Destinations
            </h3>
            <div className="space-y-2">
              <Link
                href="/packages?search=maasai mara"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                Maasai Mara
              </Link>
              <Link
                href="/packages?search=amboseli"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                Amboseli National Park
              </Link>
              <Link
                href="/packages?search=mount kenya"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                Mount Kenya
              </Link>
              <Link
                href="/packages?search=diani"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                Diani Beach
              </Link>
              <Link
                href="/packages?search=samburu"
                className="block text-white/70 hover:text-cyan-400 transition-colors"
              >
                Samburu Reserve
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/70">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <Phone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>+254 700 123 456</span>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>info@kujatwende.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-white/60 text-sm">
            © 2025 Kuja Twende Adventures. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-white/60 hover:text-cyan-400 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/60 hover:text-cyan-400 text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-white/60 hover:text-cyan-400 text-sm transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
