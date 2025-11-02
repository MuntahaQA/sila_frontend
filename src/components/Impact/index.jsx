import React from "react";
import "./styles.css";


const stats=[
{label:"Registered Beneficiaries", value:"48,200+"},
{label:"Active Programs", value:"120+"},
{label:"Partners", value:"85+"},
{label:"Cities Covered", value:"50+"}
];


export default function Impact(){
return (
<section id="impact" className="section">
<div className="container">
<h2 className="title">Impact</h2>
<div className="grid impact__grid">
{stats.map((s,i)=> (
<div key={i} className="card impact__card">
<div className="impact__value">{s.value}</div>
<div className="impact__label text-dim">{s.label}</div>
</div>
))}
</div>
</div>
</section>
);
}