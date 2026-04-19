import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-9xl font-bold text-blue-600">404</h1>
      <p className="text-2xl font-semibold mt-4">Page Not Found</p>
      <Link to="/" className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;