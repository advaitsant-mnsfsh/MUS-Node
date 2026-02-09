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

            // CONSTRUCTION OF FULL PUBLIC URL FOR LOGGING
            const envUrl = process.env.BACKEND_URL || process.env.BETTER_AUTH_URL || "";
            let logBaseUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
            if (logBaseUrl.endsWith('/api')) {
                logBaseUrl = logBaseUrl.slice(0, -4);
            }
            const publicUrl = `${logBaseUrl}/uploads/${jobId}/${filename}`;

            console.log(`[ImageService] ✅ Saved image: ${filePath}`);
            console.log(`[ImageService] 🔗 PUBLIC URL: ${publicUrl}`);
            console.log(`[ImageService] 📂 Resolved Uploads Path: ${uploadsDir}`);

            // Return THE RELATIVE PATH ONLY. 
            // The client is more capable of deciding how to prepend the base URL.
            return `/uploads/${jobId}/${filename}`;
        } catch (error) {
            console.error(`[ImageService] ❌ Failed to save image ${filename}:`, error);
            // Return empty string or throw depending on desired failure mode
            return "";
        }
    }
}
