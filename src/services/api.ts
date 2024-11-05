const API_BASE_URL = 'http://localhost:5000';

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'An unexpected error occurred'
    }));
    throw new APIError(error.error || 'Request failed', response.status);
  }
  return response.json();
}

export async function extractSummaryAndScript(url: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/summarize-and-generate-script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    return handleResponse(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to connect to the server. Please check your connection and try again.'
    );
  }
}

export async function getImagesForSummary(summary: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/get-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary }),
    });

    const data = await handleResponse(response);
    return data.images;  // Ensure this returns the images array
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to fetch images. Please check your connection and try again.'
    );
  }
}
