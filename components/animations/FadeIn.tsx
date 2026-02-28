"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    duration?: number;
    className?: string;
    viewportMargin?: string;
}

export function FadeIn({
    children,
    delay = 0,
    direction = "up",
    duration = 0.5,
    className = "",
    viewportMargin = "-50px",
}: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: viewportMargin as any });

    const getInitialOffset = () => {
        switch (direction) {
            case "up":
                return { y: 30, opacity: 0 };
            case "down":
                return { y: -30, opacity: 0 };
            case "left":
                return { x: 30, opacity: 0 };
            case "right":
                return { x: -30, opacity: 0 };
            default:
                return { opacity: 0 };
        }
    };

    const initial = getInitialOffset();

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={isInView ? { x: 0, y: 0, opacity: 1 } : initial}
            transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({
    children,
    delayChildren = 0.1,
    staggerChildren = 0.1,
    className = "",
    viewportMargin = "-50px"
}: {
    children: ReactNode;
    delayChildren?: number;
    staggerChildren?: number;
    className?: string;
    viewportMargin?: string;
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
        <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = "",
    direction = "up"
}: {
    children: ReactNode;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
}) {
    const getInitialOffset = () => {
        switch (direction) {
            case "up":
                return { y: 30, opacity: 0 };
            case "down":
                return { y: -30, opacity: 0 };
            case "left":
                return { x: 30, opacity: 0 };
            case "right":
                return { x: -30, opacity: 0 };
            default:
                return { opacity: 0 };
        }
    };

    const itemVariants = {
        hidden: getInitialOffset(),
        show: {
            y: 0,
            x: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] },
        },
    };

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}
