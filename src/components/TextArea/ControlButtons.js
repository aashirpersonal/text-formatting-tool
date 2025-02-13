import React from "react";
import { FaUndo, FaRedo, FaCopy, FaPaste, FaSave, FaFileUpload } from "react-icons/fa";

const ControlButtons = ({ text, updateText, undo, redo, showToastMessage, theme }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    showToastMessage("Text copied to clipboard");
  };

  const handlePaste = async () => {
    const clipboardText = await navigator.clipboard.readText();
    updateText(clipboardText);
    showToastMessage("Text pasted from clipboard");
  };

  const handleSave = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "formatted-text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToastMessage("Text saved as file");
  };

  const handleLoad = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      updateText(e.target.result);
      showToastMessage("Text loaded from file");
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      <ControlButton icon={FaUndo} onClick={undo} disabled={text === ""} tooltip="Undo" theme={theme} />
      <ControlButton icon={FaRedo} onClick={redo} disabled={text === ""} tooltip="Redo" theme={theme} />
      <ControlButton icon={FaFileUpload} onClick={() => document.getElementById('fileInput').click()} tooltip="Load" theme={theme} />
      <input id="fileInput" type="file" accept=".txt" className="hidden" onChange={handleLoad} />
      <ControlButton icon={FaSave} onClick={handleSave} tooltip="Save" theme={theme} />
      <ControlButton icon={FaCopy} onClick={handleCopy} tooltip="Copy" theme={theme} />
      <ControlButton icon={FaPaste} onClick={handlePaste} tooltip="Paste" theme={theme} />
    </div>
  );
};

const ControlButton = ({ icon: Icon, onClick, disabled, tooltip, theme }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 border ${
        theme === "dark"
          ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
      } font-normal focus:outline-none`}
    >
      <Icon className="h-5 w-5" />
    </button>
    <span
      className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-sm ${
        theme === "dark"
          ? "bg-gray-800 text-white"
          : "bg-gray-100 text-gray-800"
      } rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
    >
      {tooltip}
    </span>
  </div>
);

export default ControlButtons;