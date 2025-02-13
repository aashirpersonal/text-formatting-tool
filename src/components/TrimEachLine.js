import React from "react";

const TrimEachLine = ({ text, updateText, theme }) => {
  const handleTrimEachLine = () => {
    const newText = text.split("\n").map(line => line.trim()).join("\n");
    updateText(newText);
  };

  return (
    <button
      className={`px-3 py-2 border ${
        theme === "dark"
          ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
      } font-normal focus:outline-none`}
      onClick={handleTrimEachLine}
    >
      Trim Each Line
    </button>
  );
};

export default TrimEachLine;
