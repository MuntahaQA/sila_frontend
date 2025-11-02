import React from "react";
import "./styles.css";


const steps=[
{n:1, title:"Sign Up", text:"Create an account and verify your identity and documents."},
{n:2, title:"Smart Matching", text:"Our engine suggests the best programs for each case."},
{n:3, title:"Referral & Approval", text:"Partners and ministries review and approve fast."},
{n:4, title:"Track Impact", text:"Dashboards and KPIs show real outcomes."}
];


export default function HowItWorks(){
return (
<section id="how" className="section">
<div className="container">
<h2 className="title">How it works</h2>
<ol className="grid how__grid">
{steps.map((s)=> (
<li key={s.n} className="card how__step">
<span className="how__badge">{s.n}</span>
<h3 className="how__title">{s.title}</h3>
<p className="text-dim">{s.text}</p>
</li>
))}
</ol>
</div>
</section>
);
}
