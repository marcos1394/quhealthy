"use client";

import { m, useInView } from 'framer-motion';
import { useRef, ReactNode } from "react";

export function StaggerContainer({
 children,
 delayChildren = 0.1,
 staggerChildren = 0.1,
 className = "",
 viewportMargin = "-50px",
 id
}: {
 children: ReactNode;
 delayChildren?: number;
 staggerChildren?: number;
 className?: string;
 viewportMargin?: string;
 id?: string;
}) {
 const ref = useRef(null);
 const isInView = useInView(ref, { once: true, margin: viewportMargin as any });

 const containerVariants = {
 hidden: { opacity: 0 },
 show: {
 opacity: 1,
 transition: {
 staggerChildren,
 delayChildren,
 },
 },
 };

 return (
 <m.div
 ref={ref}
 variants={containerVariants}
 initial="hidden"
 animate={isInView ? "show" : "hidden"}
 className={className}
 id={id}
 >
 {children}
 </m.div>
 );
}
