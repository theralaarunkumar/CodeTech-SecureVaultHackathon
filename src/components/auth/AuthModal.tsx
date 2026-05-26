import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot-password';

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleClose = () => {
    setMode('signin');
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
        handleClose();
      } else if (mode === 'signin') {
        await signInWithEmail(email, password);
        handleClose();
      } else if (mode === 'forgot-password') {
        await resetPassword(email);
        setSuccessMsg('Password reset email sent. Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md p-8 bg-surface border border-accent/20 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-muted hover:text-text transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'signup' && 'Create an Account'}
                {mode === 'forgot-password' && 'Reset Password'}
              </h2>
              <p className="text-sm text-muted">
                {mode === 'forgot-password' 
                  ? 'Enter your email to receive a password reset link.'
                  : 'Your passwords never leave your browser — signing in only saves your score history.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-background border border-accent/20 rounded-lg py-2.5 pl-10 pr-4 text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot-password' && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-background border border-accent/20 rounded-lg py-2.5 pl-10 pr-4 text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      required
                    />
                  </div>
                  {mode === 'signin' && (
                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => { setMode('forgot-password'); setError(''); setSuccessMsg(''); }}
                        className="text-xs text-accent hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (
                  mode === 'signin' ? 'Sign In' :
                  mode === 'signup' ? 'Sign Up' :
                  'Send Reset Link'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-surface-hover" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-muted">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="button"
                  className="w-full bg-white text-black hover:bg-gray-100" 
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={handleClose}
                >
                  Continue as Guest
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted">
              {mode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }} className="text-accent hover:underline">
                    Sign up
                  </button>
                </p>
              ) : mode === 'signup' ? (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }} className="text-accent hover:underline">
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  Remember your password?{' '}
                  <button onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }} className="text-accent hover:underline">
                    Back to sign in
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
