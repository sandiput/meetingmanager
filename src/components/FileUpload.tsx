import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, File, Image, Download, Trash2, Eye } from 'lucide-react';
import { Attachment } from '../types';
import { attachmentsApi } from '../services/api';
import { useToast } from '../hooks/useToast';

interface FileUploadProps {
  meetingId?: string;
  existingAttachments?: Attachment[];
  onFilesChange?: (files: File[]) => void;
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  multiple?: boolean;
  onDeleteExisting?: (attachmentId: string) => void;
  fileCategory: 'attachment' | 'photo'; // Made required to enforce separation
  title?: string; // Optional title for the upload section
}

interface UploadProgress {
  [key: string]: number;
}

interface PreviewFile {
  file: File;
  id: string;
  preview?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  meetingId,
  existingAttachments = [],
  onFilesChange,
  onAttachmentsChange,
  maxFileSize = 10, // 10MB default
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  multiple = true,
  onDeleteExisting,
  fileCategory,
  title,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>(existingAttachments);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Update attachments when existingAttachments prop changes
  useEffect(() => {
    // Only update if the actual content has changed, not just the reference
    if (JSON.stringify(attachments) !== JSON.stringify(existingAttachments)) {
      setAttachments(existingAttachments);
    }
  }, [existingAttachments, attachments]);

  useEffect(() => {
    // Cleanup preview URLs when component unmounts
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Generate preview for images
  const generatePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  // Get default accepted types based on file category
  const getDefaultAcceptedTypes = useCallback(() => {
    if (fileCategory === 'photo') {
      return ['image/*'];
    }
    return ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'];
  }, [fileCategory]);

  // Use category-specific accepted types if not provided
  const effectiveAcceptedTypes = acceptedTypes.length > 0 ? acceptedTypes : getDefaultAcceptedTypes();

  // Handle file selection and auto-upload
  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: PreviewFile[] = [];

    for (const file of fileArray) {
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        addToast(`File ${file.name} terlalu besar. Maksimal ${maxFileSize}MB`);
        continue;
      }

      // Validate file type based on category
      let isValidType = false;
      if (fileCategory === 'photo') {
        isValidType = file.type.startsWith('image/');
        if (!isValidType) {
          addToast(`File ${file.name} harus berupa gambar untuk kategori Photos`);
          continue;
        }
      } else {
        // For attachments, check against accepted types
        isValidType = effectiveAcceptedTypes.some(type => {
          if (type.includes('*')) {
            return file.type.startsWith(type.replace('*', ''));
          }
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        });
        if (!isValidType) {
          addToast(`Tipe file ${file.name} tidak didukung untuk kategori Attachments`);
          continue;
        }
      }

      const preview = await generatePreview(file);
      validFiles.push({
        file,
        id: `${Date.now()}-${Math.random()}`,
        preview,
      });
    }

    if (!multiple && validFiles.length > 1) {
      validFiles.splice(1);
    }

    // Use functional update to avoid dependency on selectedFiles
    setSelectedFiles(prevFiles => {
      const newFiles = multiple ? [...prevFiles, ...validFiles] : validFiles;
      onFilesChange?.(newFiles.map(f => f.file));
      return newFiles;
    });

    // Auto-upload files immediately if meetingId is available
    if (meetingId && validFiles.length > 0) {
      await uploadFilesImmediately(validFiles);
    }
  }, [maxFileSize, effectiveAcceptedTypes, multiple, addToast, onFilesChange, generatePreview, fileCategory, meetingId]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // File input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Remove selected file
  const removeSelectedFile = useCallback((id: string) => {
    setSelectedFiles(prevFiles => {
      const newFiles = prevFiles.filter(f => f.id !== id);
      onFilesChange?.(newFiles.map(f => f.file));
      return newFiles;
    });
  }, [onFilesChange]);

  // Handle delete existing attachment
  const handleDeleteExisting = useCallback(async (attachmentId: string) => {
    if (onDeleteExisting) {
      onDeleteExisting(attachmentId);
    }
  }, [onDeleteExisting]);

  // Handle preview image for both files and attachments
  const handlePreviewImage = useCallback((item: File | Attachment) => {
    if (item instanceof File) {
      const url = URL.createObjectURL(item);
      setPreviewImage(url);
    } else {
      // For Attachment type
      setPreviewImage(`${import.meta.env.VITE_API_BASE_URL}/attachments/download/${item.id}`);
    }
    setShowPreview(true);
  }, []);

