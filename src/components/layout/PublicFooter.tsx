import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Infinity as InfinityIcon,
  Github,
  Twitter,
  Linkedin,
  Mail,
  X,
  Database,
  ShieldCheck,
  HelpCircle,
  FileText,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

type ModalType = 'faq' | 'contact' | 'docs' | 'privacy' | 'terms' | 'disclaimer' | null;

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does NutriLens recognize Bangladeshi dishes?",
    answer:
      "NutriLens utilizes targeted computer vision models fine-tuned on South Asian culinary dishes—including regional bhortas, tarkaris, fish curries, and lentil preparations—with dual Bangla and English naming conventions.",
  },
  {
    question: "Where does the nutritional data come from?",
    answer:
      "All nutrient values are grounded deterministically in the peer-reviewed FAO Food Composition Table for Bangladesh (FCTB 2013). Calculations never rely on unpredictable generative AI for math or macronutrient estimates.",
  },
  {
    question: "How are missing nutrient values handled?",
    answer:
      "In accordance with clinical standards, unknown or missing micronutrient records are preserved explicitly as NULL rather than converted to zero, preventing misleading claims or false dietary guarantees.",
  },
  {
    question: "Is local wet market price data live or simulated?",
    answer:
      "During this prototype stage, retail bazar pricing records from the Savar and Ashulia clusters carry explicit synthetic/demo labels to ensure transparent demonstration without misleading retail commitments.",
  },
  {
    question: "Can I adjust portions and ingredients manually?",
    answer:
      "Yes. NutriLens follows a Human-in-the-Loop workflow where you verify dish names, recipe preparation states, and gram weights before any final nutrient totals are calculated.",
  },
];

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    if (activeModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal]);

  // Subtle GSAP scroll-triggered entrance animation
  useEffect(() => {
    if (prefersReducedMotion() || !footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0.9, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer
        ref={footerRef}
        aria-label="Site Footer"
        className="relative text-xs overflow-hidden bg-cover bg-top bg-no-repeat text-slate-900"
        style={{ backgroundImage: "url('/images/footer-gradient.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-20 sm:pt-28 pb-14 sm:pb-20 space-y-12 sm:space-y-16">
          
          {/* Main 5-Column Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* 1. Brand Column (Span 4 on Desktop) */}
            <div className="col-span-2 md:col-span-6 lg:col-span-4 space-y-4">
              <Link to="/#home" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-slate-900/20 flex items-center justify-center p-1.5 shadow-sm group-hover:border-slate-950 transition-colors duration-200">
                  <img src="/logo.svg" alt="NutriLens Logo" className="w-full h-full" />
                </div>
                <div>
                  <span className="font-extrabold text-lg text-slate-950 tracking-tight font-sans block">
                    NutriLens
                  </span>
                  <span className="text-[10px] text-emerald-950 font-extrabold uppercase tracking-wider block -mt-0.5">
                    Nutrition Intelligence
                  </span>
                </div>
              </Link>

              {/* Tagline & Positioning */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-950">
                  Make smarter food choices. Live healthier.
                </p>
                <p className="text-slate-900 font-medium leading-relaxed text-xs max-w-sm">
                  Your intelligent nutrition companion. Discover what&apos;s on your plate, understand what your food provides, and make informed nutritional decisions every day.
                </p>
              </div>

              {/* Verified Source Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/10 backdrop-blur-md border border-slate-950/15 text-[11px] font-semibold text-slate-950">
                <Database className="w-3.5 h-3.5 text-emerald-950 shrink-0" />
                <span>Anchored in FAO FCTB (2013)</span>
              </div>

              {/* Social Media Links */}
              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-950 mb-2.5">
                  Connect With Us
                </p>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://github.com/iNFiTE-LOOP"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="NutriLens and iNFiTE LOOP on GitHub"
                    className="w-8 h-8 rounded-lg bg-slate-950/10 backdrop-blur-md border border-slate-950/15 flex items-center justify-center text-slate-950 hover:text-white hover:border-white/50 hover:bg-black/30 hover:scale-105 transition-all duration-150"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="iNFiTE LOOP on LinkedIn"
                    className="w-8 h-8 rounded-lg bg-slate-950/10 backdrop-blur-md border border-slate-950/15 flex items-center justify-center text-slate-950 hover:text-white hover:border-white/50 hover:bg-black/30 hover:scale-105 transition-all duration-150"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="NutriLens on X"
                    className="w-8 h-8 rounded-lg bg-slate-950/10 backdrop-blur-md border border-slate-950/15 flex items-center justify-center text-slate-950 hover:text-white hover:border-white/50 hover:bg-black/30 hover:scale-105 transition-all duration-150"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="mailto:team@infiteloop.tech"
                    aria-label="Email iNFiTE LOOP Team"
                    className="w-8 h-8 rounded-lg bg-slate-950/10 backdrop-blur-md border border-slate-950/15 flex items-center justify-center text-slate-950 hover:text-white hover:border-white/50 hover:bg-black/30 hover:scale-105 transition-all duration-150"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Platform Column (Span 2 on Desktop) */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-3.5">
              <h3 className="font-extrabold text-slate-950 uppercase tracking-wider text-[11px] font-sans">
                Platform
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="#home"
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 inline-block py-0.5"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 inline-block py-0.5"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 inline-block py-0.5"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#bangladesh-first"
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 inline-block py-0.5"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* 3. Explore Column (Span 2 on Desktop) */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-3.5">
              <h3 className="font-extrabold text-slate-950 uppercase tracking-wider text-[11px] font-sans">
                Explore
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/app/analyze"
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 inline-block py-0.5"
                  >
                    Food Recognition
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/report"
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 inline-block py-0.5"
                  >
                    Nutrition Analysis
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/meal-rescue"
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 inline-block py-0.5"
                  >
                    AI Recommendations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app"
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 inline-block py-0.5"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. Resources Column (Span 2 on Desktop) */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-3.5">
              <h3 className="font-extrabold text-slate-950 uppercase tracking-wider text-[11px] font-sans">
                Resources
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('faq')}
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 text-left py-0.5 focus:outline-none"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('contact')}
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 text-left py-0.5 focus:outline-none"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('docs')}
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 text-left py-0.5 focus:outline-none"
                  >
                    Documentation
                  </button>
                </li>
              </ul>
            </div>

            {/* 5. Legal Column (Span 2 on Desktop) */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-3.5">
              <h3 className="font-extrabold text-slate-950 uppercase tracking-wider text-[11px] font-sans">
                Legal
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 text-left py-0.5 focus:outline-none"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 text-left py-0.5 focus:outline-none"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('disclaimer')}
                    className="text-slate-950 font-semibold hover:text-white transition-colors duration-150 text-left py-0.5 focus:outline-none"
                  >
                    Nutrition Disclaimer
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Section: Copyright & Team Development Credit */}
          <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white">
            
            {/* Copyright */}
            <p className="text-white font-medium text-center md:text-left font-sans">
              © 2026 <span className="font-bold text-white">NutriLens</span>. All rights reserved.
            </p>

            {/* Development Credit - iNFiTE LOOP */}
            <div className="flex flex-col sm:flex-row items-center gap-2 text-white font-medium text-center sm:text-left">
              <div className="inline-flex items-center gap-2">
                <span className="text-white">Designed &amp; Developed by</span>
                <a
                  href="https://github.com/iNFiTE-LOOP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white tracking-wide inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-md border border-white/25 hover:border-white hover:bg-black/50 hover:text-white shadow-xs transition-all duration-150 group"
                >
                  <InfinityIcon className="w-3.5 h-3.5 text-white group-hover:rotate-180 transition-all duration-500" />
                  <span>iNFiTE LOOP</span>
                </a>
              </div>
              <span className="hidden sm:inline text-white/40">•</span>
              <span className="text-[11px] text-white/90 font-medium">
                Building intelligent digital experiences.
              </span>
            </div>

          </div>

        </div>
      </footer>

      {/* Accessible Interactive Resource & Legal Modals */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={closeModal}
        >
          <div
            className="max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-800 dark:text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-forest-border/80">
              <div className="flex items-center gap-2.5">
                {activeModal === 'faq' && <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {activeModal === 'contact' && <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {activeModal === 'docs' && <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {activeModal === 'privacy' && <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {activeModal === 'terms' && <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {activeModal === 'disclaimer' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeModal === 'faq' && 'Frequently Asked Questions'}
                  {activeModal === 'contact' && 'Contact iNFiTE LOOP'}
                  {activeModal === 'docs' && 'Technical Documentation'}
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms of Service'}
                  {activeModal === 'disclaimer' && 'Nutrition & Health Disclaimer'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close dialog"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-forest-border/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeModal === 'faq' && (
                <div className="space-y-4">
                  {FAQ_ITEMS.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root/60 border border-slate-200/70 dark:border-forest-border/60 space-y-1.5"
                    >
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.question}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="space-y-4">
                  <p>
                    NutriLens is designed and engineered by <strong className="text-slate-900 dark:text-white">iNFiTE LOOP</strong>. We welcome inquiries from developers, researchers, nutritionists, and institutional collaborators.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root/60 border border-slate-200/70 dark:border-forest-border/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">General &amp; Partnerships</span>
                      <a
                        href="mailto:team@infiteloop.tech"
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline block text-sm"
                      >
                        team@infiteloop.tech
                      </a>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root/60 border border-slate-200/70 dark:border-forest-border/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Engineering &amp; Support</span>
                      <a
                        href="mailto:support@nutrilens.ai"
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline block text-sm"
                      >
                        support@nutrilens.ai
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 space-y-1">
                    <span className="font-bold block text-xs">Development Headquarters</span>
                    <p className="text-xs leading-relaxed">
                      iNFiTE LOOP Studio — Dhaka, Bangladesh. Building intelligent digital experiences for global impact.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'docs' && (
                <div className="space-y-4">
                  <p>
                    NutriLens bridges computer vision recognition with validated scientific food composition data.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-forest-root/60 border border-slate-200/70 dark:border-forest-border/60">
                      <strong className="text-slate-900 dark:text-white block mb-0.5">Primary Nutritional Database</strong>
                      <span>Food Composition Table for Bangladesh (FCTB 2013), compiled by FAO, INFOODS, and the Institute of Nutrition and Food Science (INFS), University of Dhaka.</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-forest-root/60 border border-slate-200/70 dark:border-forest-border/60">
                      <strong className="text-slate-900 dark:text-white block mb-0.5">Deterministic Calculation Pipeline</strong>
                      <span>Strict mathematical formulas calculate macro- and micronutrients based on verified weight, cooking yield coefficients, and edible portion multipliers without generative hallucination.</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-forest-root/60 border border-slate-200/70 dark:border-forest-border/60">
                      <strong className="text-slate-900 dark:text-white block mb-0.5">Human-in-the-Loop Safeguards</strong>
                      <span>Candidate classifications always require user review of portion weight and dish identification before recording.</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="space-y-3 text-xs">
                  <p>
                    At NutriLens and iNFiTE LOOP, user privacy and data sovereignty are fundamental design requirements.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li><strong>Food Images:</strong> Plate photographs uploaded for analysis are processed solely to identify dish candidates and extract visual nutrition features. We do not sell or monetize personal images.</li>
                    <li><strong>Local Data &amp; Security:</strong> Authenticated account data, meal history, and custom targets are protected using Supabase Row-Level Security (RLS) policies.</li>
                    <li><strong>No Tracking Ad Networks:</strong> We do not integrate invasive third-party ad tracking or behavioral advertising pixels.</li>
                    <li><strong>User Control:</strong> You maintain the right to delete your logged meal entries and profile data at any time directly through your account dashboard.</li>
                  </ul>
                </div>
              )}

              {activeModal === 'terms' && (
                <div className="space-y-3 text-xs">
                  <p>
                    By accessing or using the NutriLens platform, you agree to these operational terms:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li><strong>Prototype &amp; Informational Scope:</strong> NutriLens is an AI-powered dietary intelligence research prototype intended for informational and personal nutritional awareness.</li>
                    <li><strong>Responsible Usage:</strong> You agree not to abuse the image analysis APIs, attempt unauthorized reverse engineering, or disrupt platform integrity.</li>
                    <li><strong>Intellectual Property:</strong> All interface designs, algorithmic workflows, and software implementations are proprietary intellectual property of NutriLens and iNFiTE LOOP.</li>
                  </ul>
                </div>
              )}

              {activeModal === 'disclaimer' && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200">
                    <p className="font-bold text-sm mb-1">Important Health &amp; Medical Notice</p>
                    <p className="leading-relaxed">
                      NutriLens provides nutritional calculations for general educational and informational awareness. It is not a medical diagnostic tool and is not intended to treat, cure, or diagnose any medical condition.
                    </p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Nutrition requirements vary significantly based on individual metabolic health, pregnancy, age, underlying conditions, and clinical factors. Always consult a qualified physician or registered dietitian before making significant changes to your diet.
                  </p>
                  <div className="pt-2">
                    <a
                      href="#trust"
                      onClick={closeModal}
                      className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <span>Review our Scientific Rigor &amp; Ethics Section</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-forest-border/80 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
