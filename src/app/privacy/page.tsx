import Link from "next/link";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Introduction
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-foreground">
            <p>
              GlobalEye News ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p>
              By using our website, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our website.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Information We Collect
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Personal Information
              </h3>
              <p className="text-base leading-relaxed text-foreground">
                We may collect personal information that you voluntarily provide to us, such as your name, email address, and any other information you choose to provide when you contact us or subscribe to our services.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Automatically Collected Information
              </h3>
              <p className="text-base leading-relaxed text-foreground">
                When you visit our website, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            How We Use Your Information
          </h2>
          <p className="text-base leading-relaxed text-foreground mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base leading-relaxed text-foreground">
            <li>Provide and maintain our news services</li>
            <li>Improve and personalize your experience</li>
            <li>Analyze usage patterns and trends</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Send you updates and newsletters (with your consent)</li>
            <li>Ensure the security and integrity of our platform</li>
          </ul>
        </section>

        {/* Information Sharing */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Information Sharing and Disclosure
          </h2>
          <p className="text-base leading-relaxed text-foreground mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base leading-relaxed text-foreground">
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist in our operations</li>
            <li>In connection with a business transfer or merger</li>
          </ul>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Cookies and Tracking Technologies
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-foreground">
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand where our visitors are coming from.
            </p>
            <p>
              You can control cookie settings through your browser preferences. However, disabling cookies may affect the functionality of our website.
            </p>
          </div>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Data Security
          </h2>
          <p className="text-base leading-relaxed text-foreground">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Your Rights
          </h2>
          <p className="text-base leading-relaxed text-foreground mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base leading-relaxed text-foreground">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Contact Us
          </h2>
          <p className="text-base leading-relaxed text-foreground">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a 
              href="mailto:privacy@globaleye.news" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              privacy@globaleye.news
            </a>
          </p>
        </section>
      </div>
    </div>
  );
} 