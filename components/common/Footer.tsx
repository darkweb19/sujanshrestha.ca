import Image from "next/image";
import Link from "next/link";
export default function Footer() {
 return <footer className="site-footer"><div className="section-container footer-inner">
  <div><Link href="/#home" className="brand-link" aria-label="Sujan Shrestha home"><Image src="/brand/monogram.svg" alt="" width={24} height={30} style={{width:24,height:30}} /><span>Sujan Shrestha</span></Link><p className="footer-copyright">Made with Next.js · All Rights Reserved © {new Date().getFullYear()}</p></div>
  <nav className="footer-links" aria-label="Footer"><Link href="/#home">Home</Link><Link href="/#projects">Projects</Link><Link href="/blogs">Blog</Link><Link href="/lab/codex">Lab</Link><a href="https://github.com/darkweb19" target="_blank" rel="noopener noreferrer">GitHub</a><Link href="/#home">Back to top ↑</Link></nav>
 </div></footer>;
}
