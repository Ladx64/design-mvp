"use client"

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Trash2, Mouse, Pen } from "lucide-react";

interface AnalysisResponse {
  status: string;
  analysis?: string;
  mockup?: string;
  message?: string;
}

interface Section {
  id: string;
  title: string;
  strengths?: string;
  improvements?: string[];
}

const DynamicAnalysis = ({ analysisText }: { analysisText: string }) => {
  if (!analysisText) return null;

  // Split by numbered sections (1., 2., etc.)
  const parts = analysisText.split(/(\d+\.)/).filter(Boolean);
  const sections: Section[] = [];
  
  for (let i = 0; i < parts.length; i += 2) {
    const number = parts[i].trim();
    const content = parts[i + 1] || '';
    
    // Extract title (everything before first dash or colon)
    const titleMatch = content.match(/^([^-:]+)/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Extract strengths and improvements
    const strengthMatch = content.match(/Strengths:([^]*?)(?=Improvements:|$)/i);
    const improvementsMatch = content.match(/Improvements:([^]*?)(?=\d+\.|$)/i);
    
    sections.push({
      id: number.replace('.', ''),
      title,
      strengths: strengthMatch ? strengthMatch[1].trim() : undefined,
      improvements: improvementsMatch 
        ? improvementsMatch[1]
            .split(/[•*-]/)
            .map(i => i.trim())
            .filter(Boolean)
        : undefined
    });
  }

  return (
    <div className="space-y-8 prose prose-slate max-w-none">
      {sections.map((section) => (
        <div key={section.id} className="border-b pb-6 last:border-b-0">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {section.id}. {section.title}
          </h2>
          {section.strengths && (
            <div className="mb-4">
              <h3 className="text-base font-semibold text-emerald-700 mb-2">✨ Strengths</h3>
              <div className="pl-4 border-l-2 border-emerald-200 bg-emerald-50/50 p-3 rounded">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.strengths}
                </p>
              </div>
            </div>
          )}
          {section.improvements && section.improvements.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-amber-700 mb-2">🎯 Areas for Improvement</h3>
              <div className="pl-4 border-l-2 border-amber-200 bg-amber-50/50 p-3 rounded">
                <ul className="space-y-2 list-none">
                  {section.improvements.map((improvement, idx) => (
                    <li key={`${section.id}-${idx}`} className="text-gray-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span className="leading-relaxed">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referenceDescription, setReferenceDescription] = useState('');
  const [researchFile, setResearchFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setPageLoading(false), 1000);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      if (event.target.id === 'reference-upload') {
        const newFiles = Array.from(files);
        if (referenceFiles.length + newFiles.length > 3) {
          setError('Maximum 3 reference files allowed');
          return;
        }
        setReferenceFiles(prev => [...prev, ...newFiles]);
      } else if (event.target.id === 'research-upload') {
        const file = files[0];
        setResearchFile(file);
      } else {
        const file = files[0];
        setUploadedFile(file);
        setUploadedImage(URL.createObjectURL(file));
        simulateUpload();
      }
    }
  };

  const handleDeleteImage = () => {
    setUploadedFile(null);
    setUploadedImage('');
    setUploadProgress(0);
  };

  const handleRemoveReference = (index: number) => {
    setReferenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveResearch = () => {
    setResearchFile(null);
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
      
      // Append research file if available
      if (researchFile) {
        formData.append('research', researchFile);
      }
      
      // Append reference files
      referenceFiles.forEach((file, index) => {
        formData.append(`reference_${index + 1}`, file);
      });
      
      // Append reference description
      if (referenceDescription) {
        formData.append('reference_description', referenceDescription);
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
          <div className="space-y-8">
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

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Upload Your Research</h2>
              {!researchFile ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="research-upload"
                    accept=".pdf"
                  />
                  <label htmlFor="research-upload" className="w-full h-full flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <div>
                      <span className="text-purple-600">Upload research document</span>
                    </div>
                    <p className="text-sm text-gray-500">PDF files only</p>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">📄</span>
                    <span>{researchFile.name}</span>
                    <span className="text-gray-500 text-sm">
                      {Math.round(researchFile.size / 1024)} KB
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveResearch}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
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
                <div className="space-y-4">
                  <div>
                    <textarea
                      value={referenceDescription}
                      onChange={(e) => setReferenceDescription(e.target.value)}
                      placeholder="Describe specific changes you want (e.g., 'Make the header more minimalistic', 'Use a darker color scheme')"
                      className="w-full px-3 py-2 border rounded-lg min-h-[100px] resize-none"
                    />
                  </div>
                  
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="reference-upload"
                      accept="image/*"
                      multiple
                      max="3"
                    />
                    <label htmlFor="reference-upload" className="w-full h-full flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <div>
                        <span className="text-purple-600">Upload references</span>
                      </div>
                      <p className="text-sm text-gray-500">Upload up to 3 reference images (PNG, JPG, or GIF)</p>
                    </label>
                  </div>

                  {referenceFiles.length > 0 && (
                    <div className="space-y-2">
                      {referenceFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">📄</span>
                            <span>{file.name}</span>
                            <span className="text-gray-500 text-sm">
                              {Math.round(file.size / 1024)} KB
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveReference(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-xl mb-6 text-gray-900">Analysis Report</h3>
              <div className="overflow-y-auto max-h-[600px] pr-4 -mr-4">
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
              {isLoading ? (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p>Generating mockup...</p>
                </div>
              ) : analysisData?.mockup ? (
                <div className="aspect-video bg-white rounded-lg overflow-hidden">
                  {(() => {
                    try {
                      // First parse the outer JSON string
                      const mockupData = JSON.parse(analysisData.mockup);
                      
                      // Create a minimal HTML document with the mockup content
                      const htmlContent = [
                        '<!DOCTYPE html>',
                        '<html>',
                        '<head>',
                        '<meta charset="utf-8">',
                        '<meta name="viewport" content="width=device-width, initial-scale=1">',
                        '<style>',
                        '* { margin: 0; padding: 0; box-sizing: border-box; }',
                        'body { width: 100%; height: 100%; }',
                        '#mockup-root { width: 100%; height: 100%; }',
                        mockupData.css || '',
                        '</style>',
                        '</head>',
                        '<body>',
                        '<div id="mockup-root">',
                        mockupData.html || '<div>No content available</div>',
                        '</div>',
                        '</body>',
                        '</html>'
                      ].join('');

                      return (
                        <iframe
                          srcDoc={htmlContent}
                          className="w-full h-full border-0"
                          title="Generated UI Mockup"
                          sandbox="allow-scripts"
                        />
                      );
                    } catch (error) {
                      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                      console.error('Error parsing mockup:', errorMessage);
                      return (
                        <div className="w-full h-full flex items-center justify-center text-red-500">
                          Error rendering mockup: {errorMessage}
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p>No mockup available</p>
                </div>
              )}
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
              (currentStep === 0 && !uploadedFile)}
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
