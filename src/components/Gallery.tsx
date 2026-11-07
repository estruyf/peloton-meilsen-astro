import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoClose, IoArrowBack, IoArrowForward } from 'react-icons/io5';
import type { GalleryImage } from '../models/Gallery';

interface GalleryProps {
  images: GalleryImage[];
}

const fallback = (e: React.SyntheticEvent<HTMLImageElement>, extra: string[] = []) => {
  const target = e.target as HTMLImageElement;
  target.src = '/peloton-meilsen-grijs.svg';
  target.classList.add('p-8', ...extra);
};

export const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const openLightbox = (index: number, trigger: HTMLElement) => {
    lastTrigger.current = trigger;
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
    lastTrigger.current?.focus();
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    closeButton.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox, goToPrevious, goToNext]);

  // Basic swipe support for phones
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) (delta > 0 ? goToPrevious : goToNext)();
    touchStartX.current = null;
  };

  const current = images[currentIndex];

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((image, index) => (
          <li key={image.src} className="mb-4 break-inside-avoid">
            <button
              type="button"
              className="group block w-full overflow-hidden rounded-2xl bg-ink/5"
              onClick={(e) => openLightbox(index, e.currentTarget)}
              aria-label={`Open foto ${index + 1} van ${images.length}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
                onError={(e) => fallback(e)}
              />
            </button>
          </li>
        ))}
      </ul>

      {isOpen && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fotoweergave"
          className="fixed inset-0 z-[60] flex flex-col bg-ink-900/95 backdrop-blur"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between p-4 text-paper md:p-6">
            <p className="text-sm font-semibold tabular-nums text-paper/70">
              {currentIndex + 1} / {images.length}
            </p>
            <button
              ref={closeButton}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/20 text-2xl transition-colors hover:border-paper"
              onClick={closeLightbox}
              aria-label="Sluiten"
            >
              <IoClose />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-24">
            <img
              src={current.src}
              alt={current.alt}
              className="max-h-full max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => fallback(e, ['bg-paper', 'rounded-lg'])}
            />

            <button
              type="button"
              className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 text-2xl text-paper transition-colors hover:bg-signal hover:text-ink md:flex"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              aria-label="Vorige afbeelding"
            >
              <IoArrowBack />
            </button>
            <button
              type="button"
              className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 text-2xl text-paper transition-colors hover:bg-signal hover:text-ink md:flex"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Volgende afbeelding"
            >
              <IoArrowForward />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
