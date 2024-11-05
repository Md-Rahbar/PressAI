// src/pages/Home.tsx
import React, { useState } from 'react';
import { Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';
import URLInput from '../components/URLInput';
import SummaryPreview from '../components/SummaryPreview';
import VideoPreview from '../components/VideoPreview';
import ImagePreview from '../components/ImagePreview';
import EditSummaryModal from '../components/EditSummaryModal'; // Import the modal
import { Summary, Project } from '../types';
import { extractSummaryAndScript, getImagesForSummary } from '../services/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Modal state
  const [targetLanguage, setTargetLanguage] = useState<string>('en'); // Language state

  const handleURLSubmit = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await extractSummaryAndScript(url);
      
      const summaryData: Summary = {
        title: 'Press Release Summary',
        content: response.summary,
        url: url,
        videoScript: response.video_script
      };
      
      setSummary(summaryData);
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Error extracting summary:', error);
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!summary) return;
    
    setIsGeneratingImages(true);
    try {
      const fetchedImages = await getImagesForSummary(summary.content);
      setImages(fetchedImages.map((image: any) => image.url));
      toast.success('Images generated successfully!');
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to fetch images. Please try again.');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!summary || images.length === 0) return;

    try {
      toast.loading('Generating video...', { id: 'video-generation' });
      
      const newProject: Project = {
        id: Date.now().toString(),
        title: summary.title,
        summary: summary,
        videoScript: {
          scenes: summary.videoScript?.split('\n').map((text, index) => ({
            text,
            image: images[index % images.length] || '',
            duration: 3
          })) || []
        },
        status: 'processing',
        createdAt: new Date().toISOString()
      };

      setProject(newProject);
      toast.success('Video generation started!', { id: 'video-generation' });

      // Make the API call to generate video
      const response = await fetch('http://localhost:5000/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_script: newProject.videoScript,
          images: newProject.videoScript.scenes.map(scene => scene.image),
          target_language: targetLanguage // Pass the language to the server
        }),
      });

      const result = await response.json();
      if (result.video_path) {
        setProject(prev => prev ? { ...prev, status: 'ready', videoUrl: result.video_path } : null);
        toast.success('Video generated successfully!', { id: 'video-generation' });
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('Failed to generate video. Please try again.', { id: 'video-generation' });
    }
  };

  const handleEditSummary = (newContent: string) => {
    if (summary) {
      setSummary({ ...summary, content: newContent });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Newspaper className="mx-auto h-12 w-12 text-indigo-600" />
        <h1 className="mt-4 text-4xl font-bold text-gray-900">
          ~| Press World |~
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          <b>Generate videos for News without hassle</b>
        </p>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <URLInput onSubmit={handleURLSubmit} isLoading={isLoading} />
        
        {summary && !project && (
          <>
            <SummaryPreview
              summary={summary}
              onApprove={handleGenerateImages}
              onEdit={() => setIsEditing(true)} // Open edit modal
            />
            <div className="flex space-x-4">
              <button 
                onClick={handleGenerateImages} 
                className="p-2 bg-green-600 text-white rounded"
                disabled={isGeneratingImages}
              >
                {isGeneratingImages ? 'Generating Images...' : 'Generate Images'}
              </button>
              <button 
                onClick={handleGenerateVideo} 
                className="p-2 bg-blue-600 text-white rounded"
                disabled={!images.length}
              >
                Generate Video
              </button>
            </div>
            {images.length > 0 && (
              <ImagePreview images={images} />
            )}
          </>
        )}

        {project && (
          <VideoPreview
            project={project}
            onShare={() => {
              toast.error('Share functionality is on work!');
            }}
            onDownload={() => {
              toast.error('Download functionality is on work!');
            }}
          />
        )}
      </div>

      <EditSummaryModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        summaryContent={summary ? summary.content : ''}
        onSave={handleEditSummary}
      />
    </main>
  );
}
