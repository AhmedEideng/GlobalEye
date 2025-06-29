import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | GlobalEye News',
  description: 'Learn more about GlobalEye News, our mission, and our team. Your trusted source for global news and insights.',
  alternates: { canonical: 'https://globaleye.news/about' },
  openGraph: {
    title: 'About | GlobalEye News',
    description: 'Learn more about GlobalEye News, our mission, and our team. Your trusted source for global news and insights.',
    url: 'https://globaleye.news/about',
    siteName: 'GlobalEye News',
    images: [
      { url: '/placeholder-news.jpg', width: 1200, height: 630, alt: 'GlobalEye News' }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | GlobalEye News',
    description: 'Learn more about GlobalEye News, our mission, and our team. Your trusted source for global news and insights.',
    images: ['/placeholder-news.jpg'],
    site: '@globaleyenews',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">About GlobalEye News</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-6">GlobalEye News is your trusted source for global news, delivering the latest updates from around the world. Our mission is to keep you informed, inspired, and connected to the stories that matter most.</p>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-6">To provide accurate, timely, and unbiased news coverage from every corner of the globe, empowering our readers to make informed decisions in a rapidly changing world.</p>
          <h2 className="text-2xl font-semibold mb-4">What We Cover</h2>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>World:</strong> International news and major global events.</li>
            <li><strong>Politics:</strong> Political developments, elections, and government affairs.</li>
            <li><strong>Business:</strong> Market trends, economic updates, and financial news.</li>
            <li><strong>Technology:</strong> Innovations, gadgets, and tech industry news.</li>
            <li><strong>Sports:</strong> Sports highlights, scores, and athlete stories.</li>
            <li><strong>Entertainment:</strong> Celebrity news, movies, music, and pop culture.</li>
            <li><strong>Health:</strong> Health tips, medical breakthroughs, and wellness advice.</li>
            <li><strong>Science:</strong> Scientific discoveries, research, and space exploration.</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4">Our Commitment to Quality</h2>
          <p className="mb-6">We are dedicated to delivering high-quality journalism, fact-checked reporting, and a diversity of perspectives. Our editorial team upholds the highest standards of integrity and accuracy.</p>
          <h2 className="text-2xl font-semibold mb-4">Technology and Innovation</h2>
          <p className="mb-6">GlobalEye News leverages the latest technology to bring you news faster and more efficiently, ensuring you never miss a story that matters.</p>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-6">Have questions, feedback, or story tips? Reach out to our team at contact@globaleye.news. We value your input and strive to improve your news experience.</p>
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Stay Connected</h3>
            <p>Follow us on social media and subscribe to our newsletter for the latest updates and exclusive content.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 