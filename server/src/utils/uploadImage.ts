import cloudinary from "../config/cloudinary.js";
import { UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";

export function uploadImage(
    buffer: Buffer,
    folder: string,
    publicId?: string,
): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                overwrite: !!publicId,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result!);
            },
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}
