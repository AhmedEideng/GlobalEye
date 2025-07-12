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

  useEffect(() => {
    if (!ref.current) return;
    
    // Clear previous content
    ref.current.innerHTML = "";
    setAdLoaded(false);
    setAdError(false);

    // Store ref.current in a variable for cleanup
    const currentRef = ref.current;

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
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Ad loaded successfully: ${id}`);
        }
        setAdLoaded(true);
      };
      
      script.onerror = () => {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to load ad: ${id}`);
        }
        setAdError(true);
      };
      
      currentRef.appendChild(script);

      // Cleanup function
      return () => {
        if (currentRef) {
          currentRef.innerHTML = "";
        }
      };
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error setting up ad ${id}:`, error);
      }
      setAdError(true);
    }
  }, [scriptSrc, atOptions, id]);

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

export function AdsterraBanner728x90(props: { style?: React.CSSProperties }) {
  return (
    <AdsterraScript
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
    <AdsterraScript
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
    <AdsterraScript
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
    <AdsterraScript
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
    <AdsterraScript
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