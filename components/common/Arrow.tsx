export default function Arrow({
	down = false,
	size = 16,
}: {
	down?: boolean;
	size?: number;
}) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{down ? (
				<path d="M12 4v16m-6-6 6 6 6-6" />
			) : (
				<path d="M5 19 19 5M5 5h14v14" />
			)}
		</svg>
	);
}
