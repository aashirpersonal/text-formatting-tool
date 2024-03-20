import React from "react";

const ExtractPhoneNumbers = ({ text, updateText, theme }) => {
  const handleExtractPhoneNumbers = () => {
    const phoneRegex =
      /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    const phoneNumbers = text.match(phoneRegex);
    const extractedPhoneNumbers = phoneNumbers ? phoneNumbers.join("\n") : "";
    updateText(extractedPhoneNumbers);
  };

  return (
    <button
      onClick={handleExtractPhoneNumbers}
      className={`${
        theme === "dark"
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-white hover:bg-gray-100 text-gray-800"
      } font-medium py-2 px-4 border ${
        theme === "dark" ? "border-gray-600" : "border-gray-400"
      } rounded shadow`}
    >
      Extract Phone Numbers
    </button>
  );
};

export default ExtractPhoneNumbers;
