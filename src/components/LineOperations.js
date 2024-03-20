import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

const LineOperations = ({ text, updateText, theme, showInfo, setShowInfo }) => {
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [trimStart, setTrimStart] = useState("");
  const [trimEnd, setTrimEnd] = useState("");

  const handleLineOperations = () => {
    const formattedLines = text
      .split("\n")
      .map((line) => {
        let formattedLine = line;

        if (prefix) {
          formattedLine = `${prefix}${formattedLine}`;
        }

        if (suffix) {
          formattedLine = `${formattedLine}${suffix}`;
        }

        if (trimStart) {
          formattedLine = formattedLine.trimStart(
            new RegExp(`[${trimStart}]+`)
          );
        }

        if (trimEnd) {
          formattedLine = formattedLine.trimEnd(new RegExp(`[${trimEnd}]+`));
        }

        return formattedLine;
      })
      .join("\n");

    updateText(formattedLines);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Line Operations</h2>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`focus:outline-none ${
            theme === "dark"
              ? "text-gray-400 hover:text-white"
              : "text-gray-600 hover:text-blue-500"
          }`}
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
            className={`p-6 rounded-md shadow-md ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">
              Line Operations Documentation
            </h3>
            <p className="mb-2">
              The line operations section allows you to perform various
              operations on each line of the text.
            </p>
            <ul className="list-disc pl-6">
              <li>Enter a prefix to add at the start of each line.</li>
              <li>Enter a suffix to add at the end of each line.</li>
              <li>Enter characters to trim from the start of each line.</li>
              <li>Enter characters to trim from the end of each line.</li>
              <li>
                Click the "Apply Line Operations" button to perform the line
                operations.
              </li>
            </ul>
          </div>
        </div>
      )}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="prefix"
              className="block text-gray-700 font-bold mb-2"
            >
              Prefix
            </label>
            <input
              type="text"
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className={`w-full border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-300"
              } rounded-md p-2`}
              placeholder="Enter prefix"
            />
          </div>
          <div>
            <label
              htmlFor="suffix"
              className="block text-gray-700 font-bold mb-2"
            >
              Suffix
            </label>
            <input
              type="text"
              id="suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              className={`w-full border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-300"
              } rounded-md p-2`}
              placeholder="Enter suffix"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="trimStart"
              className="block text-gray-700 font-bold mb-2"
            >
              Trim Start
            </label>
            <input
              type="text"
              id="trimStart"
              value={trimStart}
              onChange={(e) => setTrimStart(e.target.value)}
              className={`w-full border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-300"
              } rounded-md p-2`}
              placeholder="Characters to trim from start"
            />
          </div>
          <div>
            <label
              htmlFor="trimEnd"
              className="block text-gray-700 font-bold mb-2"
            >
              Trim End
            </label>
            <input
              type="text"
              id="trimEnd"
              value={trimEnd}
              onChange={(e) => setTrimEnd(e.target.value)}
              className={`w-full border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-300"
              } rounded-md p-2`}
              placeholder="Characters to trim from end"
            />
          </div>
        </div>
        <button
          onClick={handleLineOperations}
          className={`w-full ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white font-medium py-2 px-4 rounded`}
        >
          Apply Line Operations
        </button>
      </div>
    </div>
  );
};

export default LineOperations;
