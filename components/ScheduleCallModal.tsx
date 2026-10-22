"use client";
import { useEffect, useRef, useState } from "react";
const APPOINTMENT_URL =
	"https://calendar.google.com/calendar/appointments/schedules/AcZssZ331o-aIQMcHXhJJauVR6l_PO4DVrWVsEUmOXRTEbi8co23c35KHsOIvXEaPa9MpWsDikVTWxVk?gv=true";
export default function ScheduleCallModal() {
	const [open, setOpen] = useState(false);
	const dialog = useRef<HTMLDialogElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (open) dialog.current?.showModal();
		else if (dialog.current?.open) dialog.current.close();
	}, [open]);
	const close = () => {
		setOpen(false);
		trigger.current?.focus();
	};
	return (
		<>
			<button
				ref={trigger}
				type="button"
				className="action"
				onClick={() => setOpen(true)}
			>
				Schedule a call
			</button>
			<dialog
				ref={dialog}
				aria-labelledby="schedule-title"
				onCancel={(event) => {
					event.preventDefault();
					close();
				}}
				onClose={close}
				className="schedule-dialog"
			>
				<div className="schedule-header">
					<div>
						<h2 id="schedule-title">Schedule a call</h2>
						<p>Choose an available time on my calendar.</p>
					</div>
					<button
						type="button"
						className="action"
						onClick={close}
						aria-label="Close scheduling dialog"
					>
						Close
					</button>
				</div>
				{open && (
					<iframe
						src={APPOINTMENT_URL}
						title="Sujan Shrestha appointment calendar"
						className="schedule-calendar"
					/>
				)}
				<p className="schedule-fallback">
					Calendar not loading?{" "}
					<a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer">
						Open Google Calendar
					</a>{" "}
					or <a href="mailto:hi@sujanshrestha.ca">email me</a>.
				</p>
			</dialog>
		</>
	);
}
