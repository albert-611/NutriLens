import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Upload,
  AlertCircle,
  FileImage,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  validateMealImageFile,
  fileToBase64,
  analyzeMealImage,
} from '../../services/mealAnalysisService';

export const AnalyzePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualQuery, setManualQuery] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

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

    // Validate file using service
    const validation = validateMealImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file.');
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

  const handleAnalyze = async () => {
    if (!selectedFile && !manualQuery) {
      setError('Please upload a food photo, take a picture, or select a demo plate.');
      return;
    }

    if (selectedFile && !consentGiven) {
      setError('Please accept the processing consent to analyze your photo.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      setAnalysisStep('Uploading and validating photo resolution...');
      let base64: string | undefined;

      if (selectedFile) {
        base64 = await fileToBase64(selectedFile);
      }

      setAnalysisStep('Analyzing plate with Gemini Vision multimodal detection...');
      const lang = (i18n.language === 'bn' ? 'bn' : 'en') as 'bn' | 'en';

      const response = await analyzeMealImage({
        file: selectedFile,
        base64Data: base64,
        manualQuery: manualQuery || undefined,
        language: lang,
      });

      setAnalysisStep('Mapping food items to Bangladeshi FAO composition catalog...');
      await new Promise((r) => setTimeout(r, 300));

      navigate('/app/confirm', {
        state: {
          analysis: response,
          previewUrl: previewUrl || (selectedFile ? base64 : '/images/demo-plate.png'),
          hasUploadedImage: Boolean(selectedFile),
        },
      });
    } catch (err: any) {
      console.error('Meal analysis error:', err);
      setError(err?.message || 'Failed to analyze meal. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const selectDemoPreset = (preset: typeof sampleDemoMeals[0]) => {
    setManualQuery(preset.title);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Phase 3 • Step 1 of 4
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Image Recognition & Candidate Detection
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('analyze.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('analyze.subtitle')}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-shake">
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
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[320px] ${
              previewUrl
                ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-forest-card'
                : 'border-slate-300 dark:border-forest-border hover:border-emerald-500/60 bg-white dark:bg-forest-card'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-4 w-full">
                <div className="relative max-w-sm mx-auto aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-forest-border shadow-md bg-black/10">
                  <img
                    src={previewUrl}
                    alt="Uploaded meal"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow">
                    Photo Ready
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {selectedFile?.name || 'Meal Photo'} ({((selectedFile?.size || 0) / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    Change photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 w-full max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('analyze.drag_drop')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('analyze.formats')}
                  </p>
                </div>

                {/* Capture & Browse Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                  {/* Take Camera Photo (Mobile friendly) */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />

                  {/* Browse File */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-forest-root border border-slate-200 dark:border-forest-border text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-forest-cardHover transition-colors"
                  >
                    <FileImage className="w-4 h-4" />
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />
                </div>
              </div>
            )}
          </div>

          {/* User Consent Checkbox (FR-02) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-card/50 border border-slate-200 dark:border-forest-border/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-forest-border"
              />
              <span className="text-[11px] leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Consent:</strong> I consent to processing this food image for non-clinical nutritional estimation. Photos are handled privately and not used for model retraining.
              </span>
            </label>
          </div>

          {/* Analyzing Progress State */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200 space-y-2 animate-pulse">
              <div className="flex items-center gap-2 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                <span>Multimodal Vision Recognition in Progress...</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 pl-6">
                {analysisStep || 'Detecting meal components...'}
              </p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            variant="primary"
            size="lg"
            disabled={isAnalyzing}
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
                      <span
                        key={item}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-forest-card text-slate-600 dark:text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Manual Query Input */}
            <div className="pt-2 border-t border-slate-100 dark:border-forest-border/60 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Or type custom dish name:
              </label>
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => {
                  setManualQuery(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Rice, Hilsha fish, Daal..."
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
