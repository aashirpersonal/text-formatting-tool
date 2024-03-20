import React from "react";

const UpperCase = ({ text, updateText, theme }) => {
  const handleUpperCase = () => {
    updateText(text.toUpperCase());
  };

  return (
    <button
      className={`${
        theme === "dark"
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-white hover:bg-gray-100 text-gray-800"
      } font-medium py-2 px-4 border ${
        theme === "dark" ? "border-gray-600" : "border-gray-400"
      } rounded shadow`}
      onClick={handleUpperCase}
    >
      Convert to Uppercase
    </button>
  );
};

export default UpperCase;
