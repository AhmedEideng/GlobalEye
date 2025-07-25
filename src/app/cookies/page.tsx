"use client";
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Head>
        <title>Cookies Policy | GlobalEye News</title>
        <meta name="description" content="Learn how GlobalEye News uses cookies to enhance your experience. Read about our privacy practices and your options." />
      </Head>
      <h1 className="text-3xl font-bold mb-6 text-red-700">Cookies Policy</h1>
      <p className="mb-4 text-gray-700">
        At <b>GlobalEye News</b>, we use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. This page explains what cookies are, how we use them, and your choices regarding cookies.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">What are cookies?</h2>
      <p className="mb-4 text-gray-700">
        Cookies are small text files stored on your device by your web browser. They help websites remember your preferences, login status, and other information to improve your experience.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">How we use cookies</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li>To remember your language and display preferences.</li>
        <li>To keep you logged in (if you choose to log in).</li>
        <li>To analyze site traffic and usage patterns (using Google Analytics and similar tools).</li>
        <li>To personalize content and improve our services.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">Your choices</h2>
      <p className="mb-4 text-gray-700">
        You can control and manage cookies in your browser settings. Most browsers allow you to block or delete cookies. Please note that disabling cookies may affect some features of our website, such as staying logged in or saving your preferences.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Third-party cookies</h2>
      <p className="mb-4 text-gray-700">
        We may use third-party services (like Google Analytics) that set their own cookies to help us understand how visitors use our site. These cookies are subject to the privacy policies of those providers.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">More information</h2>
      <p className="mb-4 text-gray-700">
        For more details about how we handle your data, please read our <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>.
      </p>
      <div className="mt-8 text-sm text-gray-500">
        This policy is for informational purposes only. You are not required to accept cookies to use our website, but some features may be limited if you disable them.
      </div>
    </div>
  );
} 