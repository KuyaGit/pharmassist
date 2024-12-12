"use client";

import { LampContainer } from "./ui/lamp";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Send email to pharmassist.solutions@gmail.com
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          to: "pharmassist.solutions@gmail.com", // Add recipient email
        }),
      });

      if (response.ok) {
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section className="h-screen w-full bg-black" id="contact">
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            Get in Touch
          </motion.h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <motion.input
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.3 }}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-zinc-800 bg-black/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-sm sm:text-base text-gray-100 placeholder-gray-400 backdrop-blur-sm"
              />
              <motion.input
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.4 }}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-zinc-800 bg-black/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-sm sm:text-base text-gray-100 placeholder-gray-400 backdrop-blur-sm"
              />
            </div>
            <motion.textarea
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.5 }}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              required
              rows={4}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-zinc-800 bg-black/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-sm sm:text-base text-gray-100 placeholder-gray-400 backdrop-blur-sm"
            ></motion.textarea>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-white py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>
      </LampContainer>
    </section>
  );
}
