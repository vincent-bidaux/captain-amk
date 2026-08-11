const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

export interface PreparedUpload {
  mediaType: string;
  dataBase64: string;
}

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the "data:<mime>;base64," prefix
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(file);
  });
}

async function downscaleImage(file: File): Promise<PreparedUpload> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image illisible."));
      el.src = objectUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Impossible de traiter l'image.");
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    return {
      mediaType: "image/jpeg",
      dataBase64: dataUrl.slice(dataUrl.indexOf(",") + 1),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function prepareUpload(file: File): Promise<PreparedUpload> {
  if (file.type === "application/pdf") {
    if (file.size > MAX_PDF_BYTES) {
      throw new Error("PDF trop volumineux (max 10 Mo).");
    }
    return { mediaType: "application/pdf", dataBase64: await fileToBase64(file) };
  }

  if (file.type.startsWith("image/")) {
    return downscaleImage(file);
  }

  throw new Error("Format non supporté : utilisez une image ou un PDF.");
}
