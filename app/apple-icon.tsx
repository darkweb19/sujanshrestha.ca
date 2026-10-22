import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default async function Icon() {
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
					alignItems: "center",
					justifyContent: "center",
					background: "white",
				}}
			>
				<img
					src={`data:image/svg+xml;base64,${monogram}`}
					width={88}
					height={110}
					alt=""
				/>
			</div>
		),
		size,
	);
}
