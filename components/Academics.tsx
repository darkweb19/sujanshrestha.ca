import { education } from "@/lib/portfolio";
export default function Academics() {
 return <section id="academics" className="portfolio-section education-section">
  <div className="section-container">
   <header className="section-heading"><h2 className="section-kicker">Academics</h2><p className="section-title">Always learning.</p></header>
   <ol className="education-list">{education.map(item=><li key={item.level}>
    <details className="content-disclosure education-disclosure">
     <summary><span className="timeline-date">{item.year}</span><span><span className="education-degree">{item.level}</span><span className="education-institution">{item.institution}</span></span><span className="disclosure-mark" aria-hidden="true">+</span></summary>
     <div className="career-body disclosure-body"><p>{item.description}</p><p>{item.country==="canada"?"Canada":"Nepal"}</p></div>
    </details>
   </li>)}</ol>
   <p className="education-note">From the foothills of the Himalayas to the shores of Lake Ontario.</p>
  </div>
 </section>;
}
