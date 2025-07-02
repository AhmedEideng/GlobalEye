import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | GlobalEye News',
  description: 'Contact GlobalEye News for support, feedback, or business inquiries.'
};

export default function ContactUsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      <div className="prose prose-lg max-w-none mb-8">
        <p>We value your feedback, questions, and suggestions. Please use the form below or reach out to us directly. Our team is dedicated to providing you with the best support and information.</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@globaleye.live">info@globaleye.live</a></li>
        </ul>
      </div>
      <form className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block font-semibold mb-1">Your Name</label>
          <input id="name" name="name" type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600" placeholder="Enter your name" />
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold mb-1">Your Email</label>
          <input id="email" name="email" type="email" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600" placeholder="Enter your email" />
        </div>
        <div>
          <label htmlFor="message" className="block font-semibold mb-1">Message</label>
          <textarea id="message" name="message" rows={5} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600" placeholder="Type your message here..."></textarea>
        </div>
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-6 py-2 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-red-600">Send Message</button>
      </form>
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>We aim to respond to all inquiries within 24-48 hours.</p>
      </div>
    </div>
  );
} 