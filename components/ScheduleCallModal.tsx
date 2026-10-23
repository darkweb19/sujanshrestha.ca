"use client";
import { useState } from "react";
import Modal from "./common/Modal";
const APPOINTMENT_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ331o-aIQMcHXhJJauVR6l_PO4DVrWVsEUmOXRTEbi8co23c35KHsOIvXEaPa9MpWsDikVTWxVk?gv=true";
export default function ScheduleCallModal() {
 const [open,setOpen]=useState(false);
 return <>
  <button type="button" className="action" onClick={()=>setOpen(true)}>Schedule a call</button>
  {open&&<Modal labelledBy="schedule-title" className="schedule-dialog" onClose={()=>setOpen(false)}>
   <div className="schedule-header"><div><h2 id="schedule-title">Schedule a call</h2><p>Choose an available time on my calendar.</p></div><button data-modal-close type="button" className="action" onClick={()=>setOpen(false)} aria-label="Close scheduling dialog">Close</button></div>
   <iframe src={APPOINTMENT_URL} title="Sujan Shrestha appointment calendar" className="schedule-calendar"/>
   <p className="schedule-fallback">Calendar not loading? <a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer">Open Google Calendar</a> or <a href="mailto:hi@sujanshrestha.ca">email me</a>.</p>
  </Modal>}
 </>;
}
