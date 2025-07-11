import { Metadata } from 'next';
import ArticlePrivacyJsonLdHead from './ArticlePrivacyJsonLdHead';

export const metadata: Metadata = {
  title: 'Privacy Policy | GlobalEye News',
  description: 'Read the privacy policy of GlobalEye News to understand how we protect your data and privacy.',
  alternates: { canonical: 'https://globaleye.live/privacy' },
  openGraph: {
    title: 'Privacy Policy | GlobalEye News',
    description: 'Read the privacy policy of GlobalEye News to understand how we protect your data and privacy.',
    url: 'https://globaleye.live/privacy',
    siteName: 'GlobalEye News',
    images: [
      { url: '/placeholder-news.jpg', width: 1200, height: 630, alt: 'Privacy Policy GlobalEye News' }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | GlobalEye News',
    description: 'Read the privacy policy of GlobalEye News to understand how we protect your data and privacy.',
    images: ['/placeholder-news.jpg'],
    site: '@globaleyenews',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function PrivacyPage() {
  return <>
    <ArticlePrivacyJsonLdHead />
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">Your privacy is important to us. This policy explains how GlobalEye News collects, uses, and protects your information when you use our platform.</p>
        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        <p className="mb-6">We may collect information you provide directly, such as your email address when you subscribe to our newsletter, and information collected automatically, such as your IP address and browsing behavior.</p>
        <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
        <p className="mb-6">We use your information to provide and improve our services, personalize your experience, and communicate important updates. We do not sell your personal information to third parties.</p>
        <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
        <p className="mb-6">We may share your information with trusted partners who assist us in operating our website, conducting our business, or serving our users, as long as those parties agree to keep this information confidential.</p>
        <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
        <p className="mb-6">We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure.</p>
        <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
        <p className="mb-6">We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings.</p>
        <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
        <p className="mb-6">You have the right to access, correct, or delete your personal information. Contact us at privacy@globaleye.news for any privacy-related requests.</p>
        <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
        <p className="mb-6">We may update this privacy policy from time to time. We encourage you to review this page regularly for any changes.</p>
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-6">If you have any questions or concerns about our privacy practices, please contact us at privacy@globaleye.news.</p>
        <div className="bg-gray-100 p-6 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Last Updated:</strong> December 2024
          </p>
        </div>
      </div>
    </div>
  </>;
} 