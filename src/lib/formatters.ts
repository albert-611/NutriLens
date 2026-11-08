export const formatCurrency = (amount: number | null | undefined, locale: string = 'en'): string => {
  if (amount === null || amount === undefined) return '—';
  
  const formatted = new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `৳ ${formatted}`;
};

export const formatGrams = (grams: number | null | undefined, locale: string = 'en'): string => {
  if (grams === null || grams === undefined) return '—';

  const formatted = new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(grams);
  return `${formatted} ${locale === 'bn' ? 'গ্রাম' : 'g'}`;
};

export const formatTimestamp = (isoString: string | null | undefined, locale: string = 'en'): string => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return isoString;
  }
};
