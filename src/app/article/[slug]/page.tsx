export const revalidate = 120; 

import Image from "next/image";

{article.urlToImage && (
  <div className="relative w-full h-[320px] md:h-[420px] lg:h-[500px] rounded-xl overflow-hidden mb-8">
    <Image
      src={article.urlToImage}
      alt={article.title}
      fill
      className="object-cover w-full h-full"
      priority
      sizes="100vw"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
  </div>
)} 