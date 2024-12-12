"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <div id="about" className="relative min-h-screen">
      {/* Background Image with Fade Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 20 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/hero3.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-white" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <Image
                src="/POMONA_LOGO.svg"
                alt="Pomona Logo"
                width={180}
                height={60}
                className="mb-8"
              />
              <h1 className="text-6xl font-bold text-blue-800 mb-6">
                Pomona Pharmaceutical Distribution Inc.
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                "Leading Generic Brand at Bambang Price"
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                onClick={() => {
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border border-gray-300 rounded-full font-medium hover:border-blue-600 transition-colors"
                onClick={() => {
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
