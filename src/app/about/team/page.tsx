"use client";

import Image from "next/image";

const teamMembers = [
  {
    name: "John Doe",
    role: "Editor-in-Chief",
    photo: "/placeholder-news.jpg",
    bio: "John has over 15 years of experience in global journalism and leads the editorial vision at GlobalEye News.",
  },
  {
    name: "Sarah Smith",
    role: "Senior Reporter",
    photo: "/placeholder-news.jpg",
    bio: "Sarah specializes in political and business news, bringing in-depth analysis and on-the-ground reporting.",
  },
  {
    name: "Michael Lee",
    role: "Technology Editor",
    photo: "/placeholder-news.jpg",
    bio: "Michael covers the latest in technology and innovation, making complex topics accessible to all readers.",
  },
  // Add more team members here
];

export default function TeamPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Our Editorial Team</h1>
      <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl mx-auto">
        Meet the dedicated journalists and editors behind GlobalEye News. Our team is committed to delivering accurate, timely, and insightful news coverage from around the world.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-red-600 bg-gray-200 flex items-center justify-center">
            <span className="text-2xl">👨‍💼</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">John Doe</h2>
          <div className="text-red-600 font-medium mb-2">Editor-in-Chief</div>
          <p className="text-gray-500 text-sm">John has over 15 years of experience in global journalism and leads the editorial vision at GlobalEye News.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-red-600 bg-gray-200 flex items-center justify-center">
            <span className="text-2xl">👩‍💼</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Sarah Smith</h2>
          <div className="text-red-600 font-medium mb-2">Senior Reporter</div>
          <p className="text-gray-500 text-sm">Sarah specializes in political and business news, bringing in-depth analysis and on-the-ground reporting.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-red-600 bg-gray-200 flex items-center justify-center">
            <span className="text-2xl">👨‍💻</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Michael Lee</h2>
          <div className="text-red-600 font-medium mb-2">Technology Editor</div>
          <p className="text-gray-500 text-sm">Michael covers the latest in technology and innovation, making complex topics accessible to all readers.</p>
        </div>
      </div>
    </div>
  );
} 