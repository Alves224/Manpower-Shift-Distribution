
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, RotateCcw, Crop, X } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  onRemoveImage: () => void;
}

const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  currentImage,
  onImageChange,
  onRemoveImage
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (file: File, maxWidth: number = 150, maxHeight: number = 150, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const resizedImageUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(resizedImageUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Resize the image to a consistent smaller size
      const resizedImageUrl = await resizeImage(file, 150, 150, 0.8);
      setPreviewImage(resizedImageUrl);
      onImageChange(resizedImageUrl);
      setIsUploading(false);
      toast.success('Image uploaded and resized successfully');
    } catch (error) {
      setIsUploading(false);
      toast.error('Failed to process image');
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onRemoveImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
  };

  const displayImage = previewImage || currentImage;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-800 border-2 border-purple-200 dark:border-slate-600">
      <CardContent className="p-6">
        <Label className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 block">
          Profile Image Settings
        </Label>
        
        <div className="space-y-4">
          {displayImage ? (
            <div className="flex items-start gap-6">
              <div className="relative">
                <img
                  src={displayImage}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover border-4 border-purple-300 shadow-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                >
                  <X size={12} />
                </Button>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-purple-200 dark:border-slate-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image Preview
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Image automatically resized to 150x150px for consistent display.
                  </div>
                </div>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={isUploading}
                >
                  <Upload size={16} className="mr-2" />
                  Change Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-600 dark:to-slate-700 rounded-full border-4 border-dashed border-purple-300 dark:border-slate-500 flex items-center justify-center">
                <Upload size={24} className="text-purple-400 dark:text-slate-400" />
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                  disabled={isUploading}
                >
                  <Upload size={20} className="mr-2" />
                  {isUploading ? 'Processing...' : 'Upload Profile Image'}
                </Button>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Supported formats: JPG, PNG, GIF</div>
                  <div>Maximum size: 5MB</div>
                  <div>Auto-resized to: 150x150 pixels</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default EnhancedImageUpload;
