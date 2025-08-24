'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileImageUploadProps {
  currentImage?: string;
  userInitials?: string;
  userName?: string;
  onImageChange?: (imagePath: string | null) => void;
}

const MAX_FILE_SIZE = 600 * 1024; // 600KB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ProfileImageUpload({ 
  currentImage, 
  userInitials, 
  userName,
  onImageChange 
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)';
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeInKB = Math.round(file.size / 1024);
      return `File size (${sizeInKB}KB) exceeds 600KB limit`;
    }

    return null;
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    
    try {
      console.log('ProfileImageUpload: Starting upload for file:', file.name, file.size);
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      });

      console.log('ProfileImageUpload: Response status:', response.status);
      const result = await response.json();
      console.log('ProfileImageUpload: Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast.success('Profile image updated successfully');
      setImagePreview(result.imagePath);
      onImageChange?.(result.imagePath);
      console.log('ProfileImageUpload: Upload successful, image path:', result.imagePath);

    } catch (error) {
      console.error('ProfileImageUpload: Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      // Reset preview on error
      setImagePreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setUploading(true);
    
    try {
      const response = await fetch('/api/profile/image', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove image');
      }

      toast.success('Profile image removed');
      setImagePreview(null);
      onImageChange?.(null);

    } catch (error) {
      console.error('Remove error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24 md:w-32 md:h-32">
          <AvatarImage 
            src={imagePreview || undefined} 
            alt={userName || 'Profile'} 
            className="object-cover"
          />
          <AvatarFallback className="text-lg md:text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {userInitials || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Camera overlay button */}
        <Button
          size="sm"
          variant="secondary"
          className={cn(
            "absolute bottom-0 right-0 rounded-full w-8 h-8 p-0",
            "bg-white border-2 border-gray-200 hover:bg-gray-50",
            "shadow-md transition-all duration-200"
          )}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Click the camera icon to change your profile picture
        </p>
        <p className="text-xs text-gray-500">
          Max size: 600KB • JPEG, PNG, WebP
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>

        {imagePreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
