import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPEG, PNG, and WebP images are allowed."),
      );
    }

    callback(null, true);
  },
});

export async function validateImageContents(
  buffer: Buffer,
  declaredMimeType: string,
): Promise<boolean> {
  const { fileTypeFromBuffer } = await import("file-type");
  const detectedType = await fileTypeFromBuffer(buffer);

  return (
    detectedType !== undefined &&
    allowedMimeTypes.includes(detectedType.mime) &&
    detectedType.mime === declaredMimeType
  );
}

export default upload;
