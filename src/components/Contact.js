// Contact.js
import React from "react";
import {
  FaEnvelope,
  FaPhone,
  FaTwitter,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

const Contact = ({ theme }) => {
  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white"
      } min-h-screen`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="mb-4">
              If you have any questions, feedback, or concerns about our text
              formatting tool, please don't hesitate to reach out to us.
            </p>
            <div className="flex items-center mb-4">
              <FaEnvelope className="mr-2" />
              <span>contact@textformat.io</span>
            </div>
            <div className="flex items-center mb-4">
              <FaPhone className="mr-2" />
              <span>+44 (782) 692-0261</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Follow Us</h2>
            <div className="flex space-x-4">
              <a
                href="#"
                className={`${
                  theme === "dark" ? "text-white" : "text-gray-800"
                } hover:text-blue-500`}
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="#"
                className={`${
                  theme === "dark" ? "text-white" : "text-gray-800"
                } hover:text-blue-500`}
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="#"
                className={`${
                  theme === "dark" ? "text-white" : "text-gray-800"
                } hover:text-blue-500`}
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
