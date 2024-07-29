import React, { useState, useRef } from "react";
import {
  FaUndo,
  FaRedo,
  FaCopy,
  FaPaste,
  FaSave,
  FaFileUpload,
} from "react-icons/fa";
import UpperCase from "./UpperCase";
import LowerCase from "./LowerCase";
import CapitalizeSentences from "./CapitalizeSentences";
import CapitalizeWords from "./CapitalizeWords";
import ReplaceText from "./ReplaceText";
import LineOperations from "./LineOperations";
import { useTextHistory } from "./utils";
import Toast from "./Toast";
import WordCharCount from "./WordCharCount";
import RemoveWhitespace from "./RemoveWhitespace";
import RemoveTabs from "./RemoveTabs";
import RemoveLineBreaks from "./RemoveLineBreaks";
import TrimEachLine from "./TrimEachLine";
import SortLinesAscending from "./SortLinesAscending";
import SortLinesDescending from "./SortLinesDescending";
import ExtractEmails from "./ExtractEmails";
import ExtractPhoneNumbers from "./ExtractPhoneNumbers";

const TextArea = ({ theme }) => {
  const [text, updateText, undo, redo] = useTextHistory("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showReplaceTextInfo, setShowReplaceTextInfo] = useState(false);
  const [showLineOperationsInfo, setShowLineOperationsInfo] = useState(false);
  const replaceTextRef = useRef(null);
  const lineOperationsRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setToastMessage("Text copied to clipboard");
    setShowToast(true);
  };

  const handlePaste = async () => {
    const clipboardText = await navigator.clipboard.readText();
    updateText(clipboardText);
    setToastMessage("Text pasted from clipboard");
    setShowToast(true);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const handleSave = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "formatted-text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setToastMessage("Text saved as file");
    setShowToast(true);
  };

  const handleLoad = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      updateText(e.target.result);
      setToastMessage("Text loaded from file");
      setShowToast(true);
    };
    reader.readAsText(file);
  };

  const handleOutsideClick = (event) => {
    if (
      replaceTextRef.current &&
      !replaceTextRef.current.contains(event.target) &&
      lineOperationsRef.current &&
      !lineOperationsRef.current.contains(event.target)
    ) {
      setShowReplaceTextInfo(false);
      setShowLineOperationsInfo(false);
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      onClick={handleOutsideClick}
    >
      <h1 className="text-3xl font-bold mb-6">Text Formatting Tool</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-6">
            <WordCharCount text={text} theme={theme} />
            <textarea
              value={text}
              onChange={(e) => updateText(e.target.value)}
              rows={10}
              className={`w-full border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-300"
              } rounded-md p-2`}
              placeholder="Enter your text here..."
            />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="relative group">
              <button
                onClick={undo}
                disabled={text === ""}
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                } hover:text-blue-500 focus:outline-none`}
              >
                <FaUndo className="h-5 w-5" />
              </button>
              <span
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
              >
                Undo
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={redo}
                disabled={text === ""}
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                } hover:text-blue-500 focus:outline-none`}
              >
                <FaRedo className="h-5 w-5" />
              </button>
              <span
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
              >
                Redo
              </span>
            </div>
            <div className="relative group">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleLoad}
                />
                <FaFileUpload
                  className={`h-5 w-5 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } hover:text-blue-500`}
                />
              </label>
              <span
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
              >
                Load
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={handleSave}
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                } hover:text-blue-500 focus:outline-none`}
              >
                <FaSave className="h-5 w-5" />
              </button>
              <span
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
              >
                Save
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={handleCopy}
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                } hover:text-blue-500 focus:outline-none`}
              >
                <FaCopy className="h-5 w-5" />
              </button>
              <span
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
              >
                Copy
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={handlePaste}
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                } hover:text-blue-500 focus:outline-none`}
              >
                <FaPaste className="h-5 w-5" />
              </button>
              <span
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
              >
                Paste
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Basic Operations</h2>
            <div className="grid grid-cols-2 gap-4">
              <ExtractEmails
                text={text}
                updateText={updateText}
                theme={theme}
              />
              <ExtractPhoneNumbers
                text={text}
                updateText={updateText}
                theme={theme}
              />
              <UpperCase text={text} updateText={updateText} theme={theme} />
              <LowerCase text={text} updateText={updateText} theme={theme} />
              <CapitalizeSentences
                text={text}
                updateText={updateText}
                theme={theme}
              />
              <CapitalizeWords
                text={text}
                updateText={updateText}
                theme={theme}
              />
              <RemoveWhitespace
                text={text}
                updateText={updateText}
                theme={theme}
              />
              <RemoveTabs text={text} updateText={updateText} theme={theme} />
              <RemoveLineBreaks
                text={text}
                updateText={updateText}
                theme={theme}
              />
              <TrimEachLine text={text} updateText={updateText} theme={theme} />
              <SortLinesAscending
                text={text}
                updateText={updateText}
                theme={theme}
              />
              <SortLinesDescending
                text={text}
                updateText={updateText}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          ref={replaceTextRef}
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <ReplaceText
            text={text}
            updateText={updateText}
            theme={theme}
            showInfo={showReplaceTextInfo}
            setShowInfo={setShowReplaceTextInfo}
          />
        </div>
        <div
          ref={lineOperationsRef}
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <LineOperations
            text={text}
            updateText={updateText}
            theme={theme}
            showInfo={showLineOperationsInfo}
            setShowInfo={setShowLineOperationsInfo}
          />
        </div>
      </div>
      {showToast && <Toast message={toastMessage} onClose={handleToastClose} />}
    </div>
  );
};

export default TextArea;
