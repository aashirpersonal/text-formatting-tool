import React, { useState, useRef } from "react";
import { useTextHistory } from "../utils";
import TextInput from "./TextInput";
import ControlButtons from "./ControlButtons";
import BasicOperations from "./BasicOperations";
import AdvancedOperations from "./AdvancedOperations";
import WordCharCount from "./WordCharCount";
import AIAssistant from "../AIAssistant";
import Toast from "../Toast";

const TextArea = ({ theme }) => {
  const [text, updateText, undo, redo] = useTextHistory("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showReplaceTextInfo, setShowReplaceTextInfo] = useState(false);
  const [showLineOperationsInfo, setShowLineOperationsInfo] = useState(false);
  const replaceTextRef = useRef(null);
  const lineOperationsRef = useRef(null);

  const handleToastClose = () => {
    setShowToast(false);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
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
      
      {/* AI Assistant - Full width at the top */}
      <div className="mb-8">
        <AIAssistant text={text} updateText={updateText} theme={theme} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <WordCharCount text={text} theme={theme} />
          <TextInput text={text} updateText={updateText} theme={theme} />
          <ControlButtons
            text={text}
            updateText={updateText}
            undo={undo}
            redo={redo}
            showToastMessage={showToastMessage}
            theme={theme}
          />
        </div>
        <div>
          <BasicOperations text={text} updateText={updateText} theme={theme} />
        </div>
      </div>
      
      <AdvancedOperations
        text={text}
        updateText={updateText}
        theme={theme}
        showReplaceTextInfo={showReplaceTextInfo}
        setShowReplaceTextInfo={setShowReplaceTextInfo}
        showLineOperationsInfo={showLineOperationsInfo}
        setShowLineOperationsInfo={setShowLineOperationsInfo}
        replaceTextRef={replaceTextRef}
        lineOperationsRef={lineOperationsRef}
      />
      {showToast && <Toast message={toastMessage} onClose={handleToastClose} />}
    </div>
  );
};

export default TextArea;