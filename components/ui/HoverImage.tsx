import { useState, useRef } from "react";
import Image from "next/image";

interface HoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function HoverImage({ src, alt, className }: HoverImageProps) {
  const [showHover, setShowHover] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const hoverWidth = 256;
      const hoverHeight = 256;
      const offset = 16;

      // Check if there's enough space on the right
      const xPos =
        mouseX + hoverWidth > window.innerWidth
          ? mouseX - hoverWidth - offset
          : mouseX + offset;

      // Check if there's enough space at the bottom
      const yPos =
        mouseY + hoverHeight > window.innerHeight
          ? mouseY - hoverHeight - offset
          : mouseY + offset;

      setPosition({ x: xPos, y: yPos });
    }
  };

  return (
    <div
      ref={imageRef}
      className={`relative ${className}`}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
      onMouseMove={handleMouseMove}
    >
      <Image src={src} alt={alt} fill className="object-cover rounded-md" />
      {showHover && (
        <div
          className="fixed z-[9999] w-64 h-64 pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
            willChange: "transform",
          }}
        >
          <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl border border-border bg-background">
            <Image src={src} alt={alt} fill className="object-cover" priority />
          </div>
        </div>
      )}
    </div>
  );
}
