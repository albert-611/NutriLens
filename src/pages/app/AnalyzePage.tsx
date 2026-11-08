import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Upload,
  Search,
  CheckCircle,
  AlertCircle,
  FileImage,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AnalyzePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualQuery, setManualQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sample pre-configured demo meals for 1-click testing
  const sampleDemoMeals = [
    {
      title: 'Bhat, Masoor Dal & Fried Egg',
      titleBn: 'ভাত, মসুর ডাল ও ডিম ভাজি',
      badge: 'Classic Comfort Plate',
      items: ['Cooked Parboiled Rice (200g)', 'Red Lentils (150g)', 'Fried Egg Omelette (60g)'],
    },
    {
      title: 'Rohu Fish Curry with Potato & Rice',
      titleBn: 'রুই মাছের ঝোল ও ভাত',
      badge: 'Fish Thali',
      items: ['Cooked Rice (200g)', 'Rohu Fish Curry (180g)', 'Boiled Potato (70g)'],
    },
    {
      title: 'Sobji Khichuri (Vegetable Lentil Rice)',
      titleBn: 'সবজি খিচুড়ি',
      badge: 'One-Pot Meal',
      items: ['Rice-Lentil Khichuri (300g)', 'Pumpkin (80g)', 'Carrot (60g)'],
    },
  ];

  const handleFileChange = (file: File) => {
    setError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 5 MB. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile && !manualQuery) {
      setError('Please select an image or choose a demo meal to proceed.');
      return;
    }

    setIsAnalyzing(true);
    // In Phase 2, navigate to Confirm screen with selected candidate fixtures
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/app/confirm', {
        state: {
          hasUploadedImage: Boolean(selectedFile),
          manualQuery: manualQuery || 'Bhat, Masoor Dal & Dim Bhaji',
        },
      });
    }, 800);
  };

  const selectDemoPreset = (preset: typeof sampleDemoMeals[0]) => {
    setManualQuery(preset.title);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('analyze.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('analyze.subtitle')}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Drag & Drop Area */}
        <div className="md:col-span-7 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[300px] ${
              previewUrl
                ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-forest-card'
                : 'border-slate-300 dark:border-forest-border hover:border-emerald-500/60 bg-white dark:bg-forest-card'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-4 w-full">
                <div className="relative max-w-xs mx-auto aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-forest-border shadow-md">
                  <img
                    src={previewUrl}
                    alt="Uploaded meal"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    Ready
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Change photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('analyze.drag_drop')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('analyze.formats')}
                  </p>
                </div>

                <label className="inline-block cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-forest-root border border-slate-200 dark:border-forest-border text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-forest-cardHover transition-colors">
                    <FileImage className="w-4 h-4" />
                    Browse Photo
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Consent Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-forest-card/50 border border-slate-200 dark:border-forest-border/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('analyze.consent_notice')}
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            variant="primary"
            size="lg"
            loading={isAnalyzing}
            className="w-full shadow-lg shadow-emerald-600/20"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            {t('analyze.analyze_btn')}
          </Button>
        </div>

        {/* Right Column: 1-Click Demo Meal Presets */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-4">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                1-Click Demo Plates
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                No camera? Test with pre-verified local meal plates.
              </p>
            </div>

            <div className="space-y-2.5">
              {sampleDemoMeals.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => selectDemoPreset(preset)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 ${
                    manualQuery === preset.title
                      ? 'bg-emerald-50 dark:bg-forest-cardHover border-emerald-500 text-emerald-900 dark:text-emerald-200 font-medium'
                      : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border/60 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {preset.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {preset.titleBn}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {preset.items.map((item) => (
                      <span key={item} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-forest-card text-slate-600 dark:text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
