import React from 'react';
import { Summary } from '../types';
import { FileText } from 'lucide-react';

interface SummaryPreviewProps {
  summary: Summary;
  onApprove: () => void;
  onEdit: () => void;
}

export default function SummaryPreview({ summary, onApprove, onEdit }: SummaryPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
      <div className="flex items-start space-x-4">
        <FileText className="w-6 h-6 text-indigo-600 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{summary.title}</h3>
          <p className="mt-2 text-sm text-gray-500">Source: {summary.url}</p>
          <div className="mt-4 space-y-4">
            <div className="prose prose-sm max-w-none">
              <h4 className="text-md font-semibold text-gray-900"><center>Summary</center></h4>
              <p className="text-gray-700">{summary.content}</p>
            </div>
            {summary.videoScript && (
              <div className="prose prose-sm max-w-none">
                <h4 className="text-md font-semibold text-gray-900"><center>Generated Video Script</center></h4>
                <p className="text-gray-700 whitespace-pre-line">{summary.videoScript}</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex space-x-4">
            <button
              onClick={onApprove}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Generate Video
            </button>
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}