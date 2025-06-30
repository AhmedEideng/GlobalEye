"use client";
import { useEffect, useState } from "react";

// تعريف مؤقت لنوع BeforeInstallPromptEvent إذا لم يكن معرفًا في TypeScript
// يمكنك نقله لاحقًا إلى ملف types عام إذا احتجت

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
};

export default function PwaInstallToast() {
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(event);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstall(false);
      }
    }
  };

  if (!showInstall) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
      }}
      className="bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in-up"
    >
      <span>Install GlobalEye News for a better experience!</span>
      <button onClick={handleInstall} className="btn btn-secondary">
        Install
      </button>
      <button
        onClick={() => setShowInstall(false)}
        className="ml-2 text-lg"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
} 