import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Mission from "../../components/Mission";
import Programs from "../../components/Programs";
import HowItWorks from "../../components/HowItWorks";
import Impact from "../../components/Impact";
import CallToAction from "../../components/CallToAction";
import Footer from "../../components/Footer";
import MinistryDashboard from "../../components/MinistryDashboard";
import "./styles.css";

export default function HomePage() {
  const { isAuthenticated, isMinistryUser } = useAuth();

  return (
    <main>
      <Navbar />
      {isAuthenticated && isMinistryUser ? (
        // Ministry User Home Page - Specialized Dashboard
        <>
          <MinistryDashboard />
          <Footer />
        </>
      ) : (
        // Public/Regular User Home Page (Landing Page)
        <>
          <Hero />
          <Mission />
          <Programs />
          <HowItWorks />
          <Impact />
          <CallToAction />
          <Footer />
        </>
      )}
    </main>
  );
}
