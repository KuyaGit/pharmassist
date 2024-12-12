"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const teamMembers = [
  {
    name: "Geo Bibas",
    role: "Lead Developer",
    image: "/team/bibas.jpg",
    bio: "10+ years of experience in pharmacy software development",
    linkedin: "https://linkedin.com/in/sarah-johnson",
    github: "https://github.com/sarahj",
  },
  {
    name: "Al Princess Cortez",
    role: "Product Manager",
    image: "/team/cortez.jpg",
    bio: "Former pharmacist turned product manager",
    linkedin: "https://linkedin.com/in/michael-chen",
    github: "https://github.com/michaelc",
  },
  {
    name: "John Rey Talion",
    role: "UX Designer",
    image: "/team/talion.jpg",
    bio: "Specialized in healthcare UX/UI design",
    linkedin: "https://linkedin.com/in/emily-rodriguez",
    github: "https://github.com/emilyr",
  },
];

export default function Team() {
  return (
    <section className="py-20 bg-black relative overflow-hidden" id="team">
      {/* Background Text */}
      <div className="absolute inset-0 flex items-start md:items-center justify-center pointer-events-none md:-translate-y-28">
        <h1 className="text-[10rem] md:text-[11rem] font-bold text-white/10 select-none mt-24 md:mt-0">
          TEAM
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-1">
            MEET OUR
          </h2>
          <h1 className="text-7xl font-bold text-white mb-2">Team</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-4">
            Meet our talented team of students dedicated to revolutionizing
            pharmacy management through innovative software solutions and
            exceptional service.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`relative group ${
                member.name === "Al Princess Cortez" ? "mt-16" : ""
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover brightness-50 group-hover:brightness-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                  style={{ objectPosition: "center 20%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />

                {/* Blue corner accents */}
                <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-blue-500 group-hover:border-l-4 group-hover:border-t-4 transition-all duration-300" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-blue-500 group-hover:border-r-4 group-hover:border-b-4 transition-all duration-300" />
              </div>

              <div className="absolute bottom-8 left-0 right-0 text-center">
                <h3 className="text-2xl font-semibold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-gray-300 mb-4">{member.role}</p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-500 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </Link>
                  <Link
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-500 transition-colors"
                  >
                    in
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
