import type { Metadata } from 'next';
import ArticleTermsJsonLdHead from './ArticleTermsJsonLdHead';

export const metadata: Metadata = {
  title: 'Terms and Conditions | GlobalEye News',
  description: 'Read the terms and conditions for using GlobalEye News and our services.',
  alternates: { canonical: 'https://globaleye.live/terms-and-conditions' },
  openGraph: {
    title: 'Terms and Conditions | GlobalEye News',
    description: 'Read the terms and conditions for using GlobalEye News and our services.',
    url: 'https://globaleye.live/terms-and-conditions',
    siteName: 'GlobalEye News',
    images: [
      { url: '/placeholder-news.jpg', width: 1200, height: 630, alt: 'Terms and Conditions GlobalEye News' }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms and Conditions | GlobalEye News',
    description: 'Read the terms and conditions for using GlobalEye News and our services.',
    images: ['/placeholder-news.jpg'],
    site: '@globaleyenews',
  },
};

export default function TermsPage() {
  return <>
    <ArticleTermsJsonLdHead />
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>
      <div className="prose prose-lg max-w-none">
        <p>Welcome to <strong>GlobalEye News</strong>. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.</p>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing this website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use our website.</p>
        <h2>2. Use of Content</h2>
        <p>All content provided on GlobalEye News is for informational purposes only. You may not reproduce, distribute, modify, or republish any content without our prior written consent. You may share links to our articles for non-commercial purposes.</p>
        <h2>3. User Conduct</h2>
        <ul>
          <li>You agree not to use the website for any unlawful purpose or in any way that may harm GlobalEye News or its users.</li>
          <li>You must not attempt to gain unauthorized access to any part of the website or its systems.</li>
          <li>You are responsible for any content you post or share on our platform and must ensure it does not violate any laws or third-party rights.</li>
        </ul>
        <h2>4. Intellectual Property</h2>
        <p>All trademarks, logos, and content on this site are the property of GlobalEye News or its licensors. Unauthorized use is strictly prohibited.</p>
        <h2>5. Third-Party Links</h2>
        <p>Our website may contain links to third-party sites. We are not responsible for the content or practices of these external sites. Access them at your own risk.</p>
        <h2>6. Disclaimer of Warranties</h2>
        <p>GlobalEye News provides content &quot;as is&quot; without warranties of any kind, either express or implied. We do not guarantee the accuracy, completeness, or reliability of any information on the site.</p>
        <h2>7. Limitation of Liability</h2>
        <p>In no event shall GlobalEye News, its affiliates, or its partners be liable for any damages arising from your use of the website or reliance on its content.</p>
        <h2>8. Changes to Terms</h2>
        <p>We reserve the right to update or modify these Terms and Conditions at any time. Changes will be effective immediately upon posting. Continued use of the site constitutes acceptance of the revised terms.</p>
        <h2>9. Governing Law</h2>
        <p>These Terms and Conditions are governed by and construed in accordance with the laws of the applicable jurisdiction.</p>
        <h2>10. Contact Us</h2>
        <p>If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:info@globaleye.live">info@globaleye.live</a>.</p>
      </div>
    </div>
  </>;
} 