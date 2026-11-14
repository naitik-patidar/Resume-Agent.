import React, { useEffect } from 'react';
import { Key, ArrowRight, X } from 'lucide-react';

interface ApiKeyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitApiKey: () => void;
  onContinueWithoutKey?: () => void;
}

export const ApiKeyPromptModal: React.FC<ApiKeyPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmitApiKey,
  onContinueWithoutKey,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-prompt-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Square-shaped window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(22rem,calc(100vw-2rem))] aspect-square sm:w-96 sm:h-96 bg-[#FAF6F0] border-3 sm:border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000] p-5 sm:p-7 flex flex-col justify-between items-center text-center select-none max-h-[92vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-white hover:bg-[#FFCCD5] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
        >
          <X className="w-4 h-4 text-black" />
        </button>

        {/* Top Tag */}
        <div className="pt-1">
          <span className="px-3 py-0.5 rounded-full bg-[#FEF08A] border-2 border-black text-[10px] font-black uppercase tracking-wider text-black shadow-[1px_1px_0px_0px_#000]">
            Workplace Access
          </span>
        </div>

        {/* Middle Content */}
        <div className="flex flex-col items-center space-y-3 w-full px-1">
          {/* Key Icon Box */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FEF08A] border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform">
            <Key className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
          </div>

          {/* Note Card */}
          <div className="w-full bg-white border-2 border-black rounded-2xl p-3 shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <span className="text-[10px] font-black uppercase text-amber-900 bg-[#FFE2C8] px-2 py-0.5 rounded-md border border-black">
                NOTE
              </span>
            </div>
            <h3
              id="api-key-prompt-title"
              className="text-base sm:text-lg font-black text-black tracking-tight"
            >
              Submit your API key.
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-700 font-medium mt-1 leading-snug">
              Configure your API key to run the 7-agent adversarial resume audit with live AI.
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full space-y-2 pb-1">
          {/* Primary Action Button */}
          <button
            onClick={onSubmitApiKey}
            className="w-full py-3 px-4 bg-black hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Key className="w-4 h-4 text-[#FEF08A]" />
            <span>Submit your API key</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Subtle Bypass / Fallback link */}
          {onContinueWithoutKey && (
            <button
              onClick={onContinueWithoutKey}
              className="text-[11px] text-slate-600 hover:text-black font-bold underline transition-colors cursor-pointer"
            >
              Continue to Workplace without key (Fallback mode)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
