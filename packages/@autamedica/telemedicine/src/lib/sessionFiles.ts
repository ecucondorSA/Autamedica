/**
 * Session File Management
 * Sistema de compartir archivos durante sesiones de videoconsulta
 *
 * @module sessionFiles
 */

import { getSupabaseClient } from './supabaseClient';

/**
 * File upload result
 */
export interface FileUploadResult {
  path: string;
  url: string;
  fullPath: string;
}

/**
 * File metadata
 */
export interface SessionFile {
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

/**
 * Allowed file types for medical documents
 */
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
};

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.documents,
];

/**
 * Maximum file size (50MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!ALL_ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan imágenes y documentos médicos.',
    };
  }

  return { valid: true };
}

/**
 * Generate file path for storage
 */
export function generateFilePath(
  userId: string,
  sessionId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${sessionId}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Upload file to storage
 */
export async function uploadSessionFile(
  file: File,
  userId: string,
  sessionId: string,
  onProgress?: (progress: number) => void
): Promise<FileUploadResult> {
  const supabase = getSupabaseClient();

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique file path
  const filePath = generateFilePath(userId, sessionId, file.name);

  // Upload file
  const { data, error } = await supabase.storage
    .from('telemedicine-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir archivo: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('telemedicine-files')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: urlData.publicUrl,
    fullPath: data.fullPath || data.path,
  };
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  userId: string,
  sessionId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<FileUploadResult[]> {
  const results: FileUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadSessionFile(
      files[i],
      userId,
      sessionId,
      (progress) => onProgress?.(i, progress)
    );
    results.push(result);
  }

  return results;
}

/**
 * Delete a file from storage
 */
export async function deleteSessionFile(filePath: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage
    .from('telemedicine-files')
    .remove([filePath]);

  if (error) {
    throw new Error(`Error al eliminar archivo: ${error.message}`);
  }
}

/**
 * List all files in a session
 */
export async function listSessionFiles(
  userId: string,
  sessionId: string
): Promise<SessionFile[]> {
  const supabase = getSupabaseClient();

  const folderPath = `${userId}/${sessionId}`;

  const { data, error } = await supabase.storage
    .from('telemedicine-files')
    .list(folderPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    throw new Error(`Error al listar archivos: ${error.message}`);
  }

  // Convert to SessionFile format
  const files: SessionFile[] = data.map((file) => {
    const filePath = `${folderPath}/${file.name}`;
    const { data: urlData } = supabase.storage
      .from('telemedicine-files')
      .getPublicUrl(filePath);

    return {
      name: file.name,
      path: filePath,
      size: file.metadata?.size || 0,
      type: file.metadata?.mimetype || 'application/octet-stream',
      url: urlData.publicUrl,
      uploadedAt: file.created_at || new Date().toISOString(),
      uploadedBy: userId,
    };
  });

  return files;
}

/**
 * Download a file
 */
export async function downloadSessionFile(filePath: string): Promise<Blob> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from('telemedicine-files')
    .download(filePath);

  if (error) {
    throw new Error(`Error al descargar archivo: ${error.message}`);
  }

  return data;
}

/**
 * Get file URL (signed URL for private files)
 */
export async function getFileUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from('telemedicine-files')
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Error al obtener URL del archivo: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Check if file is an image
 */
export function isImage(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.images.includes(fileType);
}

/**
 * Check if file is a document
 */
export function isDocument(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.documents.includes(fileType);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Get file icon based on type
 */
export function getFileIcon(fileType: string): string {
  if (isImage(fileType)) return '🖼️';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('text')) return '📃';
  return '📎';
}

/**
 * Create thumbnail for image (client-side)
 */
export function createImageThumbnail(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isImage(file.type)) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL(file.type));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
