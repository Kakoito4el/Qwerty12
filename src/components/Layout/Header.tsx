import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Cpu, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../stores/cartStore';

const Header: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const cartItemCount = useCartStore(state => state.getTotalItems());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Cpu className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">NexTech</span>
          </Link>
  
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-700 hover:text-blue-600 transition">
              All Products
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-blue-600 transition">
              Categories
            </Link>
            <Link to="/pc-builder" className="text-gray-700 hover:text-blue-600 transition">
              PC Builder
            </Link>
          </nav>
  
          {/* Search, Cart, and User - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="py-2 pl-10 pr-4 rounded-full bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
  
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-blue-600 transition" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
  
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <User className="h-6 w-6 text-gray-700 hover:text-blue-600 transition" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">
                Login
              </Link>
            )}
          </div>
  
          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
  
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <form onSubmit={handleSearch} className="mb-4 relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
  
            <nav className="flex flex-col space-y-3">
              <Link to="/products" className="text-gray-700 hover:text-blue-600 transition" onClick={toggleMenu}>
                All Products
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-blue-600 transition" onClick={toggleMenu}>
                Categories
              </Link>
              <Link to="/pc-builder" className="text-gray-700 hover:text-blue-600 transition" onClick={toggleMenu}>
                PC Builder
              </Link>
              <Link to="/cart" className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition" onClick={toggleMenu}>
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
  
              {user ? (
                <>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition" onClick={toggleMenu}>
                    Profile
                  </Link>
                  <Link to="/orders" className="text-gray-700 hover:text-blue-600 transition" onClick={toggleMenu}>
                    Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition" onClick={toggleMenu}>
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition" onClick={toggleMenu}>
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
  
};

export default Header;