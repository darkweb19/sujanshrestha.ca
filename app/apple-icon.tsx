import { ImageResponse } from "next/og";

export const size = {
	width: 180,
	height: 180,
};
export const contentType = "image/png";

// Placeholder apple icon design — needs owner sign-off before ship.
export default async function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundImage: "linear-gradient(135deg, #6f4e37, #b08968)",
					borderRadius: 0,
				}}
			>
				<div
					style={{
						fontSize: 110,
						fontWeight: 700,
						color: "#ffffff",
						display: "flex",
					}}
				>
					S
				</div>
			</div>
		),
		{
			...size,
		},
	);
}
