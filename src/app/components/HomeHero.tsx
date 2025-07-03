"use client";
import Link from "next/link";

export default function HomeHero() {
  return (
    <section className="relative bg-red-600 text-white py-16 px-4 rounded-2xl shadow-lg overflow-hidden mb-10">
      <div className="max-w-3xl mx-auto text-center z-10 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
          مرحبًا بك في <span className="text-white bg-black/20 px-2 rounded">GlobalEye News</span>
        </h1>
        <p className="text-lg md:text-2xl font-medium mb-8 text-white/90">
          منصة الأخبار العالمية الذكية — أسرع، أذكى، وأجمل تجربة لمتابعة أهم الأحداث حول العالم لحظة بلحظة.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/world" className="bg-white text-red-600 font-bold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition">أخبار العالم</Link>
          <Link href="/technology" className="bg-white text-red-600 font-bold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition">تكنولوجيا</Link>
          <Link href="/sports" className="bg-white text-red-600 font-bold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition">رياضة</Link>
          <Link href="/business" className="bg-white text-red-600 font-bold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition">اقتصاد</Link>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-red-800/40 pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 opacity-30 select-none" aria-hidden>
        <img src="/favicon.ico.jpg" alt="GE Logo" className="w-40 h-40 rounded-full shadow-2xl" />
      </div>
    </section>
  );
} 