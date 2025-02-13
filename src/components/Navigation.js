import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";

const Navigation = ({ theme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`${theme === "dark" ? "bg-gradient-to-r from-gray-900 to-gray-700" : "bg-gradient-to-r from-gray-100 to-white"} transition duration-300`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src={theme === "dark" ? "/logo-dark.svg" : "/logo.svg"} alt="Logo" className="h-12 w-auto transition-all duration-300 ease-in-out" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`${
                    theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-gray-800 hover:bg-gray-100"
                  } px-3 py-2 rounded-md text-sm font-medium transition-transform duration-200 hover:scale-105`}
                >
                  Home
                </Link>
                <Link
                  to="/how-to-use"
                  className={`${
                    theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-gray-800 hover:bg-gray-100"
                  } px-3 py-2 rounded-md text-sm font-medium transition-transform duration-200 hover:scale-105`}
                >
                  How to Use
                </Link>

                <Link
                  to="/contact"
                  className={`${
                    theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-gray-800 hover:bg-gray-100"
                  } px-3 py-2 rounded-md text-sm font-medium transition-transform duration-200 hover:scale-105`}
                >
                  Contact Us
                </Link>
                <Link
                  to="/privacy"
                  className={`${
                    theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-gray-800 hover:bg-gray-100"
                  } px-3 py-2 rounded-md text-sm font-medium transition-transform duration-200 hover:scale-105`}
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={handleToggle}
                className={`inline-flex items-center justify-center p-2 rounded-md transition transform duration-200 ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-800 hover:text-gray-600"
                } focus:outline-none hover:scale-110`}
              >
                {isOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={onThemeChange}
                className={`${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                } p-2 rounded-full focus:outline-none transition-transform duration-200 hover:scale-110`}
              >
                {theme === "dark" ? (
                  <FaSun className="text-white" />
                ) : (
                  <FaMoon className="text-gray-800" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-800 hover:bg-gray-100"
            } block px-3 py-2 rounded-md text-base font-medium transition-transform duration-200 hover:scale-105`}
          >
            Home
          </Link>
          <Link
            to="/how-to-use"
            className={`${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-800 hover:bg-gray-100"
            } block px-3 py-2 rounded-md text-base font-medium transition-transform duration-200 hover:scale-105`}
          >
            How to Use
          </Link>
          <Link
            to="/contact"
            className={`${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-800 hover:bg-gray-100"
            } block px-3 py-2 rounded-md text-base font-medium transition-transform duration-200 hover:scale-105`}
          >
            Contact Us
          </Link>
          <Link
            to="/privacy"
            className={`${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-800 hover:bg-gray-100"
            } block px-3 py-2 rounded-md text-base font-medium transition-transform duration-200 hover:scale-105`}
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
