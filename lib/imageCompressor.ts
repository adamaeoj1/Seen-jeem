/**
 * Client-Side Image Compressor for Seen Jeem / QADHA
 * Optimizes custom photo questions (e.g., "أسرار الشلة") to max 720px WebP/JPEG data URLs
 * to ensure fast real-time synchronization across TVs and mobile controllers.
 */

export async function compressImageFile(
  file: File | Blob,
  maxDimension = 720,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result as string;
      if (!dataUrl) {
        reject(new Error("Empty image file"));
        return;
      }

      // If it's an SVG, data URL is directly usable without canvas scaling
      if (file.type === "image/svg+xml") {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(dataUrl); // Fallback to raw data URL on decode error
      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // Use smooth image smoothing for crisp downscaled rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Attempt WebP first, fallback to JPEG
          let compressed = "";
          try {
            compressed = canvas.toDataURL("image/webp", quality);
            if (!compressed.startsWith("data:image/webp")) {
              compressed = canvas.toDataURL("image/jpeg", quality);
            }
          } catch {
            compressed = canvas.toDataURL("image/jpeg", quality);
          }

          resolve(compressed || dataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
