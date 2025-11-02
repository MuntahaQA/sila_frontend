import React from "react";
import "./styles.css";

export default function Hero() {
  return (
    <section id="home" className="hero section">
      <div className="overlay"></div> 
      <div className="container hero__inner">
        <div className="hero__text">
          <span className="badge">National platform linking beneficiaries and supporters</span>
          <h1 className="hero__title title">We turn good intentions into measurable impact.</h1>
          <p className="hero__subtitle text-dim">
            SILA connects charities, ministries, and society so people in need reach the right programs quickly and safely.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#donate">Donate Now</a>
            <a className="button" href="#how">See How It Works</a>
          </div>
        </div>
      </div>
    </section>
  );
}
