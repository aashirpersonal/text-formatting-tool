import React from "react";

const CapitalizeSentences = ({ text, updateText, theme }) => {
  const handleCapitalizeSentences = () => {
    const formattedText = text
      .split(/\.\s*/)
      .map(
        (sentence) =>
          sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase()
      )
      .join(". ");

    updateText(formattedText);
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
      onClick={handleCapitalizeSentences}
    >
      Capitalize Sentences
    </button>
  );
};

export default CapitalizeSentences;
