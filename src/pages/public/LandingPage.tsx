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
      const sections = pageRef.current?.querySelectorAll('section');
      sections?.forEach((sec) => {
        gsap.fromTo(
          sec,
          { opacity: 0.85, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
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
