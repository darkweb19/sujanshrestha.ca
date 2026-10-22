import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
export const alt = "Sujan Shrestha — Full-Stack Software Engineer, Toronto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
	const monogram = await readFile(
		path.join(process.cwd(), "public/brand/monogram.svg"),
		"base64",
	);
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: 64,
					background: "#ffffff",
					color: "#171717",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<img
						src={`data:image/svg+xml;base64,${monogram}`}
						width={40}
						height={50}
						alt=""
					/>
					<span style={{ fontSize: 22, color: "#555555" }}>
						sujanshrestha.ca
					</span>
				</div>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<div
						style={{
							display: "flex",
							fontSize: 112,
							letterSpacing: -7,
							fontWeight: 600,
							lineHeight: 1.05,
						}}
					>
						Sujan Shrestha.
					</div>
					<div
						style={{
							display: "flex",
							fontSize: 30,
							color: "#555555",
							marginTop: 32,
						}}
					>
						Full-Stack Software Engineer · Toronto, CA
					</div>
				</div>
			</div>
		),
		size,
	);
}
