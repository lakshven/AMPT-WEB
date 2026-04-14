import axiosInstance from "../utils/axiosInstance";

export async function uploadFile({
  file,
  rowId,
  column,
}: {
  file: File;
  rowId: number;
  column: "exam_report" | "assessment" | "records";
}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("rowId", String(rowId));
  formData.append("column", column);

  const response = await axiosInstance.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Upload failed");
  }

  return response.data;
}