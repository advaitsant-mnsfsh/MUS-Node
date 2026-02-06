import fs from 'fs';
import path from 'path';

export class ImageService {
    /**
     * Saves a Base64 image to the filesystem and returns the public URL path
     */
    static async saveImage(jobId: string, filename: string, base64Data: string): Promise<string> {
        try {
            // Use absolute path relative to project root
            const rootDir = process.cwd();
            const uploadsDir = path.join(rootDir, 'uploads', jobId);

            // Ensure directory exists for this job
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const filePath = path.join(uploadsDir, filename);

            // Clean base64 string if it contains the data prefix
            const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");

            fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));

            console.log(`[ImageService] ✅ Saved image: ${filePath} (${Math.round(cleanBase64.length / 1024)} KB)`);

            // Return the public URL path
            // Note: In production, you might want to prepend the full backend URL, 
            // but for now, we'll keep it relative to the server root.
            return `/uploads/${jobId}/${filename}`;
        } catch (error) {
            console.error(`[ImageService] ❌ Failed to save image ${filename}:`, error);
            // Return empty string or throw depending on desired failure mode
            return "";
        }
    }
}
