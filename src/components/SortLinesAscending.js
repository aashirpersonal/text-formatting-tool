import React from "react";

const SortLinesAscending = ({ text, updateText, theme }) => {
  const handleSortLinesAsc = () => {
    const newText = text.split("\n").sort().join("\n");
    updateText(newText);
  };

  return (
    <button
      className={`px-3 py-2 border ${
        theme === "dark"
          ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
      } font-normal focus:outline-none`}
      onClick={handleSortLinesAsc}
    >
      Sort Lines Ascending
    </button>
  );
};

export default SortLinesAscending;
