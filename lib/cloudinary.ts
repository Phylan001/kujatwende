import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: "dwzabqieg",
  api_key: "849581996562879",
  api_secret: "qN5UIvGOyYxINMOBvKY0X7aoB10",
  secure: true,
})

export { cloudinary }

export async function uploadToCloudinary(
  file: File | string,
  folder = "kuja-twende",
): Promise<{
  public_id: string
  secure_url: string
  width: number
  height: number
}> {
  try {
    let uploadData: string

    if (file instanceof File) {
      // Convert File to base64
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      uploadData = `data:${file.type};base64,${base64}`
    } else {
      uploadData = file
    }

    const result = await cloudinary.uploader.upload(uploadData, {
      folder,
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto",
    })

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Failed to upload image to Cloudinary")
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === "ok"
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    return false
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
    crop?: string
  } = {},
): string {
  const { width, height, quality = "auto", format = "auto", crop = "fill" } = options

  let transformation = `q_${quality},f_${format}`

  if (width && height) {
    transformation += `,w_${width},h_${height},c_${crop}`
  } else if (width) {
    transformation += `,w_${width}`
  } else if (height) {
    transformation += `,h_${height}`
  }

  return `https://res.cloudinary.com/dwzabqieg/image/upload/${transformation}/${publicId}`
}

export function getImageTransformations(publicId: string) {
  const baseUrl = `https://res.cloudinary.com/dwzabqieg/image/upload`

  return {
    thumbnail: `${baseUrl}/w_300,h_200,c_fill,q_auto,f_auto/${publicId}`,
    medium: `${baseUrl}/w_600,h_400,c_fill,q_auto,f_auto/${publicId}`,
    large: `${baseUrl}/w_1200,h_800,c_fill,q_auto,f_auto/${publicId}`,
    hero: `${baseUrl}/w_1920,h_1080,c_fill,q_auto,f_auto/${publicId}`,
    original: `${baseUrl}/${publicId}`,
  }
}
