export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">About GlobalEye News</h1>
        
        <div className="prose max-w-none">
          <p className="text-lg mb-6">
            GlobalEye News is your trusted source for comprehensive, accurate, and timely news coverage from around the world. 
            We are committed to delivering high-quality journalism that keeps you informed about the most important events 
            shaping our global community.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-6">
            Our mission is to provide readers with reliable, unbiased news coverage that promotes understanding and 
            informed decision-making. We believe in the power of information to connect people across borders and 
            cultures, fostering a more informed and engaged global citizenry.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">What We Cover</h2>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>World News:</strong> International events and developments</li>
            <li><strong>Politics:</strong> Political developments and policy changes</li>
            <li><strong>Business:</strong> Economic news and market updates</li>
            <li><strong>Technology:</strong> Latest tech innovations and trends</li>
            <li><strong>Sports:</strong> Sports news and athletic achievements</li>
            <li><strong>Entertainment:</strong> Entertainment industry updates</li>
            <li><strong>Health:</strong> Health and medical news</li>
            <li><strong>Science:</strong> Scientific discoveries and research</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Our Commitment to Quality</h2>
          <p className="mb-6">
            We are committed to maintaining the highest standards of journalistic integrity. Our team of experienced 
            journalists and editors work tirelessly to ensure that every story we publish is accurate, well-researched, 
            and presented in a clear, engaging manner. We believe in transparency and accountability, and we&apos;re 
            always open to feedback from our readers.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Technology and Innovation</h2>
          <p className="mb-6">
            GlobalEye News leverages cutting-edge technology to deliver news in the most efficient and user-friendly 
            way possible. Our platform is designed to provide a seamless reading experience across all devices, 
            ensuring you can stay informed wherever you are. We&apos;re constantly innovating to improve our service 
            and meet the evolving needs of our readers.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-6">
            We value your feedback and suggestions. If you have any questions, comments, or would like to report 
            an issue, please don&apos;t hesitate to reach out to us. Your input helps us improve and better serve 
            our community of readers.
          </p>
          
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Stay Connected</h3>
            <p>
              Follow us for the latest updates and breaking news. Join our community of informed readers who 
              trust GlobalEye News for their daily dose of world events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 