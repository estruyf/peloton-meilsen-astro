export interface GalleryEvent {
  id: string;
  title: string;
  description: string;
  date?: string;
  coverImage?: string;
  images: GalleryImage[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}
