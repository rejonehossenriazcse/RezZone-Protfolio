import React from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { EducationSection } from './EducationSection';
import { SkillsSection } from './SkillsSection';
import { LanguagesSection } from './LanguagesSection';
import { SocialsSection } from './SocialsSection';
import { ContactSection } from './ContactSection';
import { Footer } from './Footer';

export const PortfolioView: React.FC = () => {
  return (
    <div id="portfolio-view-container" className="min-h-screen flex flex-col selection:bg-blue-500 selection:text-white">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <EducationSection />
        <SkillsSection />
        <LanguagesSection />
        <SocialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};
