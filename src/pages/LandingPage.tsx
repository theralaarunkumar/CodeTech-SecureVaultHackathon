import { motion } from 'framer-motion';
import { ShieldCheck, Lock, EyeOff, ArrowRight, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';

const TypewriterWidget = () => {
  const passwords = [
    { text: 'password123', risk: 'Critical', desc: 'Found in 2,254,650 breaches', color: 'text-danger', bg: 'bg-danger/10' },
    { text: 'P@ssw0rd2024', risk: 'Medium', desc: '17 minutes to crack', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { text: 'S3cur3V@ult!', risk: 'Good', desc: 'Centuries to crack', color: 'text-accent', bg: 'bg-accent/10' },
    { text: 'Kj#9mP$vL2!qN8', risk: 'Strong', desc: 'Centuries to crack', color: 'text-accent', bg: 'bg-accent/10' }
  ];
  
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (subIndex === passwords[index].text.length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), 1500);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % passwords.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, Math.max(isDeleting ? 50 : 100, Math.random() * 150));

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, passwords]);

  const current = passwords[index];

  return (
    <div className="relative flex flex-col justify-center w-full max-w-sm mx-auto h-24 bg-surface/80 backdrop-blur-sm border border-accent/20 rounded-2xl shadow-lg shadow-accent/5 px-6">
      <div className="text-left font-mono text-lg font-bold flex items-center">
        <span className={current.color}>{current.text.substring(0, subIndex)}</span>
        <span className="w-2 h-5 bg-muted ml-1 animate-pulse"></span>
      </div>
      {subIndex === current.text.length + 1 && (
        <motion.span 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`text-xs ${current.color} font-sans mt-2 ${current.bg} px-2 py-0.5 rounded-full inline-flex w-fit`}
        >
          {current.risk} · {current.desc}
        </motion.span>
      )}
    </div>
  );
};

const AnimatedTitleWord = () => {
  const word = "Audited.";
  const [length, setLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && length === word.length) {
        const pause = setTimeout(() => setIsDeleting(true), 2000);
        return () => clearTimeout(pause);
      }
      if (isDeleting && length === 0) {
        setIsDeleting(false);
        return;
      }
      setLength(prev => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 75 : 150);

    return () => clearTimeout(timeout);
  }, [length, isDeleting]);

  return (
    <span className="text-accent inline-flex items-center min-w-[5ch]">
      {word.substring(0, length)}
      <motion.span 
        animate={{ opacity: [1, 0, 1] }} 
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[4px] h-[0.8em] bg-accent ml-1"
      />
    </span>
  );
};

const HeroGraphic = () => {
  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
      {/* Outer rotating dashed ring */}
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-accent/20"
      />
      
      {/* Inner pulsing ring */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-8 rounded-full border border-accent/40 bg-accent/5"
      />

      {/* Floating Icons */}
      <motion.div 
        animate={{ y: [0, -15, 0] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-12 left-12 bg-surface p-4 rounded-xl border border-accent/20 shadow-lg shadow-accent/10 z-20"
      >
        <Lock className="w-8 h-8 text-warning" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, 20, 0] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-16 right-8 bg-surface p-4 rounded-xl border border-accent/20 shadow-lg shadow-accent/10 z-20"
      >
        <ShieldCheck className="w-10 h-10 text-accent" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -10, 0], x: [0, 10, 0] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 -right-4 bg-surface p-3 rounded-xl border border-accent/20 shadow-lg shadow-accent/10 z-20"
      >
        <Key className="w-6 h-6 text-danger" />
      </motion.div>

      {/* The existing TypewriterWidget in the center! */}
      <div className="relative z-30 w-full px-4">
        <TypewriterWidget />
      </div>
    </div>
  );
};


export const LandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 py-8 sm:py-12 lg:pt-8 lg:pb-16">
          {/* Subtle dot pattern background */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(#00D4AA_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
          
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid lg:grid-cols-2 gap-8 lg:gap-6 items-center"
            >
              <div className="space-y-5 text-center lg:text-left">
                <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm text-accent">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Enterprise-Grade Security Analysis
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight lg:leading-tight">
                  Your passwords. <br />
                  <AnimatedTitleWord />
                  <br />
                  Never exposed.
                </motion.h1>
                
                <motion.p variants={itemVariants} className="mx-auto lg:mx-0 max-w-xl text-lg text-muted sm:text-xl">
                  Discover vulnerabilities in your credentials before attackers do. 
                  Our zero-knowledge architecture ensures your data never leaves your browser.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 mt-6 justify-center lg:justify-start">
                  <Button size="lg" onClick={() => navigate('/analyze')} className="group">
                    Audit my passwords
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </div>

              {/* Custom Typewriter Graphic moved to right column */}
              <motion.div variants={itemVariants} className="flex justify-center lg:justify-end mt-8 lg:mt-0 lg:pl-10">
                <div className="w-full max-w-md">
                  <HeroGraphic />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-accent/10 bg-surface/30 px-4 py-24 scroll-mt-16">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
              <p className="mt-4 text-muted">Three simple steps to better security hygiene.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: '1. Paste your list',
                  description: 'Input your passwords directly or paste from a CSV. Everything stays in your browser memory.',
                  icon: Lock,
                },
                {
                  title: '2. Local Analysis',
                  description: 'We run advanced heuristics and checks against breached databases using k-anonymity.',
                  icon: EyeOff,
                },
                {
                  title: '3. Get Insights',
                  description: 'Review your personalized dashboard with AI-powered suggestions to fix vulnerabilities.',
                  icon: ShieldCheck,
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col items-center rounded-2xl border border-accent/10 bg-surface p-8 text-center transition-colors hover:border-accent/30"
                >
                  <div className="mb-4 rounded-full bg-accent/10 p-4 text-accent">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="text-muted">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="px-4 py-24 scroll-mt-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container mx-auto max-w-4xl text-center"
          >
            <h2 className="mb-8 text-3xl font-bold tracking-tight">How we protect your data</h2>
            <div className="prose prose-invert mx-auto">
              <p className="text-lg text-muted">
                SecureVault is built on the principle of zero-trust. When you analyze your passwords,
                the raw text never leaves your device. We use <strong>k-anonymity</strong> to check for breaches—sending
                only the first 5 characters of a SHA-1 hash to the haveibeenpwned API.
                The full analysis happens locally in your browser.
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};
