import React from "react";

const SortLinesDescending = ({ text, updateText, theme }) => {
  const handleSortLinesDescending = () => {
    const newText = text.split("\n").sort().reverse().join("\n");
    updateText(newText);
  };

  return (
    <button
      onClick={handleSortLinesDescending}
      className={`px-3 py-2 border ${
        theme === "dark"
          ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
      } font-normal focus:outline-none`}
    >
      Sort Lines Descending
    </button>
  );
};

export default SortLinesDescending;