  // Close preview modal
  const closePreview = useCallback(() => {
    if (previewImage && previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setShowPreview(false);
  }, [previewImage]);

  // Upload files immediately after selection
  const uploadFilesImmediately = useCallback(async (filesToUpload: PreviewFile[]) => {
    if (!meetingId || filesToUpload.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = filesToUpload.map(async (fileItem) => {
        // Use different API endpoints or parameters based on category
        if (fileCategory === 'photo') {
          return await attachmentsApi.upload(meetingId, fileItem.file, 'photo');
        } else {
          return await attachmentsApi.upload(meetingId, fileItem.file, 'attachment');
        }
      });
      
      const responses = await Promise.all(uploadPromises);
      const newAttachments = responses.map(response => response.data).flat();
      
      // Use functional update to avoid dependency on attachments
      setAttachments(prevAttachments => {
        const updatedAttachments = [...prevAttachments, ...newAttachments];
        onAttachmentsChange?.(updatedAttachments);
        return updatedAttachments;
      });
      
      // Clear selected files after successful upload
      setSelectedFiles([]);
      setUploadProgress({});
      
      const successMessage = fileCategory === 'photo' ? 'Foto berhasil diupload' : 'File berhasil diupload';
      addToast(successMessage);
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = fileCategory === 'photo' ? 'Gagal mengupload foto' : 'Gagal mengupload file';
      addToast(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [meetingId, onAttachmentsChange, addToast, fileCategory]);

  // Legacy upload function (kept for backward compatibility)
  const uploadFiles = useCallback(async () => {
    if (!meetingId || selectedFiles.length === 0) return;
    await uploadFilesImmediately(selectedFiles);
  }, [meetingId, selectedFiles, uploadFilesImmediately]);

  // Delete attachment
  const deleteAttachment = useCallback(async (attachmentId: string) => {
    try {
      const response = await attachmentsApi.delete(attachmentId);
      if (response.success) {
        setAttachments(prevAttachments => {
          const newAttachments = prevAttachments.filter(a => a.id !== attachmentId);
          onAttachmentsChange?.(newAttachments);
          return newAttachments;
        });
        const successMessage = fileCategory === 'photo' ? 'Foto berhasil dihapus' : 'File berhasil dihapus';
        addToast(successMessage);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = fileCategory === 'photo' ? 'Gagal menghapus foto' : 'Gagal menghapus file';
      addToast(errorMessage);
    }
  }, [onAttachmentsChange, addToast, fileCategory]);

  // Download attachment
  const downloadAttachment = useCallback(async (attachment: Attachment) => {
    try {
      const blob = await attachmentsApi.download(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.original_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = fileCategory === 'photo' ? 'Gagal mendownload foto' : 'Gagal mendownload file';
      addToast(errorMessage);
    }
  }, [addToast, fileCategory]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on category and type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Get upload area styling based on category
  const getUploadAreaStyling = () => {
    if (fileCategory === 'photo') {
      return {
        borderColor: isDragOver ? 'border-green-500 bg-green-50' : 'border-green-300 hover:border-green-400',
        buttonColor: 'text-green-600 hover:text-green-500',
        focusColor: 'focus-within:ring-green-500'
      };
    }
    return {
      borderColor: isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400',
      buttonColor: 'text-indigo-600 hover:text-indigo-500',
      focusColor: 'focus-within:ring-indigo-500'
    };
  };

  const styling = getUploadAreaStyling();

  // Get section title
  const getSectionTitle = () => {
    if (title) return title;
    return fileCategory === 'photo' ? 'Upload Photos' : 'Upload Attachments/Supporting Documents';
  };

  // Get accepted file types description
  const getAcceptedTypesDescription = () => {
    if (fileCategory === 'photo') {
      return `Gambar (JPG, PNG, GIF) hingga ${maxFileSize}MB`;
    }
    return `PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX hingga ${maxFileSize}MB`;
  };

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h3 className="text-lg font-medium text-gray-900">{getSectionTitle()}</h3>
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          styling.borderColor
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label
              htmlFor={`file-upload-${fileCategory}`}
              className={`cursor-pointer rounded-md bg-white font-medium ${styling.buttonColor} focus-within:outline-none focus-within:ring-2 ${styling.focusColor} focus-within:ring-offset-2`}
            >
              <span>{fileCategory === 'photo' ? 'Pilih Photos' : 'Pilih Files'}</span>
              <input
                ref={fileInputRef}
                id={`file-upload-${fileCategory}`}
                name={`file-upload-${fileCategory}`}
                type="file"
                className="sr-only"
                multiple={multiple}
                accept={effectiveAcceptedTypes.join(',')}
                onChange={handleInputChange}
                disabled={isUploading}
              />
            </label>
            <p className="pl-1">atau drag and drop</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {getAcceptedTypesDescription()}
          </p>
          <p className="text-xs text-blue-600 mt-1 font-medium">
            File akan otomatis terupload setelah dipilih
          </p>
        </div>
      </div>

      {/* Existing Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {fileCategory === 'photo' ? 'Foto yang sudah diupload:' : 'File yang sudah diupload:'}
          </h4>
          {attachments.map((attachment) => (
            <div key={attachment.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              fileCategory === 'photo' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-3">
                {getFileIcon(attachment.file_type)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{attachment.original_name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {attachment.file_type.startsWith('image/') && (
                  <button
                    onClick={() => handlePreviewImage(attachment)}
                    className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded"
                    title="Preview image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => downloadAttachment(attachment)}
                  className="text-green-500 hover:text-green-700 transition-colors p-1 rounded"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
                {onDeleteExisting && (
                  <button
                    onClick={() => handleDeleteExisting(attachment.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {fileCategory === 'photo' ? 'Foto yang dipilih:' : 'File yang dipilih:'}
          </h4>
          {selectedFiles.map((fileItem) => (
            <div key={fileItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {fileItem.preview ? (
                  <img src={fileItem.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                ) : (
                  getFileIcon(fileItem.file.type)
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{fileItem.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(fileItem.file.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {fileItem.file.type.startsWith('image/') && (
                  <button
                    onClick={() => handlePreviewImage(fileItem.file)}
                    className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded"
                    title="Preview image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => removeSelectedFile(fileItem.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Upload Status - No manual upload button needed since files auto-upload */}
          {isUploading && (
            <div className="flex justify-center items-center space-x-2 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="text-sm text-gray-600">
                {fileCategory === 'photo' ? 'Mengupload foto...' : 'Mengupload file...'}
              </span>
            </div>
          )}
          
          {/* Progress Bar */}
          {isUploading && meetingId && uploadProgress[meetingId] !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  fileCategory === 'photo' ? 'bg-green-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${uploadProgress[meetingId]}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closePreview}>
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};