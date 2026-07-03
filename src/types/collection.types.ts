export interface CreateCollectionRequest {
  title: string;
}

export interface UpdateCollectionRequest {
  title?: string;
  visibility?: boolean;
}

export interface SetCoverRequest {
  coverPhotoId: string;
}

export interface RearrangeRequest {
  orderedIds: string[];
}

export interface CollectionQuery {
  visibility?: boolean;
}
