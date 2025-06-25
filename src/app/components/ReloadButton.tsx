"use client";
export default function ReloadButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>
      {children}
    </button>
  );
} 