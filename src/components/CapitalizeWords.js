import React from "react";

const CapitalizeWords = ({ text, updateText, theme }) => {
  const handleCapitalizeWords = () => {
    const newText = text.replace(/\b\w/g, char => char.toUpperCase());
    updateText(newText);
  };

  return (
    <button
      className={`px-3 py-2 border ${
        theme === "dark"
          ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
      } font-normal focus:outline-none`}
      onClick={handleCapitalizeWords}
    >
      Capitalize Words
    </button>
  );
};

export default CapitalizeWords;
