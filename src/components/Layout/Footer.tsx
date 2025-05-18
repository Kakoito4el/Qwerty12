import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Cpu className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">NexTech</span>
            </Link>
            <p className="mb-4">
              Your one-stop solution for all PC components and custom builds. We offer high-quality products and expert advice.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="hover:text-white transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/pc-builder" className="hover:text-white transition">
                  PC Builder
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/cpu" className="hover:text-white transition">
                  Processors
                </Link>
              </li>
              <li>
                <Link to="/category/motherboard" className="hover:text-white transition">
                  Motherboards
                </Link>
              </li>
              <li>
                <Link to="/category/gpu" className="hover:text-white transition">
                  Graphics Cards
                </Link>
              </li>
              <li>
                <Link to="/category/ram" className="hover:text-white transition">
                  Memory
                </Link>
              </li>
              <li>
                <Link to="/category/storage" className="hover:text-white transition">
                  Storage
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                <span>1234 Tech Street, Silicon Valley, CA 94043</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-500" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <span>support@nextech.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} NexTech. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;