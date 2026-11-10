import React, { useEffect, useRef } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { HeroSection } from '../../components/landing/HeroSection';
import { ProblemSolutionSection } from '../../components/landing/ProblemSolutionSection';
import { HowItWorksSection } from '../../components/landing/HowItWorksSection';
import { IntelligenceFeaturesSection } from '../../components/landing/IntelligenceFeaturesSection';
import { BangladeshFoodSection } from '../../components/landing/BangladeshFoodSection';
import { BazarToPlateSection } from '../../components/landing/BazarToPlateSection';
import { ProductPreviewSection } from '../../components/landing/ProductPreviewSection';
import { TrustEvidenceSection } from '../../components/landing/TrustEvidenceSection';
import { FinalCTASection } from '../../components/landing/FinalCTASection';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

export const LandingPage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If reduced motion is preferred, preserve content visibility without transforms
    if (prefersReducedMotion() || Boolean(pageRef.current) === false) return;

    // Scoped GSAP animation context for safe lifecycle cleanup
    const ctx = gsap.context(() => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const sections = pageRef.current?.querySelectorAll('section');
      sections?.forEach((sec, idx) => {
        // Hero section immediate entrance
        if (idx === 0) {
          gsap.fromTo(
            sec,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
          );
          return;
        }

        // Pop-up reveal animation: on mobile triggers at 35vh-40vh from downward (bottom of screen)
        const sectionStart = isMobile ? 'top 65%' : 'top 60%'; // 35vh from bottom on mobile; 40vh on desktop
        const cardsStart = isMobile ? 'top 65%' : 'top 55%';

        gsap.fromTo(
          sec,
          { opacity: 0, y: isMobile ? 32 : 65, scale: isMobile ? 0.98 : 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: isMobile ? 0.6 : 0.8,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: sec,
              start: sectionStart,
              toggleActions: 'play none none none',
            },
          }
        );

        // Child content cards staggered pop-up entrance
        const innerCards = sec.querySelectorAll(':scope > div > .grid > div, :scope > div > div > .grid > div');
        if (innerCards && innerCards.length > 0) {
          gsap.fromTo(
            innerCards,
            { opacity: 0, y: isMobile ? 22 : 35, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.65,
              stagger: 0.08,
              ease: 'back.out(1.15)',
              clearProps: 'transform',
              scrollTrigger: {
                trigger: innerCards[0] || sec,
                start: cardsStart,
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-surface-lightRoot dark:bg-forest-root text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. Public Navigation with Announcement Bar */}
      <PublicNavbar />

      {/* Main Semantic Landmark */}
      <main id="main-content" className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Problem and Solution Section */}
        <ProblemSolutionSection />

        {/* 4. How It Works Section */}
        <HowItWorksSection />

        {/* 5. Core Intelligence Features Section */}
        <IntelligenceFeaturesSection />

        {/* 6. Bangladesh-First Food Intelligence Section */}
        <BangladeshFoodSection />

        {/* 7. Bazar-to-Plate Experience Section */}
        <BazarToPlateSection />

        {/* 8. Product Preview Section */}
        <ProductPreviewSection />

        {/* 9. Trust, Evidence and Transparency Section */}
        <TrustEvidenceSection />

        {/* 10. Final Call to Action Section */}
        <FinalCTASection />
      </main>

      {/* 11. Footer */}
      <PublicFooter />

    </div>
  );
};
