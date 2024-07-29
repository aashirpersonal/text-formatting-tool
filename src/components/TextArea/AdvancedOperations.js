import React from "react";
import ReplaceText from "../ReplaceText";
import LineOperations from "../LineOperations";

const AdvancedOperations = ({
  text,
  updateText,
  theme,
  showReplaceTextInfo,
  setShowReplaceTextInfo,
  showLineOperationsInfo,
  setShowLineOperationsInfo,
  replaceTextRef,
  lineOperationsRef,
}) => {
  return (
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
  );
};

export default AdvancedOperations;