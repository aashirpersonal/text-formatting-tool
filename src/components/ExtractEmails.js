import React from "react";

const ExtractEmails = ({ text, updateText, theme }) => {
  const handleExtractEmails = () => {
    const emailRegex = /[\w.-]+@[\w.-]+\.[\w.-]+/g;
    const emails = text.match(emailRegex);
    const extractedEmails = emails ? emails.join("\n") : "";
    updateText(extractedEmails);
  };

  return (
    <button
      onClick={handleExtractEmails}
      className={`${
        theme === "dark"
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-white hover:bg-gray-100 text-gray-800"
      } font-medium py-2 px-4 border ${
        theme === "dark" ? "border-gray-600" : "border-gray-400"
      } rounded shadow`}
    >
      Extract Emails
    </button>
  );
};

export default ExtractEmails;
