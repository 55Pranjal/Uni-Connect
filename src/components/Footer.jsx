import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white w-full">
      <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-slate-500 flex flex-col md:flex-row justify-between gap-4">
        <p>© 2026 UniConnect. Built for students.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-indigo-600">
            About
          </a>
          <a href="#" className="hover:text-indigo-600">
            Contact
          </a>
          <a href="#" className="hover:text-indigo-600">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
