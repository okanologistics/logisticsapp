'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Truck, User, LogOut } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/check-session');
        if (!response.ok) {
          setUser(null);
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        setUser(null);
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/investment', label: 'Investment' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-max">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/okanologo.jpg" 
              alt="Okano Logistics Logo" 
              width={96} 
              height={64} 
              className="w-24 h-16 object-contain" 
              priority 
            />
            <span className="text-xl font-bold text-navy font-poppins">
              Okano Logistics
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-gray-700 hover:text-orange transition-colors duration-200 ${
                  pathname === item.href ? 'text-orange border-b-2 border-orange' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange transition-colors duration-200"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary"
              >
                Investor Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 hover:text-orange"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-gray-700 hover:text-orange transition-colors duration-200 ${
                    pathname === item.href ? 'text-orange' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {user ? (
                <div className="flex flex-col space-y-4 pt-4 border-t">
                  <Link
                    href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                    className="flex items-center space-x-2 text-gray-700 hover:text-orange transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-orange transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn-primary text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Investor Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}