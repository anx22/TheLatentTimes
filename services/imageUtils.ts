/**
 * Compresses a base64 image string into a JPEG Blob.
 * 
 * @param base64Str - The base64 string of the image (e.g., from Gemini)
 * @param quality - JPEG quality between 0 and 1 (default 0.7)
 * @returns Promise<Blob> - The compressed image blob
 */
export const compressImage = async (base64Str: string, quality = 0.7): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      // Draw white background in case of transparency (PNG to JPEG)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image compression failed'));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = (e) => reject(e);
  });
};
