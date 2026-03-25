import type { Dispatch, SetStateAction } from "react";
import type { AuditInput } from "../../types";

const newUploadId = () =>
  `${Date.now().toString()}${Math.random().toString(36).substring(2)}`;

export function tryAddUploadToQueue(
  queue: AuditInput[],
  setQueue: Dispatch<SetStateAction<AuditInput[]>>,
  setErrorMsg: (msg: string | null) => void,
  file: File,
  maxInputs = 5,
): boolean {
  const remainingSlots = maxInputs - queue.length;
  if (remainingSlots <= 0) {
    setErrorMsg("Limit reached!");
    return false;
  }
  const dup = queue.some((item) => {
    if (item.type !== "upload") return false;
    const files =
      item.files && item.files.length > 0
        ? item.files
        : item.file
          ? [item.file]
          : [];
    return files.some((f) => f.name === file.name && f.size === file.size);
  });
  if (dup) {
    setErrorMsg("File already added.");
    return false;
  }
  setErrorMsg(null);
  setQueue((prev) => [
    ...prev,
    {
      id: newUploadId(),
      type: "upload",
      files: [file],
      file,
    },
  ]);
  return true;
}
