import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export async function uploadToCloudinary(
  file: Buffer,
  fileName: string,
  folder: string = 'bakakeng/documents'
): Promise<{ public_id: string; secure_url: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve({ public_id: result.public_id, secure_url: result.secure_url });
          else reject(new Error('Upload failed'));
        }
      )
      .end(file);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
