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
      className={`px-3 py-2 border ${
        theme === "dark"
          ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
      } font-normal focus:outline-none`}
      onClick={handleCapitalizeSentences}
    >
      Capitalize Sentences
    </button>
  );
};

export default CapitalizeSentences;
