"use client";

import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const Contact = () => {
  return (
    <section
      id="contact"
      className="py-24 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Let's Start a{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Conversation
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Visit our store or
            contact us directly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <MapPinIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-gray-900">
                    Address
                  </h4>
                  <p className="text-gray-600">
                    35 Evangelista St., Batangas City
                  </p>
                  <p className="text-gray-600">(in front of Novo)</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <PhoneIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">
                    Phone
                  </h4>
                  <p className="text-gray-600">
                    Tel: (043) 783-1285 / (043) 402-2912
                  </p>
                  <p className="text-gray-600">Mobile: 0912-709-0914</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2">Email</h4>
                  <p className="text-gray-600">pomonapd.inc@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200">
              <h4 className="font-bold text-xl mb-6 text-gray-900 dark:text-white">
                Order Information
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-gray-700">Online Order</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-gray-700">Store Pick-up</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-gray-700">Delivery</span>
                </li>
                <li className="text-sm mt-4 text-gray-500">
                  * P1,000 minimum purchase for Batangas City Poblacion Area
                </li>
                <li className="text-sm text-gray-500">
                  * P5,000 minimum purchase beyond Batangas City Poblacion Area
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-[600px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3872.3461789279396!2d121.05373!3d13.756986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd0fea691df711%3A0x44a2a9c5b8df85f4!2s35%20Evangelista%20St%2C%20Batangas%20City%2C%20Batangas!5e0!3m2!1sen!2sph!4v1710669145061!5m2!1sen!2sph"
              className="w-full h-full rounded-xl"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
