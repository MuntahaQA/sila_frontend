import React from "react";
import "./styles.css";


const items = [
{title:"Empowerment", text:"Help people reach the right support faster."},
{title:"Transparency", text:"Strong verification and measurable outcomes."},
{title:"Integration", text:"Secure data exchange with ministries and partners."}
];


export default function Mission(){
return (
<section id="mission" className="section">
<div className="container">
<h2 className="title mission__title">Our Mission</h2>
<div className="grid mission__grid">
{items.map((m, i)=> (
<div key={i} className="card mission__card">
<h3 className="mission__cardTitle">{m.title}</h3>
<p className="text-dim">{m.text}</p>
</div>
))}
</div>
</div>
</section>
);
}