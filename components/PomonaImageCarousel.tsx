"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const images = [
  {
    src: "/images/carousel/image-2.jpg",
    alt: "Inventory Control",
    quote: "Manage inventory with precision and ease",
  },
  {
    src: "/images/carousel/image-3.jpg",
    alt: "Sales Analytics",
    quote: "Track sales and analytics in real-time",
  },
  {
    src: "/images/carousel/image-4.jpg",
    alt: "Team Management",
    quote: "Empower your team with modern tools",
  },
];

// Add first image at the end for seamless loop
const extendedImages = [...images, ...images, ...images];

export function ImageCarousel() {
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Check if images exist in the public directory
    const checkImages = async () => {
      try {
        const imageChecks = await Promise.all(
          images.map((image) =>
            fetch(image.src).then((res) => {
              if (!res.ok) throw new Error(`Failed to load ${image.src}`);
              return true;
            })
          )
        );
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error loading images:", error);
        setImagesLoaded(false);
      }
    };

    checkImages();
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTranslateX((prev) => {
        const next = prev - 100;
        if (next <= -100 * (images.length * 2)) {
          setTimeout(() => {
            setIsTransitioning(false);
            setTranslateX(-100 * images.length);
          }, 1000);
          return next;
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [imagesLoaded]);

  if (!imagesLoaded) {
    return (
      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
        <p className="text-primary">Loading images...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-primary/10">
      <div
        className={cn(
          "relative h-full flex",
          isTransitioning && "transition-transform duration-1000 ease-linear"
        )}
        style={{ transform: `translateX(${translateX}%)` }}
      >
        {extendedImages.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className="h-full min-w-full flex-shrink-0 relative"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index < 2}
              sizes="100vw"
              onError={(e) =>
                console.error(`Error loading image: ${image.src}`)
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/50 to-primary/30" />
            <div className="absolute bottom-12 left-8 right-8 text-white">
              <p className="text-xl font-semibold md:text-2xl">{image.quote}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
        {images.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              Math.abs(translateX / 100) % images.length === index
                ? "w-8 bg-white"
                : "w-1.5 bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
