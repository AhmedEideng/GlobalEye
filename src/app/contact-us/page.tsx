'use client';
import { useState } from 'react';
import { FaEnvelope, FaUser, FaRegCommentDots } from 'react-icons/fa';

export default function ContactUsPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    // يمكنك هنا ربط النموذج مع خدمة خارجية مثل EmailJS أو Formspree أو API خاص بك
    // سنستخدم mailto كحل بسيط
    try {
      window.location.href = `mailto:info@globaleye.live?subject=${encodeURIComponent(subject || 'Contact from GlobalEye')}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message)}`;
      setStatus('success');
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again or email us directly.');
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <FaEnvelope className="text-red-600" /> Contact Us
      </h1>
      <div className="prose prose-lg max-w-none mb-8 text-center">
        <p>We value your feedback, questions, and suggestions. Please use the form below or reach out to us directly.<br />
          <span className="inline-flex items-center gap-2"><FaEnvelope className="inline text-red-600" /> <a href="mailto:info@globaleye.live" className="text-red-600 font-semibold">info@globaleye.live</a></span>
        </p>
      </div>
      {status === 'success' && (
        <div className="bg-green-100 border border-green-300 text-green-800 rounded-md px-4 py-3 mb-6 text-center">
          Thank you! Your message was sent. We will respond as soon as possible.
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-md px-4 py-3 mb-6 text-center">
          {error}
        </div>
      )}
      <form className="bg-white rounded-lg shadow p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block font-semibold mb-1 flex items-center gap-2"><FaUser /> Your Name</label>
          <input id="name" name="name" type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600" placeholder="Enter your name" />
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold mb-1 flex items-center gap-2"><FaEnvelope /> Your Email</label>
          <input id="email" name="email" type="email" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600" placeholder="Enter your email" />
        </div>
        <div>
          <label htmlFor="subject" className="block font-semibold mb-1 flex items-center gap-2"><FaRegCommentDots /> Subject</label>
          <input id="subject" name="subject" type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600" placeholder="Subject (optional)" />
        </div>
        <div>
          <label htmlFor="message" className="block font-semibold mb-1">Message</label>
          <textarea id="message" name="message" rows={5} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600" placeholder="Type your message here..."></textarea>
        </div>
        <button type="submit" disabled={status === 'sending'} className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-6 py-2 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-red-600 flex items-center justify-center gap-2">
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>We aim to respond to all inquiries within 24-48 hours.</p>
      </div>
    </div>
  );
} 