export interface Summary {
  title: string;
  content: string;
  url: string;
  videoScript?: string;
}

export interface VideoScript {
  scenes: {
    text: string;
    image: string;
    duration: number;
  }[];
}

export interface Project {
  id: string;
  title: string;
  summary: Summary;
  videoScript: VideoScript;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  videoUrl?: string;
}

export interface APIResponse {
  summary: string;
  video_script: string;
  images?: string[];
}