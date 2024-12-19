import { useState, useEffect } from "react";
import { Button } from "./button";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { getCookie } from "@/lib/cookie";

interface ImageUploadProps {
  onUpload: (file: File) => void;
  currentImage?: string | null;
  className?: string;
}

export function ImageUpload({
  onUpload,
  currentImage,
  className,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentImage) {
      // Handle both blob URLs and API URLs
      setPreviewUrl(
        currentImage.startsWith("blob:") || currentImage.startsWith("http")
          ? currentImage
          : `${process.env.NEXT_PUBLIC_API_URL}${currentImage}`
      );
    }
  }, [currentImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    onUpload(file);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {previewUrl && (
        <div className="relative w-48 h-48">
          <Image
            src={previewUrl}
            alt="Product image"
            fill
            className="object-cover rounded-md border border-border"
          />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={loading}
        className="hidden"
        id="image-upload"
      />
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => document.getElementById("image-upload")?.click()}
      >
        <Icons.upload className="mr-2 h-4 w-4" />
        {previewUrl ? "Change Image" : "Upload Image"}
      </Button>
    </div>
  );
}
