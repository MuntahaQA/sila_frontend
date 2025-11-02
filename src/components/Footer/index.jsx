import React from "react";
import "./styles.css";


export default function Footer(){
const year = new Date().getFullYear();
return (
<footer className="footer">
<div className="container footer__top">
<div>
<div className="footer__brand">SILA</div>
<p className="text-dim">A national platform for unified beneficiary data and secure integrations.</p>
</div>
<div>
<div className="footer__title">Links</div>
<ul className="footer__list">
<li><a href="#mission">Mission</a></li>
<li><a href="#programs">Programs</a></li>
<li><a href="#how">How it works</a></li>
<li><a href="#impact">Impact</a></li>
</ul>
</div>
<div>
<div className="footer__title">Contact</div>
<ul className="footer__list">
<li>info@sila.sa</li>
<li>+966 9200 000 00</li>
<li>www.sila.sa</li>
</ul>
</div>
<div>
<div className="footer__title">Location</div>
<p className="text-dim">Riyadh, Saudi Arabia</p>
</div>
</div>
<div className="footer__bottom">
<p>© {year} SILA. All rights reserved.</p>
<div className="footer__policy">
<a href="#">Privacy</a>
<a href="#">Terms</a>
</div>
</div>
</footer>
);
}