"use client";

import { m } from 'framer-motion';
import { ReactNode } from "react";

export function StaggerItem({
    children,
    className = "",
    direction = "up",
    id
}: {
    children: ReactNode;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
    id?: string;
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
        <m.div variants={itemVariants} className={className} id={id}>
            {children}
        </m.div>
    );
}
