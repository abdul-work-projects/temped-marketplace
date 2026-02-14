'use client';

import { useEffect, useCallback, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface ImageLightboxProps {
  src: string;
  alt?: string;
  fileName?: string;
  open: boolean;
  onClose: () => void;
}

function isPdf(src: string, fileName?: string): boolean {
  const name = (fileName || src || '').toLowerCase();
  return name.endsWith('.pdf');
}

function PdfViewer({ src, alt }: { src: string; alt?: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);

  const onDocumentLoadSuccess = ({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setCurrentPage(1);
  };

  const goToPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage(p => Math.min(numPages, p + 1));
  const zoomIn = () => setScale(s => Math.min(2.5, s + 0.2));
  const zoomOut = () => setScale(s => Math.max(0.5, s - 0.2));

  return (
    <div
      className="flex flex-col w-[min(90vw,700px)] h-[90vh] rounded-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 justify-between shrink-0">
        <span className="text-sm text-gray-300 truncate max-w-[200px]">
          {alt || 'PDF Document'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* PDF Content */}
      <div className="overflow-auto bg-gray-800 flex-1 min-h-0">
        <div className="inline-flex min-w-full min-h-full items-start justify-center">
          <Document
            file={src}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-sm">Failed to load PDF</p>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline mt-2"
                >
                  Open in new tab
                </a>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              className="[&>canvas]:!mx-auto"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>

      {/* Page Navigation */}
      {numPages > 1 && (
        <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 justify-center shrink-0">
          <button
            onClick={goToPrev}
            disabled={currentPage <= 1}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-300">
            {currentPage} / {numPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage >= numPages}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ImageLightbox({ src, alt, fileName, open, onClose }: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  const pdf = isPdf(src, fileName);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>
      {pdf ? (
        <PdfViewer src={src} alt={alt} />
      ) : (
        <img
          src={src}
          alt={alt || 'Document preview'}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
