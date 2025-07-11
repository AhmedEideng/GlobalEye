import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const scriptOptions = document.createElement("script");
    scriptOptions.type = "text/javascript";
    scriptOptions.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = scriptSrc;
    script.async = true;
    ref.current.appendChild(scriptOptions);
    ref.current.appendChild(script);
    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [scriptSrc, atOptions]);

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
        ...style,
      }}
    />
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