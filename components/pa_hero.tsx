"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { HeroParallax } from "./ui/hero-parallax";

export default function Hero() {
  return (
    <section id="home" className="relative">
      <HeroParallax
        products={[
          {
            title: "1",
            link: "#features",
            thumbnail: "/hero/1.png",
          },
          {
            title: "2",
            link: "#features",
            thumbnail: "/hero/2.png",
          },
          {
            title: "3",
            link: "#features",
            thumbnail: "/hero/3.png",
          },
          {
            title: "4",
            link: "#features",
            thumbnail: "/hero/4.png",
          },
          {
            title: "5",
            link: "#features",
            thumbnail: "/hero/5.png",
          },
          {
            title: "6",
            link: "#features",
            thumbnail: "/hero/6.png",
          },
          {
            title: "7",
            link: "#features",
            thumbnail: "/hero/27.png",
          },
          {
            title: "8",
            link: "#features",
            thumbnail: "/hero/8.png",
          },
          {
            title: "9",
            link: "#features",
            thumbnail: "/hero/9.png",
          },
          {
            title: "10",
            link: "#features",
            thumbnail: "/hero/10.png",
          },
          // Adding 5 more items for the third row
          {
            title: "11",
            link: "#features",
            thumbnail: "/hero/11.png",
          },
          {
            title: "12",
            link: "#features",
            thumbnail: "/hero/12.png",
          },
          {
            title: "13",
            link: "#features",
            thumbnail: "/hero/17.png",
          },
          {
            title: "14",
            link: "#features",
            thumbnail: "/hero/14.png",
          },
          {
            title: "15",
            link: "#features",
            thumbnail: "/hero/15.png",
          },
        ]}
      >
        <div className="max-w-7xl relative mx-auto py-10 md:py-20 px-4 w-full left-0 top-0">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-100">
            Streamline Your Pharmacy with{" "}
            <span className="text-blue-400">PharmAssist</span>
          </h1>
          <p className="max-w-2xl text-base md:text-xl mt-8 text-gray-400">
            The intelligent platform that revolutionizes your pharmacy
            operations with real-time inventory tracking, expense management,
            and powerful analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/pharmassist-home/#pa-contact">
              <motion.button
                whileHover={{
                  y: -2,
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-base sm:text-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
              >
                Get Started
                <svg
                  className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            </Link>
            <Link href="/pharmassist-home/#pa-about">
              <motion.button
                whileHover={{
                  y: -2,
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-base sm:text-lg font-medium bg-transparent text-white border-2 border-blue-600 hover:bg-blue-600/10 transition-colors duration-200"
              >
                Learn More
                <svg
                  className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            </Link>
          </div>
        </div>
      </HeroParallax>
    </section>
  );
}
