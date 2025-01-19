"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  // Add scroll handler
  const handleScroll = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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
      <div className="relative z-10 container mx-auto px-4 pt-20 sm:pt-32 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 sm:mb-8">
              <Image
                src="/POMONA_LOGO.svg"
                alt="Pomona Logo"
                width={140}
                height={46}
                className="mb-6 sm:mb-8 w-[140px] sm:w-[180px]"
              />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-800 mb-4 sm:mb-6">
                Pomona Pharmaceutical Distribution Inc.
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
                "Leading Generic Brand at Bambang Price"
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={() => handleScroll("contact")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
              >
                Get Started
              </motion.button>
              <motion.button
                onClick={() => handleScroll("features")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 sm:px-8 py-3 sm:py-4 border border-gray-300 rounded-full font-medium hover:border-blue-600 transition-colors w-full sm:w-auto text-center text-gray-900 dark:text-gray-100"
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
