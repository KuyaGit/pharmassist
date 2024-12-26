"use client";

import { LampContainer } from "./ui/lamp";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Contact() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contactInfo = [
    {
      icon: "📧",
      label: "Email",
      value: "pharmassist.solutions@gmail.com",
    },
    {
      icon: "📱",
      label: "Phone",
      value: "+639055236803",
    },
    {
      icon: "📍",
      label: "Location",
      value: "Batangas, Philippines",
    },
  ];

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <section
      className="min-h-screen w-full bg-black py-16 sm:py-20"
      id="pa-contact"
    >
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            Get in Touch
          </motion.h2>

          <div className="grid gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-10 lg:mt-12">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleCopy(info.value, info.label)}
                className="flex items-center gap-3 sm:gap-4 lg:gap-6 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:bg-zinc-900/80 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/10 text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
                  {info.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">
                    {info.label}
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-white font-medium truncate">
                    {info.value}
                  </p>
                </div>
                <div className="text-gray-400 text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                  {copiedField === info.label ? "Copied!" : "Click to copy"}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </LampContainer>
    </section>
  );
}
