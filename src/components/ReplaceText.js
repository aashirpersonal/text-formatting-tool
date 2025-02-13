import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

const ReplaceText = ({ text, updateText, theme, showInfo, setShowInfo }) => {
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);

  const handleReplace = () => {
    let formattedText = text;

    if (useRegex) {
      try {
        const regex = new RegExp(searchText, caseSensitive ? "g" : "gi");
        formattedText = text.replace(regex, replaceText.replace(/%N/g, "\n"));
      } catch (error) {
        console.error("Invalid regular expression:", error);
      }
    } else {
      const searchRegex = new RegExp(
        searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        caseSensitive ? "g" : "gi"
      );
      formattedText = text.replace(
        searchRegex,
        replaceText.replace(/%N/g, "\n")
      );
    }

    updateText(formattedText);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Replace Text</h2>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="focus:outline-none"
        >
          <FaInfoCircle className="h-5 w-5" />
        </button>
      </div>
      {showInfo && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${
            theme === "dark"
              ? "bg-black bg-opacity-50"
              : "bg-white bg-opacity-50"
          }`}
          onClick={() => setShowInfo(false)}
        >
          <div
            className={`p-6 border-2 ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-600"
                : "bg-white text-gray-800 border-gray-400"
            } focus:outline-none`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">
              Replace Text Documentation
            </h3>
            <p className="mb-2">
              The replace text section allows you to search for specific text patterns and replace them with new text.
            </p>
            <ul className="list-disc pl-6">
              <li>Enter the text to search for in the "Search Text" field.</li>
              <li>Enter the replacement text in the "Replace Text" field.</li>
              <li>
                Check the "Use Regular Expression" box to use regular expressions for searching.
              </li>
              <li>
                Check the "Case Sensitive" box to perform a case-sensitive search.
              </li>
              <li>
                Click the "Replace" button to perform the text replacement.
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label
            htmlFor="searchText"
            className="block text-gray-700 font-bold mb-2"
          >
            Search Text
          </label>
          <input
            type="text"
            id="searchText"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={
              useRegex ? "Enter regular expression" : "Enter text to search"
            }
            className={`w-full border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-800"
            } p-2 focus:outline-none`}
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="replaceText"
            className="block text-gray-700 font-bold mb-2"
          >
            Replace Text
          </label>
          <input
            type="text"
            id="replaceText"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Enter replacement text"
            className={`w-full border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-800"
            } p-2 focus:outline-none`}
          />
          <p className="text-sm text-gray-500 mt-2">
            Use %N for newline in Replace Text
          </p>
        </div>
        <div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="useRegex"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="useRegex" className="text-gray-700 font-bold">
              Use Regular Expression
            </label>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="caseSensitive"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="caseSensitive" className="text-gray-700 font-bold">
              Case Sensitive
            </label>
          </div>
        </div>
        <div className="sm:col-span-2">
          <button
            onClick={handleReplace}
            className={`w-full px-3 py-2 border-2 ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-700"
                : "bg-blue-500 hover:bg-blue-600 text-white border-blue-600"
            } font-medium focus:outline-none`}
          >
            Replace Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplaceText;
