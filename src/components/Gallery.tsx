import React, { useState } from 'react';
import { IoClose, IoArrowBack, IoArrowForward } from 'react-icons/io5';
import type { GalleryImage } from '../models/Gallery';

interface GalleryProps {
  images: GalleryImage[];
}

export const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  // If no images, show a message
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-secondary">Er zijn nog geen foto's toegevoegd aan dit evenement.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg shadow-lg bg-light cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/peloton-meilsen-grijs.svg';
                  target.classList.add('p-8');
                }}
              />
            </div>
            <div className="p-4 text-primary">
              <p className="text-sm">{image.caption || image.alt}</p>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-secondary"
            onClick={closeLightbox}
            aria-label="Sluiten"
          >
            <IoClose />
          </button>

          <button
            className="absolute left-4 text-white text-3xl hover:text-secondary"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            aria-label="Vorige afbeelding"
          >
            <IoArrowBack />
          </button>

          <div
            className="max-w-4xl max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="max-w-full max-h-[70vh] object-contain mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/peloton-meilsen-grijs.svg';
                target.classList.add('p-8', 'bg-white', 'rounded-lg');
              }}
            />
            <div className="text-white text-center mt-4">
              <p>{images[currentIndex].caption || images[currentIndex].alt}</p>
              <p className="text-sm text-gray-400 mt-2">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          </div>

          <button
            className="absolute right-4 text-white text-3xl hover:text-secondary"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Volgende afbeelding"
          >
            <IoArrowForward />
          </button>
        </div>
      )}
    </>
  );
};