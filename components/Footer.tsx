"use client";

const Footer = () => {
  // Add this scroll handler
  const handleScroll = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              Pomona Pharmaceutical Distribution Inc.
            </h3>
            <p className="text-gray-400">
              "Leading Generic Brand at Bambang Price"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleScroll("about")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScroll("features")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScroll("contact")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4">Features</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleScroll("features")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Ready To Provide
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScroll("features")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Quality & Affordable
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScroll("features")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Here To Assist
                </button>
              </li>
            </ul>
          </div>

          {/* Company Portal Section */}
          <div>
            <h4 className="text-lg font-bold mb-4">Company Portal</h4>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <a
                  href="/pharmassist"
                  className="group relative inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800"></span>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 duration-300 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"></span>
                  <span className="relative flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Company Portal Login
                  </span>
                </a>
                <p className="text-xs text-gray-400 italic">
                  For authorized Pomona personnel only
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Access to inventory management, analytics, and administrative
                  tools
                </p>
                <p className="text-sm text-gray-400">
                  <span className="text-blue-400">✨ New:</span> Pharmacists can
                  now download our mobile app after logging in for on-the-go
                  access
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Pomona Pharmaceutical. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="/pharmassist-home"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                PharmAssist Home
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
