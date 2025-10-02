import { v2 as cloudinary } from "cloudinary";

// Validate required environment variables
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

export async function uploadToCloudinary(
  file: File | string,
  folder: string = process.env.CLOUDINARY_DEFAULT_FOLDER || "kuja-twende"
): Promise<CloudinaryUploadResult> {
  try {
    let uploadData: string;

    if (file instanceof File) {
      // Convert File to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      uploadData = `data:${file.type};base64,${base64}`;
    } else {
      uploadData = file;
    }

    const result = await cloudinary.uploader.upload(uploadData, {
      folder,
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto",
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
  crop?: string;
}

export function getOptimizedImageUrl(
  publicId: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
  } = options;

  let transformation = `q_${quality},f_${format}`;

  if (width && height) {
    transformation += `,w_${width},h_${height},c_${crop}`;
  } else if (width) {
    transformation += `,w_${width}`;
  } else if (height) {
    transformation += `,h_${height}`;
  }

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
}

export interface ImageTransformations {
  thumbnail: string;
  medium: string;
  large: string;
  hero: string;
  original: string;
}

export function getImageTransformations(
  publicId: string
): ImageTransformations {
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  return {
    thumbnail: `${baseUrl}/w_300,h_200,c_fill,q_auto,f_auto/${publicId}`,
    medium: `${baseUrl}/w_600,h_400,c_fill,q_auto,f_auto/${publicId}`,
    large: `${baseUrl}/w_1200,h_800,c_fill,q_auto,f_auto/${publicId}`,
    hero: `${baseUrl}/w_1920,h_1080,c_fill,q_auto,f_auto/${publicId}`,
    original: `${baseUrl}/${publicId}`,
  };
}

// Utility function to extract public ID from Cloudinary URL
export function extractPublicIdFromUrl(url: string): string | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const regex = new RegExp(
    `https://res\\.cloudinary\\.com/${cloudName}/.*/([^/]+)$`
  );
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Utility function to check if a string is a Cloudinary public ID
export function isCloudinaryPublicId(publicId: string): boolean {
  return !publicId.includes("http") && publicId.includes("/");
}

// Bulk delete images
export async function deleteMultipleFromCloudinary(
  publicIds: string[]
): Promise<{
  success: boolean;
  results: { publicId: string; success: boolean }[];
}> {
  try {
    const results = await Promise.allSettled(
      publicIds.map((publicId) => deleteFromCloudinary(publicId))
    );

    const detailedResults = results.map((result, index) => ({
      publicId: publicIds[index],
      success: result.status === "fulfilled" && result.value,
    }));

    const allSuccess = detailedResults.every((result) => result.success);

    return {
      success: allSuccess,
      results: detailedResults,
    };
  } catch (error) {
    console.error("Bulk delete error:", error);
    return {
      success: false,
      results: publicIds.map((publicId) => ({ publicId, success: false })),
    };
  }
}
