/**
 * Resizes and compresses an image on the client side to reduce upload payload.
 * Target: Max dimension 1280px, low-to-medium JPEG quality.
 */
export async function resizeImage(file: File, maxDimension = 1280, quality = 0.6): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDimension) {
                        height *= maxDimension / width;
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width *= maxDimension / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Failed to get canvas context');

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to low-quality JPEG to minimize base64 size
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                const base64 = dataUrl.split(',')[1];
                resolve(base64);
            };
            img.onerror = () => reject('Failed to load image');
        };
        reader.onerror = () => reject('Failed to read file');
    });
}
