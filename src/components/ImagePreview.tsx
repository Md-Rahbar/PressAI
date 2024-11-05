import React from 'react';

interface ImagePreviewProps {
  images: string[];
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images }) => {
  return (
    <div className="border border-black p-4 rounded-lg">
      <div className="flex flex-wrap justify-center space-x-4">
        {images.map((src, index) => (
          <img key={index} src={src} alt={`Generated image ${index}`} className="w-32 h-32 object-cover rounded" />
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
