import React from 'react';
import { Share2, Download } from 'lucide-react';
import { Project } from '../types';

interface VideoPreviewProps {
  project: Project;
  onShare: () => void;
  onDownload: () => void;
}

export default function VideoPreview({ project, onShare, onDownload }: VideoPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
          <div className="flex space-x-2">
            <button
              onClick={onShare}
              className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onDownload}
              className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {project.status === 'processing' ? (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-600">Generating your video...</p>
              </div>
            </div>
          ) : project.status === 'ready' && project.videoUrl ? (
            <video
              className="w-full rounded-lg"
              controls
              src={project.videoUrl}
              poster={project.videoScript.scenes[0]?.image}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Video preview not available</p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Video Script</h4>
            <div className="space-y-4">
              {project.videoScript.scenes.map((scene, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  {scene.image && (
                    <img
                      src={scene.image}
                      alt={`Scene ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{scene.text}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Duration: {scene.duration}s
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}