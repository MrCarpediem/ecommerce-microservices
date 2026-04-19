import React from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75">✕</button>
    </div>
  );
};

export default Toast;