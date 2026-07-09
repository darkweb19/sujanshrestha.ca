"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export default function MotionProvider({ children }: { children: ReactNode }) {
	return (
		<LazyMotion features={domAnimation} strict>
			<MotionConfig reducedMotion="user">{children}</MotionConfig>
		</LazyMotion>
	);
}
