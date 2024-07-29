import React from "react";

const WordCharCount = ({ text, theme }) => {
  // Add a check for undefined text
  if (text === undefined) {
    return null; // or return a placeholder component
  }

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word !== "").length;
  const charCountWithSpaces = text.length;
  const charCountWithoutSpaces = text.replace(/\s/g, "").length;

  return (
    <div
      className={`flex items-center justify-between ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
      } p-4 rounded-md shadow-md mb-4`}
    >
      <div className="flex items-center">
        <div
          className={`p-2 rounded-md ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-100"
          } mr-4`}
        >
          <span className="text-xl font-bold">{wordCount}</span>
          <span className="ml-2 text-base">Words</span>
        </div>
        <div
          className={`p-2 rounded-md ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-100"
          } mr-4`}
        >
          <span className="text-xl font-bold">{charCountWithSpaces}</span>
          <span className="ml-2 text-base">Chars (with spaces)</span>
        </div>
        <div
          className={`p-2 rounded-md ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <span className="text-xl font-bold">{charCountWithoutSpaces}</span>
          <span className="ml-2 text-base">Chars (no spaces)</span>
        </div>
      </div>
    </div>
  );
};

export default WordCharCount;