import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';

interface HtmlThumbnailProps {
  html: string;
  width?: number;
  height?: number;
  forceAutoHeight?: boolean;
}

const HtmlThumbnail: React.FC<HtmlThumbnailProps> = ({ html, width = 320, height = 0, forceAutoHeight = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [htmlVisible, setHtmlVisible] = useState(true);
  const [dynamicHeight, setDynamicHeight] = useState<number | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const convert = () => {
      if (containerRef.current) {
        // Measure the rendered height of the HTML template
        const measuredHeight = containerRef.current.offsetHeight;
        console.log('[HtmlThumbnail] Detected template height:', measuredHeight);
        setDynamicHeight(measuredHeight);
        toPng(containerRef.current, {
          width,
          height: measuredHeight,
          cacheBust: true,
          skipFonts: true,
          backgroundColor: '#fff' // Ensure non-white background
        })
          .then((dataUrl) => {
            setImgSrc(dataUrl);
            setHtmlVisible(false); // Remove HTML after screenshot
            setErrorMsg(null);
            if (forceAutoHeight) {
              setDynamicHeight(undefined); // Switch to auto after screenshot
            }
          })
          .catch((err) => {
            setImgSrc(null);
            setErrorMsg('Failed to generate image: ' + (err?.message || 'Unknown error'));
            console.error('[HtmlThumbnail] Error generating image:', err);
          });
      }
    };
    if (document.readyState === 'complete') {
      convert();
    } else {
      window.addEventListener('load', convert);
      return () => window.removeEventListener('load', convert);
    }
  }, [html, width, height, forceAutoHeight]);

  return (
  <div style={{ width: '100%', height: forceAutoHeight ? 'auto' : dynamicHeight ?? 'auto', position: 'relative', overflow: 'hidden', margin: 0, background: '#fff' }}>
      {/* Hidden HTML for rendering to image */}
      {htmlVisible && (
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            left: '0px',
            top: 0,
            width,
            pointerEvents: 'none',
            zIndex: -1,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
      {/* Rendered thumbnail */}
      {imgSrc && (
        <img src={imgSrc || undefined} alt="HTML Thumbnail" style={{ width: '100%', height: forceAutoHeight ? 'auto' : dynamicHeight ?? 'auto', objectFit: 'contain', borderRadius: 0, margin: 0 }} />
      )}
      {/* Error message if image generation fails */}
      {errorMsg && (
        <div style={{ color: 'red', fontSize: 14, marginTop: 8 }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}

export default HtmlThumbnail;

