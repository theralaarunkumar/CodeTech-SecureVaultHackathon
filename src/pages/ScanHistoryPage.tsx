import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Copy, XOctagon } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';

interface ScanHistory {
  id: string;
  scanned_at: { seconds: number; nanoseconds: number };
  total_count: number;
  weak_count: number;
  reused_count: number;
  breached_count: number;
  health_score: number;
}

export const ScanHistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'scan_history'),
          where('user_id', '==', user.uid),
          orderBy('scanned_at', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const scans = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ScanHistory[];
        
        setHistory(scans);
      } catch (error) {
        console.error("Error fetching scan history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="mx-auto h-16 w-16 text-muted mb-4" />
        <h2 className="text-2xl font-bold mb-2">No scans yet</h2>
        <p className="text-muted">Run your first audit to start building your security timeline.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Scan History</h1>
        <p className="text-sm text-muted">Review your past security audits.</p>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-hover before:to-transparent">
        {history.map((scan, index) => {
          const date = new Date(scan.scanned_at.seconds * 1000);
          const scoreColor = scan.health_score <= 30 ? 'text-danger' : scan.health_score <= 60 ? 'text-orange-500' : scan.health_score <= 80 ? 'text-warning' : 'text-accent';

          return (
            <motion.div 
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-surface bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-accent/10">
                <div className={`w-3 h-3 rounded-full bg-current ${scoreColor}`}></div>
              </div>
              
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border-accent/10 hover:border-accent/30 transition-all bg-surface/50">
                <div className="flex items-center justify-between mb-4">
                  <time className="text-xs font-mono text-muted">
                    {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </time>
                  <div className={`text-xl font-bold ${scoreColor}`}>
                    {scan.health_score} <span className="text-xs text-muted">/100</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center p-2 rounded bg-surface border border-surface-hover">
                    <Shield className="w-3 h-3 mr-2 text-muted" />
                    <span>{scan.total_count} Total</span>
                  </div>
                  <div className="flex items-center p-2 rounded bg-danger/5 border border-danger/10">
                    <XOctagon className="w-3 h-3 mr-2 text-danger" />
                    <span className="text-danger">{scan.breached_count} Breached</span>
                  </div>
                  <div className="flex items-center p-2 rounded bg-warning/5 border border-warning/10">
                    <AlertTriangle className="w-3 h-3 mr-2 text-warning" />
                    <span className="text-warning">{scan.weak_count} Weak</span>
                  </div>
                  <div className="flex items-center p-2 rounded bg-warning/5 border border-warning/10">
                    <Copy className="w-3 h-3 mr-2 text-warning" />
                    <span className="text-warning">{scan.reused_count} Reused</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
