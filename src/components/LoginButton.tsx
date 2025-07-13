import Link from 'next/link';
import { useAuth } from '@hooks/useAuth';

/**
 * Small button for login/logout using Google via Supabase with dropdown for profile
 */
interface LoginButtonProps {
  onLoginClick?: () => void;
}

export default function LoginButton({ onLoginClick }: LoginButtonProps) {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <button className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" aria-label="Loading user" />;
  }

  // If user is logged in, show user icon with dropdown
  if (user) {
    return (
      <div className="relative group">
        <button className="flex items-center justify-center text-gray-700 hover:text-red-600 transition-colors duration-200" aria-label="User menu">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="12" r="6" fill="currentColor" />
            <rect x="7" y="22" width="18" height="7" rx="4" fill="currentColor" />
          </svg>
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              {user.email}
            </div>
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Profile
            </Link>
            <button
              onClick={signOut}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login button
  return (
    <Link 
      href="/login" 
      aria-label="Go to Login" 
      className="flex items-center justify-center text-gray-700 hover:text-red-600 transition-colors duration-200"
      {...(onLoginClick && { onClick: onLoginClick })}
    >
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="12" r="6" fill="currentColor" />
        <rect x="7" y="22" width="18" height="7" rx="4" fill="currentColor" />
      </svg>
    </Link>
  );
} 