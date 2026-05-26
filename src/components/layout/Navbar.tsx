import { Shield, User as UserIcon, LogOut, History, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';

export const Navbar = () => {
  const location = useLocation();
  const { user, signInWithGoogle, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-accent/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Shield className="h-8 w-8 text-accent" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-text">
              SecureVault
            </span>
          </Link>
          <div className="flex items-center space-x-1">
            {[
              { name: 'Home', path: '/' },
              { name: 'How it Works', path: '/#how-it-works' },
              { name: 'Data Privacy', path: '/#privacy' },
              { name: 'Audit', path: '/analyze' },
            ].map((item) => {
              const pathBase = item.path.split('#')[0];
              const pathHash = item.path.includes('#') ? '#' + item.path.split('#')[1] : '';
              const isActive = location.pathname === pathBase && location.hash === pathHash;
              
              const baseClasses = "text-sm font-medium transition-all px-3 py-1.5 rounded-full hover:text-accent hidden sm:block";
              const mobileClasses = (item.name === 'Audit' || item.name === 'Home') ? "!block" : "";
              const activeClasses = isActive ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface";
              
              if (item.path.includes('#')) {
                return (
                  <a key={item.name} href={item.path} className={cn(baseClasses, mobileClasses, activeClasses)}>
                    {item.name}
                  </a>
                );
              }
              return (
                <Link key={item.name} to={item.path} className={cn(baseClasses, mobileClasses, activeClasses)}>
                  {item.name}
                </Link>
              );
            })}

            {/* Auth Section */}
            {!user ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium transition-all px-4 py-1.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-background mx-2"
              >
                Sign in
              </button>
            ) : (
              <div className="relative mx-2">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center font-bold text-sm"
                >
                  {user.displayName?.charAt(0) || <UserIcon className="w-4 h-4" />}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-accent/20 rounded-md shadow-lg overflow-hidden py-1 z-50">
                    <Link to="/history" className="flex items-center px-4 py-2 text-sm text-text hover:bg-surface-hover" onClick={() => setIsDropdownOpen(false)}>
                      <History className="w-4 h-4 mr-2" /> Scan History
                    </Link>
                    <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-text hover:bg-surface-hover">
                      <LogOut className="w-4 h-4 mr-2" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            <Link 
              to="/dashboard" 
              className={cn(
                "text-sm font-medium transition-all px-3 py-1.5 rounded-full hover:text-accent",
                location.pathname === '/dashboard' ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface"
              )}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
