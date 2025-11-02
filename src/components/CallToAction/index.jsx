import React from "react";
import "./styles.css";


export default function CallToAction(){
return (
<section id="donate" className="section">
<div className="container">
<div className="cta card">
<h2 className="title cta__title">Create impact with us today</h2>
<p className="text-dim cta__text">Donate, sponsor, or publish your program via the partner portal.</p>
<div className="cta__buttons">
<a className="button button--primary" href="#">Donate Now</a>
<a id="partner" className="button" href="#">Become a Partner</a>
</div>
</div>
</div>
</section>
);
}