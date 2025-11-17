import React from 'react';

interface PromoCarouselProps {
  images: string[];
  currentIndex: number;
}

const PromoCarousel: React.FC<PromoCarouselProps> = ({ images, currentIndex }) => {
  if (!images || images.length === 0) {
    return <div className="w-full h-full bg-[#1A2C4A]"></div>; // Fallback background
  }

  return (
    <div className="w-full h-full relative bg-[#1A2C4A] overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image + index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* Dark overlay for readability, now affects the full screen */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      ))}
    </div>
  );
};

export default PromoCarousel;