import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  ImagePlus,
  X,
  Upload,
  Trash2,
  Check,
  Crop as CropIcon,
  RefreshCw,
} from "lucide-react";

interface WhiteLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logoData: string) => void;
  initialLogo: string | null;
  title?: string;
  description?: string;
  lockAspectRatio?: boolean;
}

const DEFAULT_ASPECT = 1 / 1;

/** Order matches design: Free first, then fixed ratios */
const ASPECT_RATIOS: { label: string; value: number | undefined }[] = [
  { label: "Free", value: undefined },
  { label: "Square (1:1)", value: 1 },
  { label: "Landscape (4:3)", value: 4 / 3 },
  { label: "Banner (16:9)", value: 16 / 9 },
];

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export const WhiteLabelModal: React.FC<WhiteLabelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLogo,
  title = "Upload your organization's logo",
  description =
    "This will be used to label your reports and personalise them for sharing.",
  lockAspectRatio = false,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialLogo);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(
    lockAspectRatio ? DEFAULT_ASPECT : undefined,
  );
  const [isDragging, setIsDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setImageSrc(initialLogo);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setAspect(lockAspectRatio ? DEFAULT_ASPECT : undefined);
      setIsDragging(false);
    }
  }, [isOpen, initialLogo, lockAspectRatio]);

  const applyFile = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setCrop(undefined);
    setCompletedCrop(undefined);
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => setImageSrc(reader.result?.toString() || ""),
      false,
    );
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    applyFile(f);
    e.target.value = "";
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current && newAspect) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, newAspect));
    } else {
      setCrop(undefined);
    }
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop,
  ) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = pixelCrop.width * scaleX;
    canvas.height = pixelCrop.height * scaleY;
    ctx.imageSmoothingEnabled = true;

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return canvas.toDataURL("image/png");
  };

  const handleSave = async () => {
    if (
      imgRef.current &&
      completedCrop &&
      completedCrop.width > 0 &&
      completedCrop.height > 0
    ) {
      try {
        const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
        if (croppedImage) {
          onSave(croppedImage);
          onClose();
        }
      } catch (e) {
        console.error(e);
      }
    } else if (imageSrc && !completedCrop) {
      onSave(imageSrc);
      onClose();
    }
  };

  const handleRemove = () => {
    setImageSrc(null);
    onSave("");
    onClose();
  };

  const onDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    applyFile(file);
  };

  if (!isOpen) return null;

  const dropZoneClass = [
    "flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 py-10 transition-colors",
    isDragging
      ? "border-brand/40 bg-brand/5"
      : "hover:border-neutral-300 hover:bg-neutral-50/80",
  ].join(" ");

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wl-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-[#fafaf9] px-5 py-4 md:px-6 md:py-5">
          <div className="flex min-w-0 gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center">
              <ImagePlus
                className="h-5 w-5 text-[#1a1a1a]"
                strokeWidth={2}
                aria-hidden
              />
            </span>
            <div className="min-w-0">
              <h2
                id="wl-modal-title"
                className="text-lg font-bold tracking-tight text-[#1a1a1a] md:text-xl"
              >
                {title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-text-secondary">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-text-secondary transition-colors hover:bg-black/6 hover:text-[#1a1a1a]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-white px-5 py-6 md:px-6">
          {!imageSrc ? (
            <label
              className={dropZoneClass}
              onDragOver={onDropZoneDragOver}
              onDragLeave={onDropZoneDragLeave}
              onDrop={onDropZoneDrop}
            >
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/*"
                onChange={onFileChange}
              />
              <span className="mb-5 inline-flex rounded-xl bg-[#f8d448] p-3.5 border-1 border-black">
                <Upload
                  className="h-7 w-7 text-[#1a1a1a]"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </span>
              <p className="mb-1 text-center text-base font-bold text-[#1a1a1a]">
                Click to upload logo
              </p>
              <p className="mb-6 text-center text-sm font-medium text-text-secondary">
                or drag and drop here
              </p>
              <div className="text-center text-xs font-medium leading-relaxed text-text-secondary">
                <p>Input type: JPEG, JPG, PNG</p>
                <p className="mt-1">Upload at highest resolution for best output</p>
              </div>
            </label>
          ) : (
            <div className="space-y-5">
              <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl bg-neutral-400 px-3 py-4 md:min-h-[320px]">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="ReactCrop--no-animate max-h-[360px] max-w-full"
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imageSrc}
                    onLoad={onImageLoad}
                    className="max-h-[360px] max-w-full object-contain"
                  />
                </ReactCrop>
              </div>

              <div className="pt-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 flex items-center gap-2 text-sm font-bold text-[#1a1a1a]">
                      <CropIcon className="h-4 w-4 shrink-0" aria-hidden />
                      Aspect ratio
                    </span>
                    {lockAspectRatio ? (
                      <span className="rounded-lg bg-[#f8d448] px-3 py-2 text-xs font-bold text-[#1a1a1a]">
                        Fixed square (1:1)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {ASPECT_RATIOS.map((ratio) => {
                          const active = aspect === ratio.value;
                          return (
                            <button
                              key={ratio.label}
                              type="button"
                              onClick={() => handleAspectChange(ratio.value)}
                              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                                active
                                  ? "bg-[#f8d448] text-[#1a1a1a] shadow-sm"
                                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-[#1a1a1a]"
                              }`}
                            >
                              {ratio.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t border-neutral-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
          {imageSrc ? (
            <div className="flex flex-wrap items-center gap-5">
              <label className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand decoration-dotted underline-offset-4 hover:text-brand-hover">
                <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
                Change image
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onFileChange}
                />
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                Remove image
              </button>
            </div>
          ) : (
            <div className="hidden md:block" aria-hidden />
          )}

          <div
            className={`flex items-center gap-3 ${imageSrc ? "md:ml-auto" : "ml-auto"}`}
          >
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-neutral-100 hover:text-[#1a1a1a]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!imageSrc}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:bg-violet-200 disabled:text-white/90 disabled:opacity-90"
            >
              <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              Save logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
