import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, XOctagon, Sparkles, Copy, RefreshCw, Download, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { checkPwnedPassword, evaluateZxcvbn, generateAiSuggestion } from '../lib/passwordUtils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Good' | 'Strong';

interface PasswordAnalysis {
  password: string;
  masked: string;
  risk: RiskLevel;
  issues: string[];
  aiSuggestion: string;
  score: number; // For the strength bar
  timeToCrack: string;
}

interface AnalysisResults {
  score: number;
  total: number;
  weakCount: number;
  reusedCount: number;
  breachedCount: number;
  details: PasswordAnalysis[];
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const runAnalysis = async () => {
      const stored = sessionStorage.getItem('securevault_passwords');
      if (!stored) {
        setLoading(false);
        return;
      }

      const passwords = JSON.parse(stored) as string[];
      if (passwords.length === 0) {
        setLoading(false);
        return;
      }

      // We use Promise.all to fetch HIBP and AI suggestions concurrently for all passwords
      const detailsPromises = passwords.map(async (p, i) => {
        // Evaluate Entropy
        const zxcvbnResult = evaluateZxcvbn(p);
        
        // Evaluate HIBP
        const breachCount = await checkPwnedPassword(p);
        const isBreached = breachCount > 0;
        
        // Check for Reuse
        const isReused = passwords.indexOf(p) !== i;
        
        let risk: RiskLevel;
        switch (zxcvbnResult.score) {
          case 0: risk = 'Critical'; break;
          case 1: risk = 'High'; break;
          case 2: risk = 'Medium'; break;
          case 3: risk = 'Good'; break;
          case 4: risk = 'Strong'; break;
          default: risk = 'Critical';
        }
        
        let pwdScore = 0;
        switch (zxcvbnResult.score) {
          case 0: pwdScore = 5; break;
          case 1: pwdScore = 25; break;
          case 2: pwdScore = 50; break;
          case 3: pwdScore = 75; break;
          case 4: pwdScore = 100; break;
        }
        
        const issues: string[] = [];
        
        // Add issues directly from zxcvbn warnings/suggestions
        if (zxcvbnResult.feedback.warning) {
          issues.push(zxcvbnResult.feedback.warning);
        }

        if (isBreached) {
          issues.push(`Found in ${breachCount.toLocaleString()} data breaches`);
        }
        if (isReused) {
          issues.push('Reused password');
        }

        const timeToCrack = String(zxcvbnResult.crackTimesDisplay.offlineSlowHashing1e4PerSecond);

        // Fetch AI Suggestion
        const aiSuggestion = await generateAiSuggestion(issues);

        return {
          password: p,
          masked: p.substring(0, 2) + '*'.repeat(Math.max(0, p.length - 2)),
          risk,
          issues,
          aiSuggestion,
          score: pwdScore,
          timeToCrack
        } as PasswordAnalysis;
      });

      const details = await Promise.all(detailsPromises);

      // Compute statistics based on formula: start at 100
      let scoreAcc = 100;
      let weakCount = 0;
      let reusedCount = 0;
      let breachedCount = 0;

      details.forEach(d => {
        if (d.risk === 'Critical' || d.risk === 'High' || d.risk === 'Medium') {
          weakCount++;
          scoreAcc -= 20;
        }
        if (d.issues.some(i => i.toLowerCase().includes('reused'))) {
          reusedCount++;
          scoreAcc -= 15;
        }
        if (d.issues.some(i => i.toLowerCase().includes('breach'))) {
          breachedCount++;
          scoreAcc -= 25;
        }
      });

      const finalScore = Math.max(0, scoreAcc);

      if (finalScore === 100) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00D4AA', '#F8FAFC', '#34D399']
        });
      }

      setResults({
        score: finalScore,
        total: passwords.length,
        weakCount,
        reusedCount,
        breachedCount,
        details
      });
      setLoading(false);

      if (user) {
        try {
          // Check if we already saved this specific session to avoid double saves on strict mode
          if (!sessionStorage.getItem('securevault_scan_saved')) {
            await addDoc(collection(db, 'scan_history'), {
              user_id: user.uid,
              scanned_at: serverTimestamp(),
              total_count: passwords.length,
              weak_count: weakCount,
              reused_count: reusedCount,
              breached_count: breachedCount,
              health_score: finalScore
            });
            sessionStorage.setItem('securevault_scan_saved', 'true');
          }
        } catch (e) {
          console.error("Error saving scan history:", e);
        }
      }
    };

    runAnalysis();
    
    return () => {
      // Clear the save flag when component unmounts so next audit can be saved
      sessionStorage.removeItem('securevault_scan_saved');
    };
  }, [user]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!results) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
        <Shield className="mb-6 h-24 w-24 text-accent/20" />
        <h2 className="mb-2 text-2xl font-bold">No passwords analyzed</h2>
        <p className="mb-8 text-muted">Input your passwords to get a comprehensive security audit.</p>
        <Button onClick={() => navigate('/analyze')}>Start Audit</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col items-center justify-between md:flex-row print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-text">Security Dashboard</h1>
          <p className="text-sm text-muted">Analysis complete. Review your health score below.</p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={() => navigate('/analyze')}>
            <RefreshCw className="mr-2 h-4 w-4" /> New Audit
          </Button>
        </div>
      </div>
      
      {/* Print-only Header */}
      <div className="hidden print:flex mb-6 border-b border-accent/20 pb-4 items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">SecureVault Security Audit</h1>
          <p className="text-sm text-muted">Generated Report</p>
        </div>
        <p className="text-sm font-mono text-accent">securevault.vercel.app</p>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-5">
        {/* Score Ring */}
        <Card className="flex flex-col items-center justify-center p-4 lg:col-span-1 print:border-none print:shadow-none border-accent/20 bg-gradient-to-br from-surface to-accent/5 shadow-lg shadow-accent/5 hover:border-accent/40 transition-all cursor-default">
          <div className="relative flex h-28 w-28 items-center justify-center mb-2">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-surface-hover stroke-current"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              ></circle>
              <motion.circle
                className={results.score <= 30 ? 'text-danger stroke-current' : results.score <= 60 ? 'text-orange-500 stroke-current' : results.score <= 80 ? 'text-warning stroke-current' : 'text-accent stroke-current'}
                strokeWidth="8"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray: `${(Math.max(2, results.score) / 100) * 251.2} 251.2` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              ></motion.circle>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold">{results.score}</span>
              <span className="block text-[10px] text-muted">/ 100</span>
            </div>
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted text-center print:hidden">Overall Health</h3>
          {results.score < 20 && (
            <p className="mt-2 text-[10px] font-bold text-danger text-center print:hidden">
              Critical — immediate action needed
            </p>
          )}
          {/* Print Fallback */}
          <p className="hidden print:block mt-2 text-lg font-bold text-center">
            Overall Health Score: {results.score} / 100
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:col-span-4">
          <StatCard title="Total Audited" value={results.total} icon={Shield} />
          <StatCard title="Weak Passwords" value={results.weakCount} icon={AlertTriangle} color="warning" />
          <StatCard title="Reused" value={results.reusedCount} icon={Copy} color="warning" />
          <StatCard title="Breached" value={results.breachedCount} icon={XOctagon} color="danger" />
        </div>
      </div>

      <h2 className="mb-4 text-xl font-bold">Password Breakdown</h2>
      <div className="space-y-4">
        {results.details.map((item, index) => (
          <PasswordCard key={index} item={item} index={index} />
        ))}
      </div>
    </div>
  );
};

