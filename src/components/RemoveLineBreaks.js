import React from "react";

const RemoveLineBreaks = ({ text, updateText, theme }) => {
  const handleRemoveLineBreaks = () => {
    const formattedText = text.replace(/\n/g, "");
    updateText(formattedText);
  };

  return (
    <button
      onClick={handleRemoveLineBreaks}
      className={`${
        theme === "dark"
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-white hover:bg-gray-100 text-gray-800"
      } font-medium py-2 px-4 border ${
        theme === "dark" ? "border-gray-600" : "border-gray-400"
      } rounded shadow`}
    >
      Remove Line Breaks
    </button>
  );
};

export default RemoveLineBreaks;
