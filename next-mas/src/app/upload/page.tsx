"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface AnalysisResponse {
  status: string;
  analysis?: string;
  message?: string;
}

export default function UploadPage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get file info from sessionStorage
    const fileUrl = sessionStorage.getItem('fileUrl');
    const fileInfoStr = sessionStorage.getItem('selectedFile');
    
    if (!fileUrl || !fileInfoStr) {
      setError('No file selected');
      return;
    }

    const fileInfo = JSON.parse(fileInfoStr);
    setImageUrl(fileUrl);
    setFileName(fileInfo.name);
  }, []);

  const handleAnalyze = async () => {
    try {
      setIsLoading(true);
      setStatus('Uploading file...');
      setError(null);
      
      // Get the file from the URL
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });
      
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      setStatus('Analyzing design...');
      const analysisResponse = await fetch('http://127.0.0.1:8000/analyze-design', {
        method: 'POST',
        body: formData,
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData: AnalysisResponse = await analysisResponse.json();
      
      if (analysisData.status === 'error') {
        setError(analysisData.message || 'Analysis failed');
      } else {
        setAnalysis(analysisData.analysis || null);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Image Selected</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Upload
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <div className="w-full max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Selected Image</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative w-full aspect-video">
              <Image
                src={imageUrl}
                alt="Selected image"
                fill
                className="object-contain rounded-lg"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
            
            {!analysis && !error && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  {isLoading ? status : "Analyze Design"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Analysis Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : analysis ? (
          <Card>
            <CardHeader>
              <CardTitle>Design Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {analysis}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}