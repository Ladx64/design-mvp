"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function UploadZone() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const navigateToAnalysis = useCallback((file: File) => {
    // Store file in sessionStorage
    const fileInfo = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    };
    sessionStorage.setItem('selectedFile', JSON.stringify(fileInfo));
    
    // Create object URL for the file
    const fileUrl = URL.createObjectURL(file);
    sessionStorage.setItem('fileUrl', fileUrl);
    
    router.push('/upload');
  }, [router]);

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
        navigateToAnalysis(files[0]);
      }
    }
  }, [navigateToAnalysis]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files?.[0]) {
      if (files[0].type.startsWith("image/")) {
        navigateToAnalysis(files[0]);
      }
    }
  }, [navigateToAnalysis]);

  return (
    <div className="w-full max-w-xl mx-auto">
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
              <Button
                variant="outline"
                asChild
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select File
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
