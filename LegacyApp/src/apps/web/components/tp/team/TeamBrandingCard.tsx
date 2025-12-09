'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, Lock, Sparkles, Upload, X, Loader2, ImageIcon, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageCropModal } from './ImageCropModal';

const AVAILABLE_COLORS = [
  { name: 'Blue', value: '#356793' },
  { name: 'Navy', value: '#0f172a' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Indigo', value: '#4f46e5' },
];

export interface TeamBrandingCardProps {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string | null;
  fontUrl?: string | null;
  fontName?: string | null;
  canEdit: boolean;
  canCustomize: boolean;
  onSave: (data: { primaryColor: string; secondaryColor: string }) => Promise<void>;
  onLogoUpload: (file: File, onProgress: (progress: number) => void) => Promise<void>;
  onLogoDelete: () => Promise<void>;
  onFontUpload?: (file: File, fontName: string, onProgress: (progress: number) => void) => Promise<void>;
  onFontDelete?: () => Promise<void>;
  onShowPaywall: () => void;
  isSaving?: boolean;
}

export function TeamBrandingCard({
  primaryColor = '#356793',
  secondaryColor = '#ec4899',
  logoUrl,
  fontUrl,
  fontName,
  canEdit,
  canCustomize,
  onSave,
  onLogoUpload,
  onLogoDelete,
  onFontUpload,
  onFontDelete,
  onShowPaywall,
  isSaving = false,
}: TeamBrandingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState(primaryColor);
  const [selectedSecondary, setSelectedSecondary] = useState(secondaryColor);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [fontUploadProgress, setFontUploadProgress] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingFont, setIsDeletingFont] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedPrimary(primaryColor);
    setSelectedSecondary(secondaryColor);
  }, [primaryColor, secondaryColor]);

  const handleSave = async () => {
    await onSave({
      primaryColor: selectedPrimary,
      secondaryColor: selectedSecondary,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedPrimary(primaryColor);
    setSelectedSecondary(secondaryColor);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (!canCustomize) {
      onShowPaywall();
      return;
    }
    setIsEditing(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropImageSrc(null);
    try {
      setUploadProgress(0);
      const file = new File([croppedBlob], 'logo.jpg', { type: 'image/jpeg' });
      await onLogoUpload(file, setUploadProgress);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
  };

  const handleLogoDelete = async () => {
    try {
      setIsDeleting(true);
      await onLogoDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadClick = () => {
    if (!canCustomize) {
      onShowPaywall();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFontSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFontUpload) return;

    const validTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/x-font-ttf', 'application/x-font-otf'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['ttf', 'otf', 'woff', 'woff2'];

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension || '')) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    const extractedFontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');

    try {
      setFontUploadProgress(0);
      await onFontUpload(file, extractedFontName, setFontUploadProgress);
    } finally {
      setFontUploadProgress(null);
      if (fontInputRef.current) {
        fontInputRef.current.value = '';
      }
    }
  };

  const handleFontDelete = async () => {
    if (!onFontDelete) return;
    try {
      setIsDeletingFont(true);
      await onFontDelete();
    } finally {
      setIsDeletingFont(false);
    }
  };

  const handleFontUploadClick = () => {
    if (!canCustomize) {
      onShowPaywall();
      return;
    }
    fontInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-500">Team Branding</h3>
            {!canCustomize && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" />
                Organization
              </span>
            )}
          </div>
          {canEdit && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className={!canCustomize ? 'text-amber-600 border-amber-300 hover:bg-amber-50' : ''}
            >
              {!canCustomize && <Sparkles className="w-4 h-4 mr-1" />}
              {canCustomize ? 'Edit' : 'Upgrade to Customize'}
            </Button>
          )}
        </div>

        {!canCustomize && !isEditing && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              Customize your team's colors and branding with an Organization subscription.
              Your team colors will appear throughout the app for a personalized experience.
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Primary Color</span>
              <div
                className="w-8 h-8 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: selectedPrimary }}
              />
            </div>
            {isEditing && (
              <div className="grid grid-cols-8 gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedPrimary(color.value)}
                    className="group flex flex-col items-center gap-1"
                    title={color.name}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                        selectedPrimary === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-900'
                          : 'hover:scale-110'
                      )}
                      style={{ backgroundColor: color.value }}
                    >
                      {selectedPrimary === color.value && (
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 group-hover:text-gray-700">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Secondary Color</span>
              <div
                className="w-8 h-8 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: selectedSecondary }}
              />
            </div>
            {isEditing && (
              <div className="grid grid-cols-8 gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedSecondary(color.value)}
                    className="group flex flex-col items-center gap-1"
                    title={color.name}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                        selectedSecondary === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-900'
                          : 'hover:scale-110'
                      )}
                      style={{ backgroundColor: color.value }}
                    >
                      {selectedSecondary === color.value && (
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 group-hover:text-gray-700">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isEditing && (
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-3">Preview</span>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: selectedPrimary }}
                    >
                      <span className="text-white text-sm font-bold">TP</span>
                    </div>
                  )}
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: selectedPrimary }}
                    >
                      Team Name Preview
                    </p>
                    <p className="text-xs text-gray-500">Your branding colors</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors"
                    style={{ backgroundColor: selectedPrimary }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors"
                    style={{ backgroundColor: selectedSecondary }}
                  >
                    Secondary Button
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                    style={{ backgroundColor: selectedSecondary }}
                  >
                    3 unread
                  </span>
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: `${selectedPrimary}20`,
                      color: selectedPrimary
                    }}
                  >
                    Tag Label
                  </span>
                </div>

                <div
                  className="p-2 rounded-lg border-l-4"
                  style={{ 
                    borderColor: selectedPrimary,
                    backgroundColor: `${selectedPrimary}10`
                  }}
                >
                  <p className="text-xs text-gray-600">
                    Sample calendar event styled with your team colors
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Team Logo</span>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Team logo"
                  className="w-8 h-8 rounded-lg object-cover border-2 border-gray-300"
                />
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadProgress !== null ? (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              </div>
            ) : logoUrl ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <img
                  src={logoUrl}
                  alt="Team logo preview"
                  className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Current team logo</p>
                  {canEdit && canCustomize && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadClick}
                        disabled={isDeleting}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Change
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogoDelete}
                        disabled={isDeleting}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleUploadClick}
                disabled={!canEdit}
                className={cn(
                  'w-full p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 transition-colors',
                  canCustomize && canEdit
                    ? 'border-gray-300 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  canCustomize ? 'bg-primary-100' : 'bg-gray-100'
                )}>
                  <ImageIcon className={cn(
                    'w-6 h-6',
                    canCustomize ? 'text-primary-500' : 'text-gray-400'
                  )} />
                </div>
                <div className="text-center">
                  <p className={cn(
                    'text-sm font-medium',
                    canCustomize ? 'text-gray-700' : 'text-gray-400'
                  )}>
                    {canCustomize ? 'Upload team logo' : 'Logo upload'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {canCustomize ? 'PNG, JPG up to 5MB' : 'Organization tier required'}
                  </p>
                </div>
              </button>
            )}
          </div>

          {onFontUpload && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Custom Font</span>
                {fontName && (
                  <span className="text-xs text-gray-500 font-medium">{fontName}</span>
                )}
              </div>

              <input
                ref={fontInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFontSelect}
                className="hidden"
              />

              {fontUploadProgress !== null ? (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${fontUploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploading... {Math.round(fontUploadProgress)}%
                    </p>
                  </div>
                </div>
              ) : fontUrl && fontName ? (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Type className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-lg text-gray-800"
                      style={{ fontFamily: `"${fontName}", sans-serif` }}
                    >
                      {fontName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Custom team font</p>
                    {canEdit && canCustomize && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFontUploadClick}
                          disabled={isDeletingFont}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Change
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFontDelete}
                          disabled={isDeletingFont}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {isDeletingFont ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleFontUploadClick}
                  disabled={!canEdit}
                  className={cn(
                    'w-full p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 transition-colors',
                    canCustomize && canEdit
                      ? 'border-gray-300 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    canCustomize ? 'bg-primary-100' : 'bg-gray-100'
                  )}>
                    <Type className={cn(
                      'w-6 h-6',
                      canCustomize ? 'text-primary-500' : 'text-gray-400'
                    )} />
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      'text-sm font-medium',
                      canCustomize ? 'text-gray-700' : 'text-gray-400'
                    )}>
                      {canCustomize ? 'Upload custom font' : 'Custom font'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {canCustomize ? 'TTF, OTF, WOFF up to 2MB' : 'Organization tier required'}
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={1}
          cropShape="rect"
        />
      )}
    </div>
  );
}
