import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">FashionStore</h3>
            <p className="text-gray-400">
              Your one-stop destination for premium fashion. Quality clothing for every occasion.
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="hover:text-primary transition-colors">
                <FiFacebook />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <FiTwitter />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <FiInstagram />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <FiYoutube />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link href="/products?category=Men" className="hover:text-primary transition-colors">Men</Link></li>
              <li><Link href="/products?category=Women" className="hover:text-primary transition-colors">Women</Link></li>
              <li><Link href="/products?category=Kids" className="hover:text-primary transition-colors">Kids</Link></li>
              <li><Link href="/products?category=Accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li>📍 123 Fashion Street, Mumbai</li>
              <li>📞 +91 98765 43210</li>
              <li>✉️ support@fashionstore.com</li>
              <li>🕐 Mon-Sat: 10AM - 8PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>&copy; 2024 FashionStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;