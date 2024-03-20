import React from 'react';
export const useTextHistory = (initialText) => {
    const [text, setText] = React.useState(initialText);
    const [history, setHistory] = React.useState([initialText]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
  
    const updateText = (newText) => {
      const newHistory = [...history.slice(0, currentIndex + 1), newText];
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      setText(newText);
    };
  
    const undo = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setText(history[currentIndex - 1]);
      }
    };
  
    const redo = () => {
      if (currentIndex < history.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setText(history[currentIndex + 1]);
      }
    };
  
    return [text, updateText, undo, redo];
  };