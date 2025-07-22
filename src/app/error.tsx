"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{padding: 40, textAlign: 'center', color: 'red'}}>
      <h1 style={{fontSize: 48, marginBottom: 16}}>500 - Server Error</h1>
      <p>Sorry, something went wrong. Please try again later.</p>
      <button onClick={reset} style={{marginTop: 24, padding: '12px 32px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, cursor: 'pointer'}}>Try Again</button>
    </div>
  );
} 