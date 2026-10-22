"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
 { name: "About", href: "/#about" },
 { name: "Projects", href: "/#projects" },
 { name: "Experience", href: "/#experience" },
 { name: "Academics", href: "/#academics" },
 { name: "Blog", href: "/blogs" },
 { name: "Lab", href: "/lab/codex" },
 { name: "Contact", href: "/#contact" },
];
export default function Navbar() {
 const [open, setOpen] = useState(false);
 const toggle = useRef<HTMLButtonElement>(null);
 const pathname = usePathname();
 const close = () => setOpen(false);
 return <header className="site-header" onKeyDown={event => { if(event.key === "Escape" && open) { close(); toggle.current?.focus(); } }}>
  <div className="section-container header-inner">
   <Link href="/#home" className="brand-link" aria-label="Sujan Shrestha home" onClick={close}><Image src="/brand/wordmark.svg" alt="Sujan Shrestha" width={178} height={44} priority /></Link>
   <nav className="desktop-nav" aria-label="Primary">{links.map(link => <Link key={link.name} href={link.href} aria-current={pathname !== "/" && pathname.startsWith(link.href) ? "page" : undefined}>{link.name}</Link>)}</nav>
   <button ref={toggle} className="menu-toggle" type="button" aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-menu" onClick={()=>setOpen(!open)}>{open ? "Close" : "Menu"}</button>
  </div>
  {open && <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile">{[{name:"Home",href:"/#home"},...links].map(link=><Link key={link.name} href={link.href} onClick={close}>{link.name}</Link>)}</nav>}
 </header>;
}
