
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setPreviewImage(imageUrl);
      onImageChange(imageUrl);
      setIsUploading(false);
      toast.success('Image uploaded successfully');
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast.error('Failed to upload image');
    };

    reader.readAsDataURL(file);
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
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-300 shadow-lg"
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
                    Image looks good! This will be used as the employee's profile picture.
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
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-600 dark:to-slate-700 rounded-full border-4 border-dashed border-purple-300 dark:border-slate-500 flex items-center justify-center">
                <Upload size={32} className="text-purple-400 dark:text-slate-400" />
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                  disabled={isUploading}
                >
                  <Upload size={20} className="mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Profile Image'}
                </Button>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Supported formats: JPG, PNG, GIF</div>
                  <div>Maximum size: 5MB</div>
                  <div>Recommended: 400x400 pixels</div>
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
