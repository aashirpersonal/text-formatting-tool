// PrivacyPolicy.js
import React from "react";
import SEO from "./SEO";

const PrivacyPolicy = ({ theme }) => {
  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white"
      } min-h-screen`}
    >
      <SEO
        title="Privacy Policy - Text Formatting Tool"
        description="Read our privacy policy to understand how we collect, use, and protect your data when using the Text Formatting Tool."
        keywords="privacy policy, data collection, data protection"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4">
          This privacy policy explains how our text formatting tool collects,
          uses, and protects your personal information.
        </p>
        <h2 className="text-2xl font-bold mb-4">
          Information Collection and Use
        </h2>
        <p className="mb-4">
          We do not collect any personal information when you use our text
          formatting tool. The tool operates entirely on your device, and no
          data is sent to our servers.
        </p>
        <h2 className="text-2xl font-bold mb-4">
          Cookies and Tracking Technologies
        </h2>
        <p className="mb-4">
          We do not use cookies or any other tracking technologies to collect
          information about your usage of the tool.
        </p>
        <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
        <p className="mb-4">
          We do not use any third-party services that collect your personal
          information in connection with the text formatting tool.
        </p>
        <h2 className="text-2xl font-bold mb-4">
          Changes to This Privacy Policy
        </h2>
        <p>
          We may update our privacy policy from time to time. We will notify you
          of any changes by posting the new privacy policy on this page.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
