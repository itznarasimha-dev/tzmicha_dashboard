import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, Upload, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCroppedBlob } from '@/utils/cropImage';
import { cn } from '@/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onUploaded: (avatarUrl: string) => void;
  userId: string;
}

export function AvatarCropModal({ open, onClose, onUploaded, userId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onCropComplete = useCallback((_: Area, pixels: Area) => setCroppedArea(pixels), []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  function reset() {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleUpload() {
    if (!imageSrc || !croppedArea) return;
    setUploading(true);
    setError('');
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea);
      const form = new FormData();
      form.append('avatar', blob, 'avatar.jpg');
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/${userId}/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');
      onUploaded(json.data.avatar);
      reset();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-[15px] font-bold text-foreground">Update Profile Photo</p>
                <p className="text-xs text-muted-foreground mt-0.5">Drag to reposition · Scroll to zoom</p>
              </div>
              <button onClick={handleClose} className="flex size-7 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {!imageSrc ? (
                /* Drop zone */
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-52 rounded-xl border-2 border-dashed border-border hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted group-hover:bg-rose-100 dark:group-hover:bg-rose-950/30 transition-colors">
                    <ImagePlus className="size-6 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Click to select photo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP · Max 5MB</p>
                  </div>
                </button>
              ) : (
                <>
                  {/* Cropper */}
                  <div className="relative w-full h-64 rounded-xl overflow-hidden bg-black">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      style={{
                        containerStyle: { borderRadius: '0.75rem' },
                        cropAreaStyle: { border: '2px solid #f43f5e', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' },
                      }}
                    />
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center gap-3">
                    <button onClick={() => setZoom(z => Math.max(1, z - 0.1))}
                      className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                      <ZoomOut className="size-3.5 text-muted-foreground" />
                    </button>
                    <input
                      type="range" min={1} max={3} step={0.01}
                      value={zoom} onChange={e => setZoom(Number(e.target.value))}
                      className="flex-1 h-1.5 rounded-full accent-rose-500 cursor-pointer"
                    />
                    <button onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                      className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                      <ZoomIn className="size-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={reset} title="Choose different photo"
                      className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                      <RotateCcw className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </>
              )}

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/20">
              <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
              {!imageSrc ? (
                <Button size="sm" onClick={() => fileRef.current?.click()}>
                  <ImagePlus className="size-3.5" /> Choose Photo
                </Button>
              ) : (
                <Button size="sm" onClick={handleUpload} disabled={uploading || !croppedArea}>
                  {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {uploading ? 'Uploading…' : 'Save Photo'}
                </Button>
              )}
            </div>
          </motion.div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