const PasswordCard = ({ item, index }: { item: PasswordAnalysis, index: number }) => {
  const [copied, setCopied] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generateSecurePassword = (e: React.MouseEvent) => {
    e.stopPropagation();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    const array = new Uint32Array(16);
    window.crypto.getRandomValues(array);
    let newPwd = '';
    for (let i = 0; i < 16; i++) {
      newPwd += chars[array[i] % chars.length];
    }
    
    setGeneratedPassword(newPwd);
    navigator.clipboard.writeText(newPwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const borderColors: Record<RiskLevel, string> = {
    Critical: '#EF4444',
    High: '#EF4444',
    Medium: '#F97316',
    Good: '#EAB308',
    Strong: '#00D4AA'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className="overflow-hidden print:break-inside-avoid print:mb-4 print:border-muted/30 transition-all hover:shadow-lg hover:bg-surface-hover/40 bg-surface/80"
        style={{ borderLeftWidth: '4px', borderLeftColor: borderColors[item.risk] }}
      >
        <div className="flex flex-col p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1">
            <div className="flex items-center space-x-4">
              <span className="font-mono text-xl tracking-wider">{item.masked}</span>
              <RiskBadge risk={item.risk} />
            </div>
          </div>
          
          <div className="hidden sm:flex items-center space-x-6 print:hidden">
             {item.issues.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-sm text-muted">{item.issues.length} issue(s)</span>
                </div>
              )}
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="pt-4 border-t border-surface-hover mt-2 grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-muted mb-3">Strength Score</h4>
              <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden mb-4 print:border print:border-muted/30">
                <div 
                  className="h-full transition-all duration-1000 ease-out" 
                  style={{ 
                    width: `${item.score}%`, 
                    backgroundColor: borderColors[item.risk] 
                  }}
                />
              </div>
              
              {item.issues.length > 0 && (
                <>
                  <h4 className="text-sm font-medium text-muted mb-2 mt-4">Detected Issues</h4>
                  <ul className="space-y-2">
                    {item.issues.map((issue, i) => (
                      <li key={i} className="text-sm flex items-start">
                        <span className="mr-2 mt-0.5 text-danger">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted mb-1">Time to Crack</h4>
                <p className="text-sm font-mono text-text">{item.timeToCrack}</p>
              </div>
            </div>

            <div className="rounded-lg bg-surface-hover p-4 border border-accent/10 print:bg-transparent print:border-muted/50 flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center text-sm font-medium text-accent print:text-text">
                  <Sparkles className="mr-2 h-3 w-3" /> AI Suggestion
                </div>
                {item.issues.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 text-xs print:hidden" 
                    onClick={generateSecurePassword}
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Generate replacement
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted leading-relaxed">{item.aiSuggestion}</p>
              {generatedPassword && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 flex items-center space-x-2 print:hidden"
                >
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedPassword} 
                    className="flex-1 bg-background border border-surface-hover rounded-md px-3 py-1.5 text-accent font-mono text-sm focus:outline-none"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(generatedPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="px-3 py-1.5"
                  >
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const RiskBadge = ({ risk }: { risk: RiskLevel }) => {
  const colors: Record<RiskLevel, string> = {
    Critical: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30',
    High: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30',
    Medium: 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30',
    Good: 'bg-[#EAB308]/20 text-[#EAB308] border-[#EAB308]/30',
    Strong: 'bg-[#00D4AA]/20 text-[#00D4AA] border-[#00D4AA]/30',
  };

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', colors[risk])}>
      {risk}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, color = 'default' }: any) => {
  const colorClass = 
    color === 'danger' ? 'text-danger' : 
    color === 'warning' ? 'text-warning' : 
    'text-accent';

  return (
    <Card className="flex flex-col justify-center p-4 hover:bg-surface-hover/50 hover:border-surface-hover transition-all group cursor-default print:border-surface-hover">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-text transition-colors">{title}</h3>
        <Icon className={cn('h-4 w-4', colorClass)} />
      </div>
      <p className="text-2xl font-bold group-hover:text-accent transition-colors">{value}</p>
    </Card>
  );
};

const DashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="mb-8 flex justify-between">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-surface-hover"></div>
        <div className="h-4 w-64 animate-pulse rounded-md bg-surface-hover"></div>
      </div>
    </div>
    
    <div className="mb-12 grid gap-8 lg:grid-cols-3">
      <Card className="flex h-64 items-center justify-center lg:col-span-1">
        <div className="h-48 w-48 animate-pulse rounded-full bg-surface-hover"></div>
      </Card>
      <div className="grid grid-cols-2 gap-4 lg:col-span-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="h-32 p-6">
            <div className="flex justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-surface-hover"></div>
              <div className="h-6 w-6 animate-pulse rounded-full bg-surface-hover"></div>
            </div>
            <div className="mt-4 h-10 w-16 animate-pulse rounded bg-surface-hover"></div>
          </Card>
        ))}
      </div>
    </div>

    <div className="h-8 w-48 animate-pulse rounded-md bg-surface-hover mb-6"></div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="h-24 animate-pulse bg-surface-hover"></Card>
      ))}
    </div>
  </div>
);
