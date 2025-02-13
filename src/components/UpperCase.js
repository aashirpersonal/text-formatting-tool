import React from "react";

const UpperCase = ({ text, updateText, theme }) => {
  const handleUpperCase = () => {
    updateText(text.toUpperCase());
  };

  return (
    <button
      className={`px-3 py-2 border ${
        theme === "dark"
          ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
      } font-normal focus:outline-none`}
      onClick={handleUpperCase}
    >
      Convert to Uppercase
    </button>
  );
};

export default UpperCase;
