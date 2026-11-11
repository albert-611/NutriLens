import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProfilePhotoUploaderProps {
  currentPhotoUrl?: string | null;
  onPhotoSelected: (file: File | null, previewUrl: string | null) => void;
  onPhotoRemoved?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helperText?: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  currentPhotoUrl,
  onPhotoSelected,
  onPhotoRemoved,
  disabled = false,
  size = 'md',
  label = 'Profile Photo',
  helperText = 'Optional: JPG, PNG, or WEBP up to 5MB',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [error, setError] = useState<string | null>(null);

  // Sync with currentPhotoUrl changes
  React.useEffect(() => {
    setPreview(currentPhotoUrl || null);
  }, [currentPhotoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Photo size exceeds 5MB limit. Please choose a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Read and preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      onPhotoSelected(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onPhotoSelected(null, null);
    if (onPhotoRemoved) onPhotoRemoved();
  };

  const dimensionClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }[size];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar Preview Box */}
        <div className="relative group shrink-0">
          <div
            className={`${dimensionClasses} rounded-2xl overflow-hidden bg-slate-100 dark:bg-forest-root border-2 border-dashed border-slate-300 dark:border-forest-border flex items-center justify-center shadow-inner transition-colors duration-150`}
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            )}
          </div>

          {/* Quick Camera Overlay button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo"
            className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-500 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Controls and Guide */}
        <div className="flex-1 space-y-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{preview ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            {preview && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleRemove}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {helperText && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
