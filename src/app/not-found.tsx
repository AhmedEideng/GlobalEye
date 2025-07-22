import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{padding: 40, textAlign: 'center', color: 'red'}}>
      <h1 style={{fontSize: 48, marginBottom: 16}}>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <a href="/" style={{color: '#dc2626', textDecoration: 'underline'}}>Back to Home</a>
    </div>
  );
} 