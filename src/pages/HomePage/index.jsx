import React from "react";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Mission from "../../components/Mission";
import Programs from "../../components/Programs";
import HowItWorks from "../../components/HowItWorks";
import Impact from "../../components/Impact";
import CallToAction from "../../components/CallToAction";
import Footer from "../../components/Footer";
import "./styles.css";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Mission />
      <Programs />
      <HowItWorks />
      <Impact />
      <CallToAction />
      <Footer />
    </main>
  );
}
