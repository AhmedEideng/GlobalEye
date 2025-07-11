"use client";
import Link from "next/link";
import Image from "next/image";

export default function HomeHero() {
  return (
    <section className="relative bg-red-600 text-white py-16 px-4 rounded-2xl shadow-lg overflow-hidden mb-10">
      <div className="max-w-3xl mx-auto text-center z-10 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
          Welcome to <span className="text-white bg-black/20 px-2 rounded">GlobalEye News</span>
        </h1>
        <p className="text-lg md:text-2xl font-medium mb-8 text-white/90">
          The Smart Global News Platform — Faster, Smarter, and More Beautiful Experience to Follow the Most Important Events Around the World Moment by Moment.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/world" className="bg-white text-red-600 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition">World News</Link>
          <Link href="/technology" className="bg-white text-red-600 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition">Technology</Link>
          <Link href="/sports" className="bg-white text-red-600 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition">Sports</Link>
          <Link href="/business" className="bg-white text-red-600 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition">Business</Link>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-red-800/40 pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 opacity-30 select-none" aria-hidden>
        <Image src="/favicon.ico.jpg" alt="GE Logo" width={160} height={160} className="w-40 h-40 rounded-full shadow-2xl" />
      </div>
    </section>
  );
} 