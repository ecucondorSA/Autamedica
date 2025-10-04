/**
 * useSessionFiles Hook
 * Hook de React para gestión de archivos durante videoconsultas
 */

import { useState, useCallback } from 'react';
import {
  uploadSessionFile,
  uploadMultipleFiles,
  deleteSessionFile,
  listSessionFiles,
  downloadSessionFile,
  validateFile,
  type SessionFile,
  type FileUploadResult,
} from '../lib/sessionFiles';

export interface UseSessionFilesOptions {
  userId: string;
  sessionId: string;
}

export interface UseSessionFilesReturn {
  files: SessionFile[];
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadFile: (file: File) => Promise<FileUploadResult>;
  uploadFiles: (files: File[]) => Promise<FileUploadResult[]>;
  deleteFile: (filePath: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  downloadFile: (filePath: string, fileName: string) => Promise<void>;
}

export function useSessionFiles(options: UseSessionFilesOptions): UseSessionFilesReturn {
  const { userId, sessionId } = options;

  const [files, setFiles] = useState<SessionFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load files from storage
   */
  const loadFiles = useCallback(async () => {
    try {
      setError(null);
      const sessionFiles = await listSessionFiles(userId, sessionId);
      setFiles(sessionFiles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar archivos';
      setError(errorMessage);
      console.error('Error loading files:', err);
    }
  }, [userId, sessionId]);

  /**
   * Upload a single file
   */
  const handleUploadFile = useCallback(
    async (file: File): Promise<FileUploadResult> => {
      try {
        setError(null);
        setUploading(true);
        setUploadProgress(0);

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Upload file
        const result = await uploadSessionFile(file, userId, sessionId, (progress) => {
          setUploadProgress(progress);
        });

        // Refresh file list
        await loadFiles();

        setUploadProgress(100);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al subir archivo';
        setError(errorMessage);
        throw err;
      } finally {
        setUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [userId, sessionId, loadFiles]
  );

  /**
   * Upload multiple files
   */
  const handleUploadFiles = useCallback(
    async (files: File[]): Promise<FileUploadResult[]> => {
      try {
        setError(null);
        setUploading(true);
        setUploadProgress(0);

        // Validate all files
        for (const file of files) {
          const validation = validateFile(file);
          if (!validation.valid) {
            throw new Error(`${file.name}: ${validation.error}`);
          }
        }

        // Upload files
        const results = await uploadMultipleFiles(
          files,
          userId,
          sessionId,
          (fileIndex, progress) => {
            const totalProgress = ((fileIndex + progress / 100) / files.length) * 100;
            setUploadProgress(totalProgress);
          }
        );

        // Refresh file list
        await loadFiles();

        setUploadProgress(100);
        return results;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al subir archivos';
        setError(errorMessage);
        throw err;
      } finally {
        setUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [userId, sessionId, loadFiles]
  );

  /**
   * Delete a file
   */
  const handleDeleteFile = useCallback(
    async (filePath: string) => {
      try {
        setError(null);
        await deleteSessionFile(filePath);
        await loadFiles();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar archivo';
        setError(errorMessage);
        throw err;
      }
    },
    [loadFiles]
  );

  /**
   * Download a file
   */
  const handleDownloadFile = useCallback(async (filePath: string, fileName: string) => {
    try {
      setError(null);
      const blob = await downloadSessionFile(filePath);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al descargar archivo';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    files,
    uploading,
    uploadProgress,
    error,
    uploadFile: handleUploadFile,
    uploadFiles: handleUploadFiles,
    deleteFile: handleDeleteFile,
    refreshFiles: loadFiles,
    downloadFile: handleDownloadFile,
  };
}
