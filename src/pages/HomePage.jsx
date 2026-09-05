import { motion } from '../lib/motion-fix';
import { useState, useRef } from 'react';
import HeroSection from '../components/HeroSection';
import TaglineSection from '../components/TaglineSection';
import CardSection from '../components/CardSection';
import PortfolioGallery from '../components/PortfolioGallery';
import TextSection, { ContactButton } from '../components/TextSection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <TaglineSection />
      <CardSection />
      <PortfolioGallery />
      <TextSection />
      <ContactButton />
      <Footer />
    </main>
  );
}