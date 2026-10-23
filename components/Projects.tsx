import { projects } from "@/lib/portfolio";
import Arrow from "@/components/common/Arrow";
import ProjectMedia from "./projects/ProjectMedia";
export default function Projects() {
 return <section id="projects" className="portfolio-section projects-section">
  <div className="section-container">
   <header className="projects-heading"><div><h2 className="section-kicker">Selected projects</h2><p className="section-title">Go on.<br/><span>Open something.</span></p></div><p className="project-section-note">Useful tools. A few experiments.<br/>Things I wanted to exist.</p></header>
   <div className="project-gallery">{projects.map(project=><article key={project.id} className={`project-tile tone-${project.tone} project-${project.id}`}>
    <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-launch" aria-label={`Open ${project.title}`}>
     <span className="project-mount"><span className="mini-browser"><span className="mini-chrome"><span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span>{new URL(project.url).hostname.replace('www.','')}</span><Arrow size={13}/></span><ProjectMedia project={project} large={project.featured}/></span><span className="project-open-label">Explore project <Arrow/></span></span>
    </a>
    <div className="project-caption"><div><p className="project-category">{project.category}</p><h3>{project.title}</h3><p className="project-summary">{project.summary}</p></div><a href={project.url} target="_blank" rel="noopener noreferrer" className="project-direct" aria-label={`Open ${project.title} ${project.live?'website':'repository'} in a new tab`}><Arrow size={20}/></a></div>
    <details className="project-facts"><summary>Project details</summary><p>{project.description}</p><div className="tech-list">{project.tech.map(tech=><span key={tech}>{tech}</span>)}</div>{project.source&&project.source!==project.url&&<a href={project.source} target="_blank" rel="noopener noreferrer">View source <Arrow size={14}/></a>}</details>
   </article>)}</div>
  </div>
 </section>;
}
