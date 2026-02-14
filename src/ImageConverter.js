// src/ImageConverter.js
import React, { useState } from 'react';
import { convertImage } from './imageUtils';

const ImageConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedImageUrl, setConvertedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setConvertedImageUrl(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const convertedFile = await convertImage(selectedFile);
      if (convertedFile) {
        const url = URL.createObjectURL(convertedFile);
        setConvertedImageUrl(url);
      } else {
        setError('Conversion failed or unsupported file type.');
      }
    } catch (err) {
      console.error('Error during image conversion:', err);
      setError('Error during conversion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <input type="file" onChange={handleFileChange} className="mb-4" aria-label="Choose file" />
      <button
        onClick={handleConvert}
        disabled={!selectedFile || loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Converting...' : 'Convert to PNG'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {convertedImageUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Converted Image:</h2>
          <img src={convertedImageUrl} alt="Converted" className="mt-2 max-w-xs h-auto" />
          <a
            href={convertedImageUrl}
            download="converted-image.png"
            className="block mt-2 text-blue-400 hover:text-blue-200"
          >
            Download Converted Image
          </a>
        </div>
      )}
    </div>
  );
};

export default ImageConverter;