'use client';

import { useRef, useState } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';

interface ProfilePhotoCardProps {
  name: string;
  email: string;
  photoUrl?: string | null;
  onChangePhoto?: (file: File) => void;
  isUploading?: boolean;
}

export function ProfilePhotoCard({ name, email, photoUrl, onChangePhoto, isUploading }: ProfilePhotoCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChangePhoto) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChangePhoto(file);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayUrl = previewUrl || photoUrl;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <div className="relative w-24 h-24 mx-auto mb-4">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={name}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#356793] flex items-center justify-center text-white text-2xl font-semibold">
            {initials || <User className="w-10 h-10" />}
          </div>
        )}
        {onChangePhoto && (
          <button
            onClick={handleClick}
            disabled={isUploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
      <p className="text-sm text-gray-500">{email}</p>
    </div>
  );
}
