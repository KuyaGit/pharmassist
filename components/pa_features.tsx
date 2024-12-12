"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    icon: "💊",
    title: "Inventory Management",
    description:
      "Real-time tracking of pharmaceutical inventory with expiry date monitoring and stock level alerts.",
    video: "/inv.mp4",
    id: "inventory",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    description:
      "Comprehensive analytics and reporting tools to make data-driven decisions for your pharmacy.",
    video: "/analytics.mp4",
    id: "analytics",
  },
  {
    icon: "💰",
    title: "Expense Tracking",
    description:
      "Streamlined expense management and financial reporting to optimize your pharmacy's profitability.",
    video: "/expenses.mp4",
    id: "expenses",
  },
  {
    icon: "📱",
    title: "Mobile Access",
    description:
      "Create and manage pharmacy reports on-the-go with our secure mobile appl ication.",
    video: "/reports.mp4",
    id: "mobile",
  },
];

const FEATURE_DURATION = 50000; // 5 seconds in milliseconds
const PROGRESS_INTERVAL = 16; // Update progress every 16ms (roughly 60fps)
const TRANSITION_DELAY = 300; // Delay between features in milliseconds

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let transitionTimer: NodeJS.Timeout;

    if (isAutoScrolling && !isTransitioning) {
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsTransitioning(true);
            clearInterval(progressTimer);

            // Add delay before transitioning to next feature
            transitionTimer = setTimeout(() => {
              setActiveFeature((current) => (current + 1) % features.length);
              setProgress(0);
              setIsTransitioning(false);
            }, TRANSITION_DELAY);

            return 100;
          }
          return prev + (100 * PROGRESS_INTERVAL) / FEATURE_DURATION;
        });
      }, PROGRESS_INTERVAL);
    }

    return () => {
      clearInterval(progressTimer);
      clearTimeout(transitionTimer);
    };
  }, [isAutoScrolling, isTransitioning]);

  const handleFeatureClick = (index: number) => {
    if (index !== activeFeature && !isTransitioning) {
      setIsAutoScrolling(false);
      setIsTransitioning(true);
      setProgress(0);

      // Add delay before showing the clicked feature
      setTimeout(() => {
        setActiveFeature(index);
        setIsTransitioning(false);

        const progressTimer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressTimer);
              setIsAutoScrolling(true);
              return 100;
            }
            return prev + (100 * PROGRESS_INTERVAL) / FEATURE_DURATION;
          });
        }, PROGRESS_INTERVAL);
      }, TRANSITION_DELAY);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-black" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">
          Powerful Features for Modern Pharmacies
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Area */}
          <div className="lg:hidden h-[300px] order-1">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black rounded-xl h-full w-full overflow-hidden"
            >
              <div className="relative w-full h-full">
                <video
                  src={features[activeFeature].video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="object-contain w-full h-full"
                />
              </div>
            </motion.div>
          </div>

          {/* Features List */}
          <div className="space-y-4 order-2 lg:order-1">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                onClick={() => handleFeatureClick(index)}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer hover:bg-zinc-900/50 ${
                  index === activeFeature
                    ? "bg-zinc-900 border border-zinc-800"
                    : index < activeFeature
                    ? "opacity-50 bg-zinc-900/30"
                    : "opacity-50"
                }`}
                initial={false}
                animate={{
                  scale: index === activeFeature ? 1.02 : 1,
                }}
              >
                {/* Loading Bar */}
                <div className="w-1 h-16 bg-zinc-800 rounded-full overflow-hidden">
                  {index === activeFeature && (
                    <motion.div
                      className="w-full bg-blue-500"
                      style={{
                        height: `${progress}%`,
                        transition: "height 0.1s linear",
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Preview Area */}
          <div className="hidden lg:block h-[600px] order-2">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black rounded-xl h-full w-full overflow-hidden"
            >
              <div className="relative w-full h-full">
                <video
                  src={features[activeFeature].video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="object-contain w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
