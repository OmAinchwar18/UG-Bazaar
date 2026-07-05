/**
 * Format numeric value to INR Currency (₹) string
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Format string timestamp to locally readable date
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Extract primary product thumbnail URL or fallback to the first image
 */
export function getProductThumbnail(images?: Array<{ url: string; isPrimary: boolean }> | string[] | any): string {
  if (!images || !Array.isArray(images) || images.length === 0) return '';
  const first = images[0];
  if (typeof first === 'object' && first !== null) {
    const primary = images.find((img: any) => img && img.isPrimary);
    return primary ? primary.url : first.url || '';
  }
  return typeof first === 'string' ? first : '';
}

/**
 * Safe translation resolution helper for product multilingual fields.
 * If translation is not present, falls back to English, then to the raw field.
 */
export function getTranslated(field: any, lang: string): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.en || field.hi || field.mr || '';
}

