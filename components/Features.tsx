"use client";

import { motion } from "framer-motion";
import {
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

export default function Features() {
  const features = [
    {
      title: "Ready To Provide",
      description:
        "Committed to meeting all your business pharmaceutical needs",
      Icon: BuildingStorefrontIcon,
    },
    {
      title: "Quality & Affordable",
      description: "Ensuring high-quality products at competitive prices",
      Icon: CurrencyDollarIcon,
    },
    {
      title: "Here To Assist",
      description: "Dedicated support for all your pharmaceutical requirements",
      Icon: UserGroupIcon,
    },
  ];

  const testimonials = [
    {
      quote:
        "It's unbelievably cheap,yet effective as a substitute for a commercially available medicine,generic but very potent !!!!Very fast delivery and we'll packed!!!",
      name: "Customer",
      title: "03/22/2023 05:41",
    },
    {
      quote:
        "Happy customer here! Thank you for sending my order fast! I will definitely buy m ore items from you. Stay safe.",
      name: "Customer",
      title: "03/29/2023 09:11",
    },
    {
      quote:
        "Received well packaged. Thankful for generics brands kaya ngayon hindi na nalili gtangan sa pag inom ng maintenace ang mother ko. Seller is also responsive sa questions. Thank you po. Till the next order",
      name: "Customer",
      title: "03/27/2023 10:45",
    },
    {
      quote:
        "Will try first. But very fast delivery and packed well. Thanks seller.",
      name: "Client",
      title: "03/26/2023 18:24",
    },
    {
      quote:
        "Super fast shipping and legitimate products for the sale. I will definitely buy again from this seller next time. Much cheaper than price at other pharmacies. Thank you shopee for this purchase and thank you seller...",
      name: "Client",
      title: "03/30/2023 16:56",
    },
    {
      quote:
        "Performance:10 Suitability: 10 This has been my medicine for 10 years now. Effec tive to me.",
      name: "Client",
      title: "03/30/2023 15:05",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Why Choose <span className="text-blue-600">Pomona</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Healthcare partners, join forces with POMONA PHARMACEUTICAL
            DISTRIBUTION INC. Be one of our valued customers supplied with
            Generic quality medicines through our reliable distribution
            network💊
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-8 text-center">
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-xl transform group-hover:scale-110 transition-transform duration-300" />
                  <div className="relative w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                    <feature.Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 mt-24"
        >
          <h3 className="text-3xl font-bold mb-4 text-gray-900">
            What Our Clients Say
          </h3>
          <p className="text-xl text-gray-600">
            Hear what our valued healthcare partners have to say about their
            experience with Pomona
          </p>
        </motion.div>

        <div className="flex justify-center items-center w-full">
          <InfiniteMovingCards
            items={testimonials}
            speed="slow"
            className="max-w-5xl"
          />
        </div>
      </div>
    </section>
  );
}
