import React from "react";
import "./styles.css";


const programs=[
{name:"Tamkeen Program– Ministry of Human Resources and Social Development", kpi:"23,394 beneficiaries"},
{name:"Sakani Housing Program– Ministry of Municipal, Rural Affairs and Housing (MOMRAH)", kpi:"54,000 families"},
{name:"Ehsan Platform – Saudi Data and Artificial Intelligence Authority (SDAIA)", kpi:" 5 million beneficiaries"},
{name:"Social Security Program – Ministry of Human Resources and Social Development (HRSD)", kpi:"1,128,877 beneficiaries"},
{name:"Takaful School Support Program – Minstry of Education (MOE)", kpi:"+ 300,000 students"},
{name:"Home Healthcare Program –Ministry of Health (MOH)", kpi:"~60,000+ patients"}
];


export default function Programs(){
return (
<section id="programs" className="section">
<div className="container">
<div className="programs__header">
<h2 className="title">Programs & Partners</h2>
<a className="programs__addLink" href="#partner">Add your program ↗</a>
</div>
<div className="grid programs__grid">
{programs.map((p,i)=> (
<article key={i} className="card programs__card">
<h3 className="programs__name">{p.name}</h3>
<p className="programs__kpi">{p.kpi}</p>
</article>
))}
</div>
</div>
</section>
);
}