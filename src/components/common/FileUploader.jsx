import React, { useState, useRef } from 'react';
import { storageApi } from '../../api/storage.api.js';

export default function FileUploader({ onUploadComplete, label = "Upload Image" }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setIsUploading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const response = await storageApi.uploadImage(file);
      clearInterval(progressInterval);
      setProgress(100);
      
      // Extract URL from response, assuming it might be returned in various formats
      const url = response?.url || response?.imageUrl || (typeof response === 'string' ? response : null);
      if (url && onUploadComplete) {
        onUploadComplete(url);
      } else if (onUploadComplete) {
        // Fallback if we don't know the exact structure
        onUploadComplete(response);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(err.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold mb-1.5 text-ink-500 dark:text-ink-300">
        {label}
      </label>
      <div 
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors
          ${isUploading ? 'border-signal bg-signal/5' : 'border-paper-300 hover:border-signal hover:bg-paper-100 dark:border-paper-600 dark:hover:border-signal dark:hover:bg-paper-700/50'}
        `}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{ cursor: isUploading ? 'default' : 'pointer' }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*"
          className="hidden" 
          disabled={isUploading}
        />

        {preview && !error ? (
          <div className="relative w-full flex justify-center">
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
          </div>
        ) : (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-ink-400 dark:text-ink-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">
              Click or drag file to upload
            </p>
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-black/90 flex flex-col items-center justify-center rounded-xl p-4">
            <div className="w-full max-w-xs bg-paper-200 dark:bg-paper-700 rounded-full h-2.5 mb-2 overflow-hidden">
              <div 
                className="bg-signal h-2.5 rounded-full transition-all duration-200" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm font-bold text-signal">{progress}% Uploading...</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-stamp font-medium">{error}</p>
      )}
    </div>
  );
}
