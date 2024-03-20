import React from "react";

const LowerCase = ({ text, updateText, theme }) => {
  const handleLowerCase = () => {
    updateText(text.toLowerCase());
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
      onClick={handleLowerCase}
    >
      Convert to Lowercase
    </button>
  );
};

export default LowerCase;
