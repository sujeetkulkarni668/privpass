import React from "react";
import { CopyButton } from "./CopyButton";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationUrl: string;
  title?: string;
  subtitle?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  verificationUrl,
  title = "Scan to Verify",
  subtitle = "Scan this QR code with your Midnight Identity wallet or share the verification link.",
}) => {
  if (!isOpen) return null;

  // Generate SVG QR code representation
  const encodedUrl = encodeURIComponent(verificationUrl);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodedUrl}&bgcolor=0B0F19&color=6366F1&format=svg`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-midnight-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-midnight-950 border border-indigo-500/20 rounded-xl flex items-center justify-center">
            <img
              src={qrApiUrl}
              alt="Verification QR Code"
              className="w-56 h-56 rounded-lg object-contain"
              loading="lazy"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-gray-300">
            <span className="truncate mr-2">{verificationUrl}</span>
            <CopyButton textToCopy={verificationUrl} label="Copy Link" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-midnight-800 hover:bg-midnight-700 text-white font-medium rounded-xl text-sm border border-white/10 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
