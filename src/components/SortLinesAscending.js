import React from "react";

const SortLinesAscending = ({ text, updateText, theme }) => {
  const handleSortLinesAscending = () => {
    const formattedText = text.split("\n").sort().join("\n");
    updateText(formattedText);
  };

  return (
    <button
      onClick={handleSortLinesAscending}
      className={`${
        theme === "dark"
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-white hover:bg-gray-100 text-gray-800"
      } font-medium py-2 px-4 border ${
        theme === "dark" ? "border-gray-600" : "border-gray-400"
      } rounded shadow`}
    >
      Sort Lines Ascending
    </button>
  );
};

export default SortLinesAscending;
