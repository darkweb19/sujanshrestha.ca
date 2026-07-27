import { ImageResponse } from "next/og";

export const alt = "Sujan Shrestha — Full-Stack Software Engineer";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

// Placeholder OG image design — needs owner sign-off before ship.
export default async function Image() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#fafafa",
					backgroundImage:
						"linear-gradient(to bottom, rgba(243,231,211,0.85), rgba(243,231,211,0))",
					position: "relative",
				}}
			>
				<div
					style={{
						fontSize: 90,
						fontWeight: 700,
						color: "#0a0a0a",
						display: "flex",
					}}
				>
					Sujan Shrestha
				</div>
				<div
					style={{
						fontSize: 36,
						color: "#6f4e37",
						marginTop: 20,
						display: "flex",
					}}
				>
					Full-Stack Software Engineer
				</div>
				<div
					style={{
						fontSize: 24,
						color: "#71717a",
						marginTop: 32,
						fontFamily: "monospace",
						display: "flex",
					}}
				>
					sujanshrestha.ca
				</div>
			</div>
		),
		{
			...size,
		},
	);
}
