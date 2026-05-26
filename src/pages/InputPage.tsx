import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const InputPage = () => {
  const [passwords, setPasswords] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (!passwords.trim()) return;
    
    // Split by new lines or commas and clean up
    const list = passwords
      .split(/[\n,]+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
      
    // Store in session storage for the dashboard to pick up
    // In a real app we might use a global state manager or context
    sessionStorage.setItem('securevault_passwords', JSON.stringify(list));
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Audit Your Passwords</h1>
          <p className="mt-4 text-muted">
            Paste your passwords below, one per line. They will be analyzed locally in your browser.
          </p>
        </div>

        <Card className="p-1">
          <div className="relative">
            <textarea
              value={passwords}
              onChange={(e) => setPasswords(e.target.value)}
              placeholder="p@ssw0rd123&#10;correcthorsebatterystaple&#10;hunter2"
              className="min-h-[300px] w-full resize-y rounded-lg bg-surface p-6 font-mono text-lg text-text placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {!passwords && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-muted/50">
                <UploadCloud className="mb-4 h-12 w-12" />
                <p>Paste text or CSV format</p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex items-center text-sm text-accent">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Analyzed in your browser. Never transmitted.
          </div>
          <Button 
            size="lg" 
            onClick={handleAnalyze}
            disabled={!passwords.trim()}
          >
            Analyze {passwords.trim() ? passwords.split(/[\n,]+/).filter(p => p.trim()).length : 0} Passwords
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
