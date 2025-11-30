"use client";

import { motion } from "motion/react";
import React from "react";

export function ColourfulText({ text, underlined = false }: { text: string, underlined?: boolean }) {
    const colors = [
        "rgb(131, 179, 32)",
        "rgb(47, 195, 106)",
        "rgb(42, 169, 210)",
        "rgb(4, 112, 202)",
        "rgb(107, 10, 255)",
        "rgb(183, 0, 218)",
        "rgb(218, 0, 171)",
        "rgb(230, 64, 92)",
        "rgb(232, 98, 63)",
        "rgb(249, 129, 47)",
    ];

    return text.split("").map((char, index) => (
        <motion.span
            aria-hidden={true}
            key={`${char}-${index}`}
            initial={{
                y: 0,
            }}
            animate={{
                color: colors[index % colors.length],
                y: [0, -3, 0],
                scale: [1, 1.01, 1],
                filter: ["blur(0px)", `blur(5px)`, "blur(0px)"],
                opacity: [1, 0.8, 1],
            }}
            transition={{
                duration: 0.5,
                delay: index * 0.05,
            }}
            className="inline-block whitespace-pre font-sans tracking-tight"
            style={{
                textDecoration: underlined ? "underline" : "none",
            }}
        >
            {char}
        </motion.span>
    ));
}