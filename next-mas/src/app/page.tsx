"use client"

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Trash2, Mouse, Pen } from "lucide-react";

interface AnalysisResponse {
  status: string;
  analysis?: string;
  message?: string;
}

interface Section {
  number?: string;
  title?: string;
  strengths?: string;
  improvements?: string[];
}

const DynamicAnalysis = ({ analysisText }: { analysisText: string }) => {
  if (!analysisText) return null;

  const sections = analysisText.split(/(\d+\.)/).filter(Boolean).reduce<Section[]>((acc: Section[], curr, i, arr) => {
    if (/^\d+\.$/.test(curr)) {
      const content = arr[i + 1] || '';
      const [title, ...details] = content.split('-').map(s => s.trim());
      
      const strengthMatch = content.match(/Strengths:([^]*?)(?=Improvements:|$)/);
      const improvementsMatch = content.match(/Improvements:([^]*?)(?=\d+\.|$)/);

      acc.push({
        number: curr.replace('.', ''),
        title,
        strengths: strengthMatch ? strengthMatch[1].trim() : '',
        improvements: improvementsMatch 
          ? improvementsMatch[1]
              .split('*')
              .map(i => i.trim())
              .filter(Boolean)
          : []
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.number} className="border-b pb-4 last:border-b-0">
          <h3 className="text-lg font-semibold mb-3">
            {section.number}. {section.title}
          </h3>
          {section.strengths && (
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-700">Strengths:</h4>
              <p className="text-sm text-gray-600 mt-1">{section.strengths}</p>
            </div>
          )}
          {section.improvements && section.improvements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mt-2">Improvements:</h4>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {section.improvements.map((improvement, idx) => (
                  <li key={idx} className="text-sm text-gray-600">{improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const steps = [
  { label: 'Upload', icon: Upload },
  { label: 'Select References', icon: Mouse },
  { label: 'Analyze', icon: Pen }
];

const DesignAnalysis = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mockReferences = [
    { id: 'ref1', url: '/api/placeholder/300/100' },
    { id: 'ref2', url: '/api/placeholder/300/200' },
    { id: 'ref3', url: '/api/placeholder/300/300' },
    { id: 'ref4', url: '/api/placeholder/300/400' }
  ];

  useEffect(() => {
    setTimeout(() => setPageLoading(false), 1000);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadedImage(URL.createObjectURL(file));
      simulateUpload();
    }
  };

  const handleDeleteImage = () => {
    setUploadedFile(null);
    setUploadedImage('');
    setUploadProgress(0);
  };

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setUploadProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 500);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }
      if (selectedReference) {
        formData.append('reference', selectedReference);
      }

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const analysisResponse = await fetch('http://127.0.0.1:8000/analyze-design', {
        method: 'POST',
        body: formData,
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const data: AnalysisResponse = await analysisResponse.json();
      if (data.status === 'error') {
        throw new Error(data.message || 'Analysis failed');
      }
      
      setAnalysisData(data);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 2) {
      handleAnalysis();
    }
    setCurrentStep(currentStep + 1);
  };

  const renderStep = (): React.ReactNode => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Upload Your Design</h2>
            {!uploadedFile ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="image/*, .pdf"
                />
                <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <div>
                    <span className="text-purple-600">Click to upload</span>
                    <span> or drag and drop</span>
                  </div>
                  <p className="text-sm text-gray-500">PNG, SVG, PDF, GIF or JPG (max. 25mb)</p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative" 
                     onMouseEnter={() => setShowDeleteButton(true)}
                     onMouseLeave={() => setShowDeleteButton(false)}>
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded design"
                    className="rounded-lg w-full"
                  />
                  {showDeleteButton && (
                    <button
                      onClick={handleDeleteImage}
                      className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">📄</span>
                      <span>{uploadedFile.name}</span>
                      <span className="text-gray-500 text-sm">{Math.round(uploadedFile.size / 1024)} KB</span>
                    </div>
                  </div>
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              </div>
            )}
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Select Reference Designs</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Your Design</h3>
                <img 
                  src={uploadedImage} 
                  alt="Uploaded design"
                  className="rounded-lg w-full"
                />
              </div>
              <div>
                <h3 className="font-medium mb-4">Reference Designs</h3>
                <div className="grid grid-cols-2 gap-4">
                  {mockReferences.map((ref) => (
                    <div 
                      key={ref.id}
                      onClick={() => setSelectedReference(selectedReference === ref.url ? null : ref.url)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden ${
                        selectedReference === ref.url ? 'ring-2 ring-black' : ''
                      }`}
                    >
                      <img 
                        src={ref.url} 
                        alt={`Reference ${ref.id}`}
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4">Analysis</h3>
              <div className="prose prose-sm">
                {isLoading ? (
                  <p>Analyzing design...</p>
                ) : error ? (
                  <p className="text-destructive">{error}</p>
                ) : analysisData?.analysis ? (
                  <DynamicAnalysis analysisText={analysisData.analysis} />
                ) : (
                  <p>No analysis available</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4">Generated UI</h3>
              <div className="aspect-video bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        );
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <Progress value={100} className="w-48 h-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">CritiqueBot</h1>
          <p className="text-gray-500">AI-powered design analysis and feedback</p>
        </div>

        <div className="space-y-6">
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          
          <div className="flex justify-between px-4">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-2 ${
                  idx <= currentStep ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <step.icon className="h-5 w-5" />
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="p-6">
          {renderStep()}
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1 || 
              (currentStep === 0 && !uploadedFile) ||
              (currentStep === 1 && !selectedReference)}
            className="bg-black text-white hover:bg-gray-800"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DesignAnalysis;