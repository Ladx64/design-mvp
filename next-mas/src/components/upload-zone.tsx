"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function UploadZone() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = useCallback(async () => {
    if (selectedFile) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        router.push(`/upload?image=${encodeURIComponent(data.url)}`);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    }
  }, [selectedFile, router]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {selectedFile && (
        <Alert className="flex items-center gap-2">
          <Check className="h-4 w-4 flex-shrink-0" />
          <AlertDescription>
            Selected file: {selectedFile.name}
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
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
                  Drop your image here
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
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
