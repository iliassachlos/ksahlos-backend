export interface PhotoResponse {
  id: string;
  title: string;
  description: string;
  url: string;
  collectionId: string;
  number: number;
  visibility: boolean;
  cloudinaryId: string;
}

export interface CreatePhotoRequest {
  title: string;
  description: string;
  collectionId: string;
}

export interface UpdatePhotoRequest {
  title?: string;
  description?: string;
  collectionId?: string;
  number?: number;
  visibility?: boolean;
}

export interface PhotoQuery {
  title?: string;
  collection?: string;
  visibility?: boolean;
}
