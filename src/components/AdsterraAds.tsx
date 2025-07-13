"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AdProps {
  id: string;
  scriptSrc: string;
  atOptions: Record<string, unknown>;
  width: number;
  height: number;
  style?: React.CSSProperties | undefined;
}

// Professional error logger for ads
function logAdError(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('[AdsterraAds]', ...args);
  }
  // In production, you can send errors to a monitoring service here
}

function AdsterraScript({ id, scriptSrc, atOptions, width, height, style }: AdProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const loadAd = useCallback(() => {
    try {
      const currentRef = ref.current;
      if (!currentRef || !currentRef.parentNode) return;
      
      // Clear existing content safely
      try {
        currentRef.innerHTML = '';
      } catch (err) {
        // Log the error for debugging
        logAdError('Ad container clear error:', err);
      }
      
      // Create and append options script
      const scriptOptions = document.createElement("script");
      scriptOptions.type = "text/javascript";
      scriptOptions.innerHTML = `atOptions = ${JSON.stringify(atOptions).replace(/[^\x00-\x7F]/g, '')};`;
      
      // Check if element still exists before appending
      if (currentRef && currentRef.parentNode) {
        currentRef.appendChild(scriptOptions);
      }

      // Create and append main script
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = scriptSrc;
      script.async = true;
      script.crossOrigin = "anonymous";
      
      // Add event listeners for debugging
      script.onload = () => {
        if (ref.current) {
          setAdLoaded(true);
        }
      };
      
      script.onerror = () => {
        if (ref.current) {
          setAdError(true);
        }
      };
      
      // Check if element still exists before appending
      if (currentRef && currentRef.parentNode) {
        currentRef.appendChild(script);
      }

    } catch {
      // TODO: handle ad loading error
      if (ref.current) {
        setAdError(true);
      }
    }
  }, [scriptSrc, atOptions]);

  useEffect(() => {
    setAdLoaded(false);
    setAdError(false);

    // Store ref.current in a variable for cleanup
    const currentRef = ref.current;
    const retryTimeoutId: NodeJS.Timeout = setTimeout(() => {
      if (!adLoaded && !adError && retryCount < 2 && ref.current) {
        setRetryCount(prev => prev + 1);
        loadAd();
      }
    }, 5000); // Retry after 5 seconds

    // Initial load
    loadAd();

    // Set timeout to detect if ad doesn't load
    const timeoutId = setTimeout(() => {
      if (!adLoaded && !adError && ref.current) {
        setAdError(true);
      }
    }, 10000); // 10 seconds timeout

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(retryTimeoutId);
      // Use the stored ref value instead of ref.current
      if (currentRef) {
        try {
          // Remove all child nodes safely
          currentRef.innerHTML = '';
        } catch (err) {
          // TODO: handle ad cleanup error
          logAdError('Ad cleanup error:', err);
        }
      }
    };
  }, [loadAd, retryCount, adLoaded, adError]);

  if (adError) {
    return (
      <div 
        id={id}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          ...style
        }}
      >
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
          <div>Advertisement</div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>Unable to load</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      id={id}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: adLoaded ? 'transparent' : '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        ...style
      }}
    >
      {!adLoaded && !adError && (
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
          <div>Advertisement</div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>Loading...</div>
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
      try {
        const container = document.getElementById(id);
        if (!container || !container.parentNode) {
          setIframeError(true);
          return;
        }

        // Clear existing content safely
        try {
          container.innerHTML = '';
        } catch (err) {
          // Log the error for debugging
          logAdError('Iframe container clear error:', err);
        }

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
        
        if (container && container.parentNode) {
          container.appendChild(iframe);
        }
      } catch {
        // TODO: handle iframe creation error
        setIframeError(true);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      // Clean up iframe if component unmounts
      try {
        const container = document.getElementById(id);
        if (container && container.parentNode) {
          // Remove all child nodes safely
          container.innerHTML = '';
        }
      } catch (err) {
        // TODO: handle iframe cleanup error
        logAdError('Iframe cleanup error:', err);
      }
    };
  }, [id, scriptSrc, width, height]);

  if (iframeError) {
    return (
      <div 
        id={id}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          ...style
        }}
      >
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
          <div>Advertisement</div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>Unable to load</div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: iframeLoaded ? 'transparent' : '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        ...style
      }}
    >
      {!iframeLoaded && !iframeError && (
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
          <div>Advertisement</div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>Loading...</div>
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

// Main export component
export default function AdsterraAds({ id, scriptSrc, atOptions, width, height, style }: AdProps) {
  return <AdsterraIframe id={id} scriptSrc={scriptSrc} atOptions={atOptions} width={width} height={height} style={style} />;
}

// Specific ad banner components
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
      style={props.style}
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
      style={props.style}
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
      style={props.style}
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
      style={props.style}
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
      style={props.style}
    />
  );
} 