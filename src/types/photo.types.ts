export interface PhotoResponse {
  id: string;
  title: string;
  description: string;
  url: string;
  collectionId: string;
  number: number;
  visibility: boolean;
  hero: boolean;
  cloudinaryId: string;
}

export interface CreatePhotoRequest {
  title: string;
  description: string;
  collectionId: string;
  hero?: boolean;
}

export interface UpdatePhotoRequest {
  title?: string;
  description?: string;
  collectionId?: string;
  number?: number;
  visibility?: boolean;
  hero?: boolean;
}

export interface PhotoQuery {
  title?: string;
  collection?: string;
  visibility?: boolean;
  hero?: boolean;
}
