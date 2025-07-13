"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AdProps {
  id: string;
  scriptSrc: string;
  atOptions: any;
  width: number;
  height: number;
  style?: React.CSSProperties;
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
        while (currentRef.firstChild) {
          currentRef.removeChild(currentRef.firstChild);
        }
      } catch (error) {
        console.warn('Error clearing ad container:', error);
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

    } catch (error) {
      console.warn('Error loading ad:', error);
      if (ref.current) {
        setAdError(true);
      }
    }
  }, [scriptSrc, atOptions]);

  useEffect(() => {
    if (!ref.current) return;
    
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
      // Only clear innerHTML if the ref still exists and is the same element
      if (ref.current && ref.current === currentRef) {
        try {
          // Remove all child nodes safely
          while (ref.current.firstChild) {
            ref.current.removeChild(ref.current.firstChild);
          }
        } catch (error) {
          console.warn('Error during ad cleanup:', error);
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
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        } catch (error) {
          console.warn('Error clearing iframe container:', error);
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
      } catch (error) {
        console.warn('Error creating iframe:', error);
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
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        }
      } catch (error) {
        console.warn('Error during iframe cleanup:', error);
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
  return <AdsterraEnhanced id={id} scriptSrc={scriptSrc} atOptions={atOptions} width={width} height={height} style={style} />;
} 