import React from 'react';
import WordCharCount from './TextArea/WordCharCount';
import TextInput from './TextArea/TextInput';
import ControlButtons from './TextArea/ControlButtons';

const DashboardTextArea = ({ text, updateText, undo, redo, theme }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <WordCharCount text={text} theme={theme} />
      <TextInput text={text} updateText={updateText} theme={theme} />
      <ControlButtons text={text} updateText={updateText} undo={undo} redo={redo} theme={theme} />
    </div>
  );
};

export default DashboardTextArea; 