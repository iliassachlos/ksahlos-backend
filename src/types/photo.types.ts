export interface PhotoResponse {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  number: number;
  visibility: boolean;
  cloudinaryId: string;
}

export interface CreatePhotoRequest {
  title: string;
  description: string;
  url: string;
  category: string;
  number: number;
  visibility: boolean;
}

export interface UpdatePhotoRequest {
  title?: string;
  description?: string;
  category?: string;
  number?: number;
  visibility?: boolean;
}

export interface PhotoQuery {
  category?: string;
  visibility?: boolean;
}
