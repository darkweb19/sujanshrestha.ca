"use client";
import { useEffect, useRef, useState } from "react";
export default function Contact() {
 const [message,setMessage]=useState("");
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const copy=async()=>{try{await navigator.clipboard.writeText("hi@sujanshrestha.ca");setMessage("Email copied");}catch{setMessage("Copy unavailable. Select the email above or use the email link.");}if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setMessage(""),5000);};
 return <section id="contact" className="contact-section"><div className="section-container"><header className="section-heading"><h2 className="section-kicker">Contact</h2><p className="section-title">Let&apos;s connect.</p></header><div className="about-grid"><div /><div><p className="contact-intro">Whether you have a project in mind, want to collaborate, or just want to say hello – I&apos;d love to hear from you!</p><a href="mailto:hi@sujanshrestha.ca" className="contact-email">hi@sujanshrestha.ca</a><div className="contact-links"><button type="button" onClick={()=>void copy()}>Copy email</button><a href="https://github.com/darkweb19" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://linkedin.com/in/sujansthadev" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="/blogs">Blog</a></div><p role="status" className="min-h-6 text-sm text-white/80">{message}</p></div></div></div></section>;
}
