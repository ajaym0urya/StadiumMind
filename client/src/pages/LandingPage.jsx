import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  FiArrowRight, FiCheckCircle, FiShield, FiZap, FiCpu,
  FiChevronRight, FiLock, FiBookOpen,
  FiUsers, FiAward, FiStar, FiSearch, FiLayers
} from 'react-icons/fi';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } } };

const FEATURES = [
  { icon: <FiBookOpen />, title: 'Interactive Learning', desc: 'Step-by-step guides through every phase of the election process.', color: 'var(--color-primary)' },
  { icon: <FiCpu />, title: 'AI Study Companion', desc: 'Ask complex questions about democratic processes and get instant, simplified answers.', color: 'var(--color-secondary)' },
  { icon: <FiLayers />, title: 'Visual Timelines', desc: 'Dynamic, animated timelines showing historical contexts and upcoming milestones.', color: 'var(--color-accent)' },
  { icon: <FiAward />, title: 'Gamified Quizzes', desc: 'Test your knowledge and earn badges as you master the election curriculum.', color: 'var(--color-primary)' },
  { icon: <FiSearch />, title: 'Neutral Research', desc: 'Access 100% factual, non-partisan data verified for accuracy.', color: 'var(--color-secondary)' },
  { icon: <FiUsers />, title: 'Civic Participation', desc: 'Learn how your single vote shapes the nation\'s democratic future.', color: 'var(--color-accent)' },
];

const STEPS = [
  { title: 'Voter Registration', desc: 'Learn the criteria and documents needed to register as a citizen voter.' },
  { title: 'Understanding Candidates', desc: 'How to research candidate profiles and understand their manifestos.' },
  { title: 'The Polling Station', desc: 'A virtual walkthrough of what happens inside the booth on election day.' },
  { title: 'The Counting Day', desc: 'Understanding EVMs, VVPATs, and how votes are securely tallied.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-dark relative overflow-x-hidden selection:bg-primary/30">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* ====== NAVBAR ====== */}
      <header className="sticky top-0 z-50 bg-bg-card/70 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <FiBookOpen size={20} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-text-primary">Elec<span className="text-primary">Tech</span></span>
              <div className="h-1 w-full bg-secondary/30 rounded-full mt-[-2px]" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/auth" className="text-sm font-semibold text-text-secondary hover:text-primary transition-all hidden md:block">
              Login
            </Link>
            <Link to="/auth" className="btn-primary flex items-center gap-2 group">
              Start Learning <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* ====== HERO ====== */}
      <section className="relative px-6 pt-20 pb-32 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 uppercase tracking-widest">
            <FiZap /> AI-First Election Education
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-text-primary leading-[1.1] mb-6">
            Master the <span className="text-primary">Art of</span> Democracy.
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-10 max-w-lg">
            Demystifying the election process through interactive AI-guided learning. 
            Understand your rights, the steps, and the impact of your vote.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/auth" className="btn-primary text-lg px-10 py-5 shadow-2xl shadow-primary/30">
              Launch Assistant
            </Link>
            <button className="px-8 py-5 rounded-2xl border-2 border-border font-bold text-text-primary hover:bg-bg-elevated transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-secondary/20 p-8">
            <div className="w-full h-full glass-card border-white/40 flex flex-col p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <FiCpu size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">CivicBot Assistant</h3>
                  <p className="text-xs text-accent font-bold">Online & Learning</p>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                <div className="p-4 rounded-2xl bg-bg-elevated text-sm text-text-secondary border border-border/50 max-w-[80%]">
                  Hello! I'm here to help you understand the election process. What would you like to know today?
                </div>
                <div className="p-4 rounded-2xl bg-primary text-sm text-white border border-primary/20 max-w-[80%] ml-auto">
                  How does the voter registration process work for first-time voters?
                </div>
                <div className="p-4 rounded-2xl bg-bg-elevated text-sm text-text-secondary border border-border/50">
                  Great question! It involves three main stages: Eligibility Check, Documentation, and Online Application. Shall we dive into the details?
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-border flex gap-2">
                <div className="h-10 flex-1 rounded-xl bg-bg-dark border border-border px-4 flex items-center text-text-muted text-xs">
                  Type your question...
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                  <FiArrowRight />
                </div>
              </div>
            </div>
          </div>
          {/* Floating Accents */}
          <motion.div 
            animate={{ y: [0, -20, 0] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-10 -right-10 glass-card p-6 border-primary/20"
          >
            <FiAward size={32} className="text-secondary" />
          </motion.div>
        </motion.div>
      </section>

      {/* ====== FEATURES GRID ====== */}
      <section className="px-6 py-32 bg-white dark:bg-bg-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-text-primary mb-4">Powerful Learning Features</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Designed to make civic education engaging, accessible, and 100% non-partisan.</p>
          </div>
          <motion.div 
            variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {FEATURES.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card p-10 hover:shadow-2xl transition-all group">
                <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 text-white shadow-lg transition-transform group-hover:scale-110" style={{ background: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== TIMELINE SECTION ====== */}
      <section className="px-6 py-32 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-black text-text-primary mb-6">The Journey to <span className="text-primary">the Polls</span></h2>
            <p className="text-lg text-text-secondary mb-10">We break down the complex democratic journey into bite-sized, actionable learning modules.</p>
            <div className="space-y-6">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    0{i + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-text-primary mb-1">{step.title}</h4>
                    <p className="text-sm text-text-secondary">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
             <div className="aspect-video rounded-[2.5rem] bg-primary/10 border border-primary/20 overflow-hidden shadow-2xl">
               <img src="https://images.unsplash.com/photo-1540910419892-f7ef7167f321?q=80&w=2070&auto=format&fit=crop" alt="Election Day" className="w-full h-full object-cover opacity-80" />
             </div>
          </div>
        </div>
      </section>

      {/* ====== CALL TO ACTION ====== */}
      <section className="px-6 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-primary rounded-[4rem] p-16 text-center text-white relative overflow-hidden shadow-3xl shadow-primary/40"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full -ml-24 -mb-24" />
          
          <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">Become an Informed Citizen.</h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto relative z-10">
            Join thousands of others who are mastering the democratic process through our AI-guided platform.
          </p>
          <Link to="/auth" className="inline-block bg-white text-primary px-12 py-6 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-xl relative z-10">
            Start My Education
          </Link>
        </motion.div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-border bg-white dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                <FiBookOpen size={20} />
              </div>
              <span className="text-2xl font-black tracking-tight text-text-primary">Elec<span className="text-primary">Tech</span></span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Empowering citizens through knowledge. The world's first AI-powered election education platform.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h5 className="font-bold text-text-primary mb-6">Platform</h5>
              <ul className="space-y-4 text-text-secondary text-sm">
                <li><a href="#" className="hover:text-primary transition-all">How it works</a></li>
                <li><a href="#" className="hover:text-primary transition-all">AI Assistant</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Curriculum</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-text-primary mb-6">Resources</h5>
              <ul className="space-y-4 text-text-secondary text-sm">
                <li><a href="#" className="hover:text-primary transition-all">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Non-Partisan Guide</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-text-primary mb-6">Legal</h5>
              <ul className="space-y-4 text-text-secondary text-sm">
                <li><a href="#" className="hover:text-primary transition-all">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Disclaimer</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border py-8 text-center text-text-muted text-sm">
          © 2026 ElecTech Education. Built for Democracy.
        </div>
      </footer>
    </div>
  );
}
