"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, FileText, Loader2 } from "lucide-react";

interface FileUploadProps {
  bucket: string;
  folder: string;
  accept?: string;
  maxFiles?: number;
  maxSizeBytes?: number;
  label: string;
  existingFiles?: string[];
  onUploadComplete: (urls: string[]) => void;
  onRemove?: (url: string) => void;
}

export default function FileUpload({
  bucket,
  folder,
  accept = "*",
  maxFiles = 1,
  maxSizeBytes = 10 * 1024 * 1024,
  label,
  existingFiles = [],
  onUploadComplete,
  onRemove,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingFiles]
  );

  const handleFiles = async (files: File[]) => {
    setError(null);

    const remainingSlots = maxFiles - existingFiles.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    for (const file of filesToUpload) {
      if (file.size > maxSizeBytes) {
        setError(
          `File "${file.name}" exceeds ${Math.round(
            maxSizeBytes / 1024 / 1024
          )}MB limit`
        );
        return;
      }
    }

    setUploading(true);
    setProgress(0);

    const uploadedUrls: string[] = [];
    const totalFiles = filesToUpload.length;

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      uploadedUrls.push(filePath);
      setProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    onUploadComplete([...existingFiles, ...uploadedUrls]);
    setUploading(false);
    setProgress(0);
  };

  const handleRemove = async (url: string) => {
    // Extract storage path (handles both full URLs and plain paths)
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    const storagePath = idx !== -1 ? url.substring(idx + marker.length) : url;
    await supabase.storage.from(bucket).remove([storagePath]);

    const newFiles = existingFiles.filter((f) => f !== url);
    onRemove?.(url);
    onUploadComplete(newFiles);
  };

  const getFileName = (url: string) => {
    const parts = url.split("/");
    const name = parts[parts.length - 1];
    // Remove timestamp prefix
    return name.replace(/^\d+-[a-z0-9]+\./, ".");
  };

  return (
    <div>
      <label className="block text-sm font-bold text-foreground mb-2">
        {label}
      </label>

      {/* Existing files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2 mb-3">
          {existingFiles.map((url) => (
            <div
              key={url}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded border border-border"
            >
              <FileText size={16} className="text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground truncate flex-1">
                {getFileName(url)}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="text-red-500 hover:text-red-700 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {existingFiles.length < maxFiles && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2
                size={24}
                className="animate-spin text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">
                Uploading... {progress}%
              </p>
              <div className="w-full max-w-xs bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={24} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Max {Math.round(maxSizeBytes / 1024 / 1024)}MB per file
                {maxFiles > 1 &&
                  ` · ${maxFiles - existingFiles.length} file(s) remaining`}
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={maxFiles > 1}
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(Array.from(e.target.files));
              }
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
