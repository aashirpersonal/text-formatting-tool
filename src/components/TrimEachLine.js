import React from "react";

const TrimEachLine = ({ text, updateText, theme }) => {
  const handleTrimEachLine = () => {
    const formattedText = text
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
    updateText(formattedText);
  };

  return (
    <button
      onClick={handleTrimEachLine}
      className={`${
        theme === "dark"
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-white hover:bg-gray-100 text-gray-800"
      } font-medium py-2 px-4 border ${
        theme === "dark" ? "border-gray-600" : "border-gray-400"
      } rounded shadow`}
    >
      Trim Each Line
    </button>
  );
};

export default TrimEachLine;
