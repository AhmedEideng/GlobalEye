"use client";

import { useEffect, useRef, useState } from "react";

type AdProps = {
  id: string;
  scriptSrc: string;
  atOptions: object;
  width: number;
  height: number;
  style?: React.CSSProperties;
};

function AdsterraScript({ id, scriptSrc, atOptions, width, height, style }: AdProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    
    // Clear previous content
    ref.current.innerHTML = "";
    setAdLoaded(false);
    setAdError(false);

    // Store ref.current in a variable for cleanup
    const currentRef = ref.current;

    const loadAd = () => {
      try {
        // Create and append options script
        const scriptOptions = document.createElement("script");
        scriptOptions.type = "text/javascript";
        scriptOptions.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;
        currentRef.appendChild(scriptOptions);

        // Create and append main script
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = scriptSrc;
        script.async = true;
        
        // Add event listeners for debugging
        script.onload = () => {
          setAdLoaded(true);
        };
        
        script.onerror = () => {
          setAdError(true);
        };
        
        currentRef.appendChild(script);

        // Set timeout to detect if ad doesn't load
        const timeout = setTimeout(() => {
          if (!adLoaded && !adError) {
            setAdError(true);
          }
        }, 10000); // 10 seconds timeout

        return () => {
          clearTimeout(timeout);
          if (currentRef) {
            currentRef.innerHTML = "";
          }
        };
      } catch {
        setAdError(true);
      }
    };

    // Initial load
    const cleanup = loadAd();

    // Retry mechanism
    const retryTimeout = setTimeout(() => {
      if (!adLoaded && !adError && retryCount < 2) {
        setRetryCount(prev => prev + 1);
        loadAd();
      }
    }, 5000); // Retry after 5 seconds

    return () => {
      clearTimeout(retryTimeout);
      if (cleanup) cleanup();
    };
  }, [scriptSrc, atOptions, id, retryCount, adLoaded, adError]);

  // Show fallback if ad fails to load
  if (adError) {
    return (
      <div
        id={id}
        ref={ref}
        style={{
          width,
          height,
          margin: "16px auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px dashed #ccc",
          backgroundColor: "#f9f9f9",
          ...style,
        }}
      >
        <div style={{ textAlign: "center", color: "#666", fontSize: "12px" }}>
          <div>Advertisement</div>
          <div style={{ fontSize: "10px" }}>Ad failed to load</div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      ref={ref}
      style={{
        width,
        height,
        margin: "16px auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: height,
        ...style,
      }}
    >
      {!adLoaded && (
        <div style={{ 
          textAlign: "center", 
          color: "#666", 
          fontSize: "12px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>
          Loading ad...
        </div>
      )}
    </div>
  );
}

// Alternative ad component using direct iframe
function AdsterraIframe({ id, scriptSrc, width, height, style }: AdProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    // Create iframe after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const iframe = document.createElement('iframe');
      iframe.src = scriptSrc.replace('/invoke.js', '/iframe.html');
      iframe.width = width.toString();
      iframe.height = height.toString();
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      
      iframe.onload = () => setIframeLoaded(true);
      iframe.onerror = () => setIframeError(true);
      
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = '';
        container.appendChild(iframe);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [id, scriptSrc, width, height]);

  if (iframeError) {
    return (
      <div
        id={id}
        style={{
          width,
          height,
          margin: "16px auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px dashed #ccc",
          backgroundColor: "#f9f9f9",
          ...style,
        }}
      >
        <div style={{ textAlign: "center", color: "#666", fontSize: "12px" }}>
          <div>Advertisement</div>
          <div style={{ fontSize: "10px" }}>Ad failed to load</div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      style={{
        width,
        height,
        margin: "16px auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: height,
        ...style,
      }}
    >
      {!iframeLoaded && (
        <div style={{ 
          textAlign: "center", 
          color: "#666", 
          fontSize: "12px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>
          Loading ad...
        </div>
      )}
    </div>
  );
}

// Enhanced ad component that tries script first, then iframe
function AdsterraEnhanced({ id, scriptSrc, atOptions, width, height, style }: AdProps) {
  const [useIframe, setUseIframe] = useState(false);

  useEffect(() => {
    // Try script method first, fallback to iframe after 15 seconds
    const timer = setTimeout(() => {
      setUseIframe(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  if (useIframe) {
    return <AdsterraIframe id={id} scriptSrc={scriptSrc} atOptions={atOptions} width={width} height={height} style={style} />;
  }

  return <AdsterraScript id={id} scriptSrc={scriptSrc} atOptions={atOptions} width={width} height={height} style={style} />;
}

export function AdsterraBanner728x90(props: { style?: React.CSSProperties }) {
  return (
    <AdsterraEnhanced
      id="adsterra-728x90"
      scriptSrc="//www.highperformanceformat.com/660754a78fda06e644a6817ff0427a41/invoke.js"
      atOptions={{
        key: "660754a78fda06e644a6817ff0427a41",
        format: "iframe",
        height: 90,
        width: 728,
        params: {},
      }}
      width={728}
      height={90}
      {...props}
    />
  );
}

export function AdsterraBanner468x60(props: { style?: React.CSSProperties }) {
  return (
    <AdsterraEnhanced
      id="adsterra-468x60"
      scriptSrc="//www.highperformanceformat.com/f466ceb9ca7e3d951fb4a66e512052a3/invoke.js"
      atOptions={{
        key: "f466ceb9ca7e3d951fb4a66e512052a3",
        format: "iframe",
        height: 60,
        width: 468,
        params: {},
      }}
      width={468}
      height={60}
      {...props}
    />
  );
}

export function AdsterraBanner320x50(props: { style?: React.CSSProperties }) {
  return (
    <AdsterraEnhanced
      id="adsterra-320x50"
      scriptSrc="//www.highperformanceformat.com/6105c06808151fd21ece64b116af7aa4/invoke.js"
      atOptions={{
        key: "6105c06808151fd21ece64b116af7aa4",
        format: "iframe",
        height: 50,
        width: 320,
        params: {},
      }}
      width={320}
      height={50}
      {...props}
    />
  );
}

export function AdsterraBanner300x250(props: { style?: React.CSSProperties }) {
  return (
    <AdsterraEnhanced
      id="adsterra-300x250"
      scriptSrc="//www.highperformanceformat.com/854324fb9e09c1fb4415dc816b41ce77/invoke.js"
      atOptions={{
        key: "854324fb9e09c1fb4415dc816b41ce77",
        format: "iframe",
        height: 250,
        width: 300,
        params: {},
      }}
      width={300}
      height={250}
      {...props}
    />
  );
}

export function AdsterraBanner160x300(props: { style?: React.CSSProperties }) {
  return (
    <AdsterraEnhanced
      id="adsterra-160x300"
      scriptSrc="//www.highperformanceformat.com/dc7f1c37b029fa1984d76552f99edaa6/invoke.js"
      atOptions={{
        key: "dc7f1c37b029fa1984d76552f99edaa6",
        format: "iframe",
        height: 300,
        width: 160,
        params: {},
      }}
      width={160}
      height={300}
      {...props}
    />
  );
} 