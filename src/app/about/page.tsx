import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link 
          href="/" 
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Home
        </Link>
      </nav>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
          About GlobalEye News
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your trusted source for comprehensive, accurate, and timely global news coverage
        </p>
      </div>

      <div className="space-y-12">
        {/* Mission Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Our Mission
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-foreground">
            <p>
              At GlobalEye News, we are committed to delivering the most comprehensive and accurate news coverage from around the world. Our mission is to keep you informed with the latest developments in politics, business, technology, sports, entertainment, health, and science.
            </p>
            <p>
              We believe in the power of information to shape perspectives and drive positive change. Through our platform, we strive to provide a balanced, unbiased view of world events, helping our readers make informed decisions about the issues that matter most.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-card text-card-foreground rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Accuracy & Reliability
              </h3>
              <p className="text-base leading-relaxed">
                We prioritize factual accuracy and verify all information through multiple reliable sources before publishing.
              </p>
            </div>
            <div className="p-6 bg-card text-card-foreground rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Impartiality
              </h3>
              <p className="text-base leading-relaxed">
                We maintain editorial independence and present news from multiple perspectives without bias or agenda.
              </p>
            </div>
            <div className="p-6 bg-card text-card-foreground rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Timeliness
              </h3>
              <p className="text-base leading-relaxed">
                We deliver breaking news and updates as they happen, ensuring you stay informed in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Our Technology
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-foreground">
            <p>
              GlobalEye News is powered by cutting-edge technology that ensures fast, reliable, and personalized news delivery. Our platform utilizes advanced algorithms to curate content based on your interests while maintaining editorial standards.
            </p>
            <p>
              We integrate multiple news APIs and sources to provide comprehensive coverage, and our intelligent search system helps you find exactly what you're looking for quickly and efficiently.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Our Commitment
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-foreground">
            <p>
              We are committed to continuous improvement and innovation in news delivery. Our team works tirelessly to enhance the user experience, expand our coverage, and maintain the highest standards of journalistic integrity.
            </p>
            <p>
              Thank you for choosing GlobalEye News as your trusted source for global information. We value your trust and are dedicated to serving you with the best possible news experience.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center py-8 bg-card rounded-lg border border-border">
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Get in Touch
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            Have questions or suggestions? We'd love to hear from you.
          </p>
          <a 
            href="mailto:contact@globaleye.news" 
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </a>
        </section>
      </div>
    </div>
  );
} 