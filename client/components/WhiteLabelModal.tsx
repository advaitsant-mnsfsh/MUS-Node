import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Image, X, Upload, Trash2, Check, Crop as CropIcon } from 'lucide-react';

interface WhiteLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logoData: string) => void;
  initialLogo: string | null;
}

const ASPECT_RATIOS = [
  { label: 'Square (1:1)', value: 1 / 1 },
  { label: 'Landscape (16:9)', value: 16 / 9 },
  { label: 'Banner (3:1)', value: 3 / 1 },
  { label: 'Free', value: undefined },
];

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export const WhiteLabelModal: React.FC<WhiteLabelModalProps> = ({ isOpen, onClose, onSave, initialLogo }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialLogo);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset state when modal opens or initialLogo changes
    if (isOpen) {
      setImageSrc(initialLogo);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setAspect(undefined);
    }
  }, [isOpen, initialLogo]);


  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Reset crop
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''), false);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
      // Default center crop for free mode
      setCrop(centerCrop(
        { unit: '%', width: 50, height: 50, x: 25, y: 25 },
        width,
        height
      ));
    }
  };

  const handleAspectChange = (value: number | undefined) => {
    setAspect(value);
    if (imgRef.current && value) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, value));
    } else if (imgRef.current && !value && crop) {
      // If switching to free, keep current dimensions but unconstrain aspect
      setCrop({ ...crop });
    }
  }

  const getCroppedImg = async (image: HTMLImageElement, pixelCrop: PixelCrop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

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

    return canvas.toDataURL('image/png');
  };

  const handleSave = async () => {
    if (imgRef.current && completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
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
      // If no crop happened (just uploaded), save original (or full size if that's what we want)
      // Generally good to force a crop init, but if they just save immediately:
      onSave(imageSrc);
      onClose();
    }
  };

  const handleRemove = () => {
    setImageSrc(null);
    onSave('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-neo border-2 border-border-main w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b-2 border-border-main flex justify-between items-center bg-accent-yellow/10">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Image className="w-5 h-5" />
              Add Custom Branding
            </h2>
            <p className="text-sm text-text-secondary mt-1 font-medium">
              Your logo will appear on all audit reports.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-text-primary border-2 border-transparent hover:border-black"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {!imageSrc ? (
            <div className="flex items-center justify-center w-full min-h-[300px]">
              <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-border-main rounded-lg cursor-pointer bg-white hover:bg-accent-cyan/5 hover:border-accent-cyan transition-colors group relative overflow-hidden">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                  <div className="p-4 bg-accent-cyan rounded-full border-2 border-border-main shadow-neo-sm group-hover:shadow-neo group-hover:-translate-y-1 transition-all mb-4">
                    <Upload className="w-8 h-8 text-black" />
                  </div>
                  <p className="mb-2 text-lg font-bold text-text-primary">Click to upload logo</p>
                  <p className="text-sm text-text-secondary">or drag and drop here</p>
                  <p className="text-xs text-slate-400 mt-4 font-mono bg-slate-100 px-2 py-1 rounded">PNG, JPG (MAX. 5MB)</p>
                </div>
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px]"></div>

                <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cropper Container */}
              <div className="flex justify-center bg-slate-900 border-2 border-border-main rounded-lg overflow-hidden min-h-[300px] items-center relative shadow-inner">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-h-[350px] z-10"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    onLoad={onImageLoad}
                    style={{ maxHeight: '350px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </ReactCrop>
              </div>

              {/* Controls Bar */}
              <div className="bg-white p-4 rounded-lg border-2 border-border-main shadow-neo-sm">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                      <CropIcon className="w-4 h-4" />
                      Crop Aspect Ratio:
                    </span>
                    <label className="cursor-pointer text-xs font-bold text-brand hover:text-brand-hover underline decoration-dotted underline-offset-2 flex items-center gap-1">
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.label}
                        onClick={() => handleAspectChange(ratio.value)}
                        className={`px-4 py-2 text-xs font-bold rounded border-2 transition-all ${aspect === ratio.value
                          ? 'bg-text-primary text-white border-text-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                          : 'bg-white text-text-secondary border-border-main hover:bg-slate-50'
                          }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-border-main bg-white flex justify-between items-center">
          {imageSrc ? (
            <button
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 text-sm font-bold flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          ) : <div></div>}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-text-primary bg-white border-2 border-border-main shadow-neo-sm hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!imageSrc}
              className="px-6 py-2.5 text-sm font-bold text-white bg-brand border-2 border-border-main shadow-neo hover:translate-x-px hover:translate-y-px hover:shadow-none disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all rounded flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
