"use client";

import { ChangeEvent, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

interface ProfileImageUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
}

function centerSquareCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
    width,
    height
  );
}

async function cropImageToBlob(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      0.92
    );
  });
}

export default function ProfileImageUpload({
  onUpload,
  currentUrl,
}: ProfileImageUploadProps) {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError(null);
    setCompletedCrop(undefined);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setSrcUrl(reader.result as string);
    });
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerSquareCrop(width, height));
  }

  function handleCancel() {
    setSrcUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }

  async function handleCropAndUpload() {
    if (!imgRef.current || !completedCrop) return;

    setError(null);
    setProgress(0);

    let blob: Blob;
    try {
      blob = await cropImageToBlob(imgRef.current, completedCrop);
    } catch {
      setError("Crop failed. Please try again.");
      setProgress(null);
      return;
    }

    const fileName = `profile-${Date.now()}.jpg`;
    const storageRef = ref(storage, `profile/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: "image/jpeg",
    });

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
        setSrcUrl(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setProgress(null);
      }
    );
  }

  return (
    <div className="space-y-3">
      {/* Current image preview */}
      {currentUrl && !srcUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt="Current profile"
          className="h-24 w-24 rounded-full border border-border object-cover"
        />
      )}

      {/* File picker — hidden when crop editor is open */}
      {!srcUrl && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
        />
      )}

      {/* Crop editor */}
      {srcUrl && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Drag to adjust the crop area, then click <strong>Crop &amp; Upload</strong>.
          </p>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
            className="max-w-xs rounded"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={srcUrl}
              alt="Crop preview"
              onLoad={handleImageLoad}
              className="max-h-72 w-auto"
            />
          </ReactCrop>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCropAndUpload}
              disabled={!completedCrop || progress !== null}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {progress !== null ? `Uploading ${progress}%` : "Crop & Upload"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={progress !== null}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upload progress bar */}
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
