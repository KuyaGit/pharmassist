"use client";

import { motion } from "framer-motion";
import {
  TruckIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function Services() {
  const services = [
    {
      title: "Wholesale Distribution",
      description:
        "Comprehensive pharmaceutical distribution services for healthcare facilities, ensuring reliable supply chain management and timely delivery.",
      icon: TruckIcon,
      color: "from-blue-600 to-blue-800",
    },
    {
      title: "Supply Chain Solutions",
      description:
        "End-to-end supply chain management and logistics services optimized for pharmaceutical distribution and storage requirements.",
      icon: ChartBarIcon,
      color: "from-purple-600 to-blue-600",
    },
    {
      title: "Quality Assurance",
      description:
        "Rigorous quality control and compliance monitoring to ensure the highest standards in pharmaceutical distribution and storage.",
      icon: ShieldCheckIcon,
      color: "from-blue-600 to-purple-600",
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-white pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold mb-6">
            Our <span className="text-blue-600">Services</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Comprehensive pharmaceutical solutions tailored to your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-20">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col md:flex-row items-center gap-12 relative"
            >
              {index % 2 === 0 ? (
                <>
                  <div className="w-full md:w-1/2 flex justify-center items-center">
                    <div
                      className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${service.color} p-12 flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}
                    >
                      <service.icon className="w-32 h-32 text-white/90" />
                      <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-xl" />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <h3 className="text-3xl font-bold mb-6 text-blue-800">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                      {service.description}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                    >
                      Learn More
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full md:w-1/2">
                    <h3 className="text-3xl font-bold mb-6 text-blue-800">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                      {service.description}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                    >
                      Learn More
                    </motion.button>
                  </div>
                  <div className="w-full md:w-1/2 flex justify-center items-center">
                    <div
                      className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${service.color} p-12 flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}
                    >
                      <service.icon className="w-32 h-32 text-white/90" />
                      <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-xl" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
