"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="py-20 bg-black" id="pa-about">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-6 text-gray-100"
        >
          About PharmAssist
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-gray-400 text-center mb-8"
        >
          PharmAssist is a cutting-edge pharmacy management platform designed to
          revolutionize how pharmacies operate. We combine powerful technology
          with intuitive design to help pharmacies automate their workflows,
          manage inventory efficiently, and focus more on what matters most -
          providing excellent patient care.
        </motion.p>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-primary mb-2"
              >
                {stat.value}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.2 }}
                viewport={{ once: true }}
                className="text-gray-600"
              >
                {stat.label}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [
  { value: "24/7", label: "Customer Support" },
  { value: "100%", label: "Data Security" },
  { value: "99.9%", label: "System Uptime" },
];
