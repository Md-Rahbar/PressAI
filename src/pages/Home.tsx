import React, { useState } from 'react';
import { Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';
import URLInput from '../components/URLInput';
import SummaryPreview from '../components/SummaryPreview';
import VideoPreview from '../components/VideoPreview';
import { Summary, Project } from '../types';
import { extractSummaryAndScript, getImagesForSummary } from '../services/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [project, setProject] = useState<Project | null>(null);

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

  const handleGenerateVideo = async () => {
    if (!summary) return;
    
    try {
      toast.loading('Generating video...', { id: 'video-generation' });
      
      // Get images based on the summary
      const images = await getImagesForSummary(summary.content);
      
      // Create a project with the generated content
      const newProject: Project = {
        id: Date.now().toString(),
        title: summary.title,
        summary: summary,
        videoScript: {
          scenes: summary.videoScript?.split('\n').map((text, index) => ({
            text,
            image: images[index % images.length] || '',
            duration: 5
          })) || []
        },
        status: 'processing',
        createdAt: new Date().toISOString()
      };
      
      setProject(newProject);
      toast.success('Video generation started!', { id: 'video-generation' });
      
      // Simulate video processing
      setTimeout(() => {
        setProject(prev => prev ? {
          ...prev,
          status: 'ready',
          videoUrl: 'https://example.com/video.mp4' // This would be the actual video URL in production
        } : null);
      }, 5000);
      
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('Failed to generate video. Please try again.', { id: 'video-generation' });
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
          <SummaryPreview
            summary={summary}
            onApprove={handleGenerateVideo}
            onEdit={() => {
              toast.error('Edit functionality coming soon!');
            }}
          />
        )}

        {project && (
          <VideoPreview
            project={project}
            onShare={() => {
              toast.error('Share functionality coming soon!');
            }}
            onDownload={() => {
              toast.error('Download functionality coming soon!');
            }}
          />
        )}
      </div>
    </main>
  );
}