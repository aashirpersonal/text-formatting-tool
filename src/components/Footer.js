import React from "react";
import { FaGithub } from "react-icons/fa";

const Footer = ({ theme }) => {
  return (
    <footer
      className={`py-4 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Text Formatting Tool. All rights
            reserved.
          </p>
        </div>
        <div>
          <a
            href="https://github.com/aashirpersonal"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${
              theme === "dark"
                ? "text-white hover:text-gray-300"
                : "text-gray-800 hover:text-blue-500"
            }`}
          >
            <FaGithub className="inline-block mr-1" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
