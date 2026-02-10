"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
}

export function PhotoUpload({
  photos,
  onChange,
  maxPhotos = 6,
  label = "Upload Photos",
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to upload photo");
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...photos, ...uploadedUrls]);
        toast.success(
          `${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""} uploaded`
        );
      }
    } catch {
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
        <span className="text-text-tertiary font-normal ml-2">
          ({photos.length}/{maxPhotos})
        </span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Existing photos */}
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-[4/3] rounded-card overflow-hidden bg-surface-secondary group"
          >
            <Image
              src={photo}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <X size={14} />
            </button>
            {index === 0 && (
              <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                Cover
              </span>
            )}
          </div>
        ))}

        {/* Upload button */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-[4/3] rounded-card border-2 border-dashed border-surface-border hover:border-brand-300 bg-surface-secondary hover:bg-brand-50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 size={24} className="text-brand-500 animate-spin" />
            ) : (
              <Upload size={24} className="text-text-tertiary" />
            )}
            <span className="text-xs text-text-tertiary">
              {uploading ? "Uploading..." : "Add photo"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
      <p className="text-xs text-text-tertiary mt-2">
        JPEG, PNG, WebP or GIF. Max 5MB each.
      </p>
    </div>
  );
}

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  name?: string;
}

export function AvatarUpload({ currentUrl, onUpload, name }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUpload(data.url);
        toast.success("Profile photo updated");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to upload photo");
      }
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt="Profile"
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          ) : (
            name?.[0]?.toUpperCase() || "?"
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-surface-border shadow-card flex items-center justify-center hover:bg-surface-hover transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin text-brand-500" />
          ) : (
            <Camera size={14} className="text-text-secondary" />
          )}
        </button>
      </div>
      <div>
        <p className="text-sm font-medium">Profile photo</p>
        <p className="text-xs text-text-tertiary">Click the icon to change</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
