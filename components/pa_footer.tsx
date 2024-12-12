import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">PharmAssist</h3>
            <p className="text-sm">
              Empowering pharmacies with intelligent software solutions that
              streamline operations and improve patient care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature.href}>
                  <Link
                    href={feature.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {feature.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm">
                Email: pharmassist.solutions@gmail.com
              </li>
              <li className="text-sm">Phone: +639055236803</li>
              <li className="text-sm">Address: Batangas, Philippines</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} PharmAssist. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link
              href="/pharmassist"
              className="text-sm hover:text-white transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/"
              className="text-sm hover:text-white transition-colors duration-200"
            >
              Pomona Home
            </Link>
            <Link
              href="/privacy"
              className="text-sm hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
  { label: "Login", href: "/pharmassist" },
  { label: "Pomona Home", href: "/" },
];

const features = [
  { label: "Inventory Management", id: "inventory", href: "/#inventory" },
  { label: "Analytics Dashboard", id: "analytics", href: "/#analytics" },
  { label: "Expense Tracking", id: "expenses", href: "/#expenses" },
  { label: "Mobile Access", id: "mobile", href: "/#mobile" },
];
