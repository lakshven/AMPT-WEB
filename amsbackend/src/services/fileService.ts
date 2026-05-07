export function getFileUrl(
  fileName: string,
  folder: string
): string {
  const baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) {
    throw new Error("BACKEND_URL is not defined in .env");
  }

  return `${baseUrl}/uploads/${folder}/${fileName}`;
}
