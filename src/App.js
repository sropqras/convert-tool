// App.js

import React from 'react';
import ImageConverter from './ImageConverter';
import './App.css';

const App = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center py-10">
      <header className="text-center mb-8">
        <img src="/logo.png" alt="AA Trade Company Logo" className="mx-auto mb-4 h-24" />
        <h1 className="text-5xl font-extrabold mb-2">Convert Tool</h1>
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">Welcome to AA Trade Company</h2>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Convert your images easily and efficiently. Supports various formats.
        </p>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <ImageConverter />
      </main>
    </div>
  );
};

export default App;