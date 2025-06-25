import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
      <div className="mb-8">
        <h1 className="text-6xl md:text-8xl font-bold mb-4 text-foreground">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </div>

      <div className="space-y-4">
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Go Back Home
        </Link>
        
        <div className="text-sm text-muted-foreground">
          <p>Or try one of these popular categories:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <Link 
              href="/business" 
              className="px-3 py-1 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
            >
              Business
            </Link>
            <Link 
              href="/technology" 
              className="px-3 py-1 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
            >
              Technology
            </Link>
            <Link 
              href="/sports" 
              className="px-3 py-1 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
            >
              Sports
            </Link>
            <Link 
              href="/entertainment" 
              className="px-3 py-1 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
            >
              Entertainment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 