/**
 * Validation utilities for form inputs and data
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates rate format (e.g., "5%", "5.5%")
 */
export const validateRate = (rate: string): ValidationResult => {
  const trimmed = rate.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Rate tidak boleh kosong' };
  }
  
  const ratePattern = /^\d+(\.\d+)?%$/;
  if (!ratePattern.test(trimmed)) {
    return { isValid: false, error: 'Format rate harus berupa angka diikuti % (contoh: 5% atau 5.5%)' };
  }
  
  return { isValid: true };
};

/**
 * Validates URL format
 */
export const validateUrl = (url: string): ValidationResult => {
  const trimmed = url.trim();
  if (!trimmed) {
    return { isValid: false, error: 'URL tidak boleh kosong' };
  }
  
  try {
    const urlObj = new URL(trimmed);
    if (!['http:', 'https:', 'data:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL harus menggunakan protokol http, https, atau data' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Format URL tidak valid' };
  }
};

/**
 * Validates image URL or data URL
 */
export const validateImageUrl = (url: string): ValidationResult => {
  const trimmed = url.trim();
  if (!trimmed) {
    return { isValid: true }; // Empty is valid (optional)
  }
  
  // Check if it's a data URL
  if (trimmed.startsWith('data:image/')) {
    return { isValid: true };
  }
  
  // Check if it's a valid HTTP/HTTPS URL
  const urlResult = validateUrl(trimmed);
  if (!urlResult.isValid) {
    return urlResult;
  }
  
  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const hasImageExtension = imageExtensions.some(ext => 
    trimmed.toLowerCase().includes(ext)
  );
  
  if (!hasImageExtension && !trimmed.startsWith('data:')) {
    return { 
      isValid: false, 
      error: 'URL harus mengarah ke file gambar (.jpg, .png, .gif, dll)' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates file size
 */
export const validateFileSize = (file: File, maxSizeMB: number = 5): ValidationResult => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates image file type
 */
export const validateImageFile = (file: File): ValidationResult => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, WebP, atau SVG' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates non-empty string
 */
export const validateRequired = (value: string, fieldName: string = 'Field'): ValidationResult => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} tidak boleh kosong` };
  }
  return { isValid: true };
};

/**
 * Validates number is positive
 */
export const validatePositiveNumber = (value: number, fieldName: string = 'Nilai'): ValidationResult => {
  if (value < 0) {
    return { isValid: false, error: `${fieldName} harus bernilai positif` };
  }
  return { isValid: true };
};

/**
 * Validates number is within range
 */
export const validateRange = (
  value: number, 
  min: number, 
  max: number, 
  fieldName: string = 'Nilai'
): ValidationResult => {
  if (value < min || value > max) {
    return { 
      isValid: false, 
      error: `${fieldName} harus antara ${min} dan ${max}` 
    };
  }
  return { isValid: true };
};
