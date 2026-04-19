import React from 'react';

const Loader = ({ size = 'md' }) => {
  const sizes = { sm: 'h-6 w-6', md: 'h-12 w-12', lg: 'h-16 w-16' };
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizes[size]}`} />
    </div>
  );
};

export default Loader;