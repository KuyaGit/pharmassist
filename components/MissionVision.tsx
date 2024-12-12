"use client";

import { motion } from "framer-motion";
import { LightBulbIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function MissionVision() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.21, 1.11, 0.81, 0.99], // custom ease curve for smooth entrance
          }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold mb-4">
            Our <span className="text-blue-600">Purpose</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Driving excellence in pharmaceutical distribution through commitment
            and innovation
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-24">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.21, 1.11, 0.81, 0.99],
            }}
            className="flex flex-col md:flex-row items-center gap-12"
          >
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-2xl" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <LightBulbIcon className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h3 className="text-3xl font-bold mb-6 text-gray-900">
                Our Mission
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                We will become one of the most valued companies to retailers,
                wholesalers, competitors and communities where we serve and live
                for.
              </p>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.21, 1.11, 0.81, 0.99],
            }}
            className="flex flex-col md:flex-row-reverse items-center gap-12"
          >
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-2xl" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <EyeIcon className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h3 className="text-3xl font-bold mb-6 text-gray-900">
                Our Vision
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                To be the leader in the field of pharmaceutical retail industry
                and to be in continuous pursuit of excellence in the provision
                of affordable, effective and quality generic medicines that will
                meet the optimum customer's satisfaction.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
