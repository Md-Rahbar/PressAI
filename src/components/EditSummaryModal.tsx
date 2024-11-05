// src/components/EditSummaryModal.tsx
import React, { useState, useEffect } from 'react';

interface EditSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryContent: string;
  onSave: (newContent: string) => void;
}

const EditSummaryModal: React.FC<EditSummaryModalProps> = ({ isOpen, onClose, summaryContent, onSave }) => {
  const [newContent, setNewContent] = useState(summaryContent);

  // Update the state when the modal opens
  useEffect(() => {
    setNewContent(summaryContent);
  }, [summaryContent, isOpen]);

  const handleSave = () => {
    onSave(newContent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Summary</h2>
        <textarea
          className="w-full h-40 p-2 border rounded"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSummaryModal;
