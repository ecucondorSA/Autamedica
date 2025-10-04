/**
 * FileSharing Component
 * Componente drag-and-drop para compartir archivos durante videoconsultas
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useSessionFiles } from '../../hooks/useSessionFiles';
import {
  formatFileSize,
  getFileIcon,
  isImage,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '../../lib/sessionFiles';
import { logger } from '@autamedica/shared';

export interface FileSharingProps {
  userId: string;
  sessionId: string;
  onFileShared?: (fileUrl: string) => void;
  className?: string;
}

export function FileSharing({
  userId,
  sessionId,
  onFileShared,
  className = '',
}: FileSharingProps) {
  const {
    files,
    uploading,
    uploadProgress,
    error,
    uploadFile,
    uploadFiles,
    deleteFile,
    refreshFiles,
    downloadFile,
  } = useSessionFiles({ userId, sessionId });

  const [isDragging, setIsDragging] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length === 0) return;

      try {
        if (selectedFiles.length === 1) {
          const result = await uploadFile(selectedFiles[0]);
          onFileShared?.(result.url);
        } else {
          const results = await uploadFiles(selectedFiles);
          results.forEach((result) => onFileShared?.(result.url));
        }
      } catch (err) {
        logger.error('Upload failed:', err);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploadFile, uploadFiles, onFileShared]
  );

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length === 0) return;

      try {
        if (droppedFiles.length === 1) {
          const result = await uploadFile(droppedFiles[0]);
          onFileShared?.(result.url);
        } else {
          const results = await uploadFiles(droppedFiles);
          results.forEach((result) => onFileShared?.(result.url));
        }
      } catch (err) {
        logger.error('Upload failed:', err);
      }
    },
    [uploadFile, uploadFiles, onFileShared]
  );

  /**
   * Handle delete file
   */
  const handleDelete = useCallback(
    async (filePath: string) => {
      if (!confirm('¿Estás seguro de eliminar este archivo?')) return;
      
      try {
        await deleteFile(filePath);
      } catch (err) {
        logger.error('Delete failed:', err);
      }
    },
    [deleteFile]
  );

  /**
   * Handle download file
   */
  const handleDownload = useCallback(
    async (filePath: string, fileName: string) => {
      try {
        await downloadFile(filePath, fileName);
      } catch (err) {
        logger.error('Download failed:', err);
      }
    },
    [downloadFile]
  );

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header with toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowFiles(!showFiles)}
          className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span>Archivos Compartidos</span>
          {files.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
              {files.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setShowFiles(!showFiles)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <svg
            className={`w-5 h-5 transition-transform ${showFiles ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      {showFiles && (
        <div className="flex-1 overflow-y-auto">
          {/* Upload area */}
          <div
            className={`m-4 p-6 border-2 border-dashed rounded-lg transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.documents].join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {isDragging ? (
                  <span className="font-semibold">Suelta los archivos aquí</span>
                ) : (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-semibold"
                      disabled={uploading}
                    >
                      Selecciona archivos
                    </button>
                    <span> o arrástralos aquí</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Imágenes y documentos hasta {MAX_FILE_SIZE / 1024 / 1024}MB
              </p>
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-center text-gray-600 dark:text-gray-400">
                  Subiendo... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Files list */}
          {files.length > 0 && (
            <div className="px-4 pb-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Archivos ({files.length})
              </h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* File icon or thumbnail */}
                      <div className="flex-shrink-0">
                        {isImage(file.type) ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-2xl">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => handleDownload(file.path, file.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Descargar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                      {file.uploadedBy === userId && (
                        <button
                          onClick={() => handleDelete(file.path)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length === 0 && !uploading && (
            <div className="px-4 pb-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay archivos compartidos aún
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
