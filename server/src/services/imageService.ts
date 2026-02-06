import fs from 'fs';
import path from 'path';

export class ImageService {
    /**
     * Saves a Base64 image to the filesystem and returns the public URL path
     */
    static async saveImage(jobId: string, filename: string, base64Data: string): Promise<string> {
        try {
            const uploadsDir = path.join(process.cwd(), 'uploads', jobId);

            // Ensure directory exists for this job
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const filePath = path.join(uploadsDir, filename);

            // Clean base64 string if it contains the data prefix
            const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");

            fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));

            // Return the public URL path
            // Note: In production, you might want to prepend the full backend URL, 
            // but for now, we'll keep it relative to the server root.
            return `/uploads/${jobId}/${filename}`;
        } catch (error) {
            console.error(`[ImageService] Failed to save image ${filename} for job ${jobId}:`, error);
            // Return empty string or throw depending on desired failure mode
            return "";
        }
    }
}
