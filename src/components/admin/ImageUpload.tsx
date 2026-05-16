"use client";

import { ChangeEvent, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

interface ImageUploadProps {
  storagePath: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
}

export default function ImageUpload({
  storagePath,
  onUpload,
  currentUrl,
}: ImageUploadProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_BYTES) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError(null);
    setProgress(0);

    // Sanitize filename: keep only alphanumerics, dots, hyphens
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storageRef = ref(storage, `${storagePath}/${Date.now()}-${safeName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        );
      },
      () => {
        setError("Upload failed. Please try again.");
        setProgress(null);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onUpload(url);
        setProgress(null);
      }
    );
  }

  return (
    <div className="space-y-2">
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt="Current upload"
          className="h-24 w-auto rounded border border-border object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
      />
      {progress !== null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-accent transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
