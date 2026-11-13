import React, { useCallback, useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept = "image/*", maxSizeMB = 10 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  }, [maxSizeMB]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  }, [maxSizeMB]);

  const validateAndSelect = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  }

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
        ${dragActive ? 'border-cyan-500 bg-cyan-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
        ${error ? 'border-rose-500 bg-rose-50' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <File className="w-8 h-8 text-cyan-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-navy-900 truncate max-w-xs">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button onClick={clearFile} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-1">Drag & drop your file here</p>
          <p className="text-slate-500 text-sm mb-4">or click to browse</p>
          <input 
            type="file" 
            accept={accept} 
            onChange={handleChange} 
            className="hidden" 
            id="file-upload" 
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Select File
          </label>
        </>
      )}
      {error && <p className="text-rose-500 text-sm mt-3">{error}</p>}
    </div>
  );
};
