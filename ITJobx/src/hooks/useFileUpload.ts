import { useState, useRef } from "react";
import axios, { CancelTokenSource } from "axios";

export interface FilePickerResult {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export interface UseFileUploadResult {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadFile: (
    file: FilePickerResult,
    endpoint: string,
    fieldName: string,
    token: string,
    allowedExtensions: string[],
    maxSize: number
  ) => Promise<any>;
  cancelUpload: () => void;
  reset: () => void;
}

export const useFileUpload = (): UseFileUploadResult => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const cancelSourceRef = useRef<CancelTokenSource | null>(null);

  const cancelUpload = () => {
    if (cancelSourceRef.current) {
      cancelSourceRef.current.cancel("Upload cancelled by user.");
      setIsUploading(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  };

  const uploadFile = async (
    file: FilePickerResult,
    endpoint: string,
    fieldName: string,
    token: string,
    allowedExtensions: string[],
    maxSize: number
  ): Promise<any> => {
    reset();

    // 1. Client-side Size Validation
    if (file.size > maxSize) {
      const sizeMsg = `The selected file is larger than the allowed limit of ${maxSize / (1024 * 1024)} MB.`;
      setError(sizeMsg);
      throw new Error(sizeMsg);
    }

    // 2. Client-side Extension Validation
    const ext = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      const extMsg = `Unsupported file format. Allowed formats: ${allowedExtensions.join(", ")}`;
      setError(extMsg);
      throw new Error(extMsg);
    }

    setIsUploading(true);
    cancelSourceRef.current = axios.CancelToken.source();

    const formData = new FormData();
    // In React Native, FormData accepts an object with uri, name, and type for files
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name,
      type: file.type
    } as any);

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        timeout: 60000, // 60s timeout limit
        cancelToken: cancelSourceRef.current.token,
        onUploadProgress: (progressEvent: any) => {
          const total = progressEvent.total || file.size;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setProgress(percentCompleted);
        }
      });

      setIsUploading(false);
      return response.data;

    } catch (err: any) {
      setIsUploading(false);
      setProgress(0);

      if (axios.isCancel(err)) {
        const cancelMsg = "Upload cancelled by user.";
        setError(cancelMsg);
        throw new Error(cancelMsg);
      }

      // Safe error mapping
      let errorMsg = "The file could not be uploaded. Please try again.";
      if (err.response) {
        const backendError = err.response.data?.error;
        if (backendError) {
          if (backendError.code === "FILE_TOO_LARGE") {
            errorMsg = "The selected file is larger than the allowed limit.";
          } else if (backendError.code === "INVALID_FILE_SIGNATURE") {
            errorMsg = "This file could not be accepted. Please choose another file.";
          } else if (backendError.code === "UPLOAD_RATE_LIMIT_EXCEEDED") {
            errorMsg = "Too many upload attempts. Please try again later.";
          } else {
            errorMsg = backendError.message || errorMsg;
          }
        } else if (err.response.status === 413) {
          errorMsg = "Payload too large. The file exceeds server limits.";
        }
      } else if (err.code === "ECONNABORTED") {
        errorMsg = "Upload timed out. Please check your network connection.";
      }

      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return {
    isUploading,
    progress,
    error,
    uploadFile,
    cancelUpload,
    reset
  };
};
