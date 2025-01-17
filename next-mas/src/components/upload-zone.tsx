"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function UploadZone() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files?.[0]) {
      if (files[0].type.startsWith("image/")) {
        setSelectedFile(files[0]);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files?.[0]) {
      if (files[0].type.startsWith("image/")) {
        setSelectedFile(files[0]);
      }
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      router.push(`/upload?image=${encodeURIComponent(imageUrl)}`);
    }
  }, [selectedFile, router]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4">
        <Upload className="w-12 h-12 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="font-medium">
            {selectedFile ? selectedFile.name : "Drop your image here"}
          </h3>
          <p className="text-sm text-muted-foreground">
            or click to select a file
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          id="file-upload"
        />
        <div className="flex gap-4">
          <Button
            variant="outline"
            asChild
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              Select File
            </label>
          </Button>
          {selectedFile && (
            <Button onClick={handleUpload}>
              Upload
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
