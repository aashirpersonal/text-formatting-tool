import React, { useEffect } from "react";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded shadow-md">
      {message}
    </div>
  );
};

export default Toast;
