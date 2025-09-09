"use client";

import { motion } from "framer-motion";
import React from "react";
import { Squares } from "@/components/ui/squares-background";

export function SquaresBackgroundDemo() {
  return (
    <div className="relative min-h-screen bg-[#060606]">
      <Squares 
        direction="diagonal"
        speed={0.5}
        squareSize={40}
        borderColor="#333" 
        hoverFillColor="#222"
        className="absolute inset-0"
      />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 min-h-screen z-10"
      >
        <div className="text-3xl md:text-7xl font-bold text-white text-center">
          Squares background looks amazing.
        </div>
        <div className="font-extralight text-base md:text-4xl text-gray-300 py-4">
          Interactive and modern design.
        </div>
        <button className="bg-white text-black rounded-full w-fit px-4 py-2 hover:bg-gray-200 transition-colors">
          Try it now
        </button>
      </motion.div>
    </div>
  );
}