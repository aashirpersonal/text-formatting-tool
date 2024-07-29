import React from "react";

const TextInput = ({ text, updateText, theme }) => {
  return (
    <div className="mb-6">
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
  );
};

export default TextInput;