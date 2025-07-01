'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeState {
  dataURL: string | null;
  svg: string | null;
  loading: boolean;
  error: string | null;
}

export function useQRCode(text: string, options: QRCodeOptions = {}) {
  const [state, setState] = useState<QRCodeState>({
    dataURL: null,
    svg: null,
    loading: false,
    error: null,
  });

  const generateQRCode = useCallback(async (value: string) => {
    if (!value.trim()) {
      setState({
        dataURL: null,
        svg: null,
        loading: false,
        error: 'Text is required to generate QR code',
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const qrOptions: QRCodeOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
        ...options,
      };

      // Generate data URL (PNG format)
      const dataURL = await QRCode.toDataURL(value, qrOptions);

      // Generate SVG string
      const svg = await QRCode.toString(value, {
        ...qrOptions,
        type: 'svg',
      });

      setState({
        dataURL,
        svg,
        loading: false,
        error: null,
      });
    } catch (error: unknown) {
      console.error('QR Code generation failed:', error);
      setState({
        dataURL: null,
        svg: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to generate QR code',
      });
    }
  }, [options]);

  // Generate QR code when text changes
  useEffect(() => {
    generateQRCode(text);
  }, [text, generateQRCode]);

  const downloadQRCode = useCallback(async (filename: string = 'medguard-qr-code') => {
    if (!state.dataURL) {
      throw new Error('No QR code available to download');
    }

    // Only run on client side
    if (typeof window === 'undefined') {
      throw new Error('Download functionality is only available in the browser');
    }

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = state.dataURL;
      link.download = `${filename}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: unknown) {
      console.error('Download failed:', error);
      throw new Error('Failed to download QR code');
    }
  }, [state.dataURL]);

  const downloadQRCodeSVG = useCallback(async (filename: string = 'medguard-qr-code') => {
    if (!state.svg) {
      throw new Error('No SVG QR code available to download');
    }

    // Only run on client side
    if (typeof window === 'undefined') {
      throw new Error('Download functionality is only available in the browser');
    }

    try {
      // Create blob from SVG string
      const blob = new Blob([state.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      // Create temporary link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.svg`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error('SVG download failed:', error);
      throw new Error('Failed to download SVG QR code');
    }
  }, [state.svg]);

  const copyToClipboard = useCallback(async () => {
    if (!text) {
      throw new Error('No text available to copy');
    }

    // Only run on client side
    if (typeof window === 'undefined') {
      throw new Error('Copy functionality is only available in the browser');
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (error: unknown) {
      console.error('Copy to clipboard failed:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, [text]);

  const printQRCode = useCallback(() => {
    if (!state.dataURL) {
      throw new Error('No QR code available to print');
    }

    // Only run on client side
    if (typeof window === 'undefined') {
      throw new Error('Print functionality is only available in the browser');
    }

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>MedGuard Emergency QR Code</title>
    <style>
      body {
        margin: 0;
        padding: 20px;
        font-family: Arial, sans-serif;
        text-align: center;
      }
      .qr-container {
        margin: 20px auto;
        max-width: 400px;
      }
      .qr-image {
        max-width: 100%;
        height: auto;
        border: 2px solid #000;
        margin: 20px 0;
      }
      .instructions {
        margin: 20px 0;
        font-size: 14px;
        line-height: 1.5;
      }
      .emergency-text {
        color: #dc2626;
        font-weight: bold;
        font-size: 18px;
        margin: 10px 0;
      }
      @media print {
        body { margin: 0; }
      }
    </style>
  </head>
  <body>
    <div class="qr-container">
      <h1>🚨 MedGuard Emergency QR Code 🚨</h1>
      <img src="${state.dataURL}" alt="Emergency QR Code" class="qr-image" />
      <div class="emergency-text">
        SCAN IN EMERGENCY
      </div>
      <div class="instructions">
        <p><strong>Instructions:</strong></p>
        <p>1. Keep this QR code with you at all times</p>
        <p>2. In emergency, anyone can scan this code</p>
        <p>3. It will show your medical info and emergency contacts</p>
        <p>4. No login required for emergency access</p>
      </div>
      <div style="margin-top: 40px; font-size: 12px; color: #666;">
        Generated by MedGuard Emergency Platform<br>
        ${new Date().toLocaleDateString()}
      </div>
    </div>
  </body>
</html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for image to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (error: unknown) {
      console.error('Print failed:', error);
      throw new Error('Failed to print QR code');
    }
  }, [state.dataURL]);

  return {
    ...state,
    generateQRCode,
    downloadQRCode,
    downloadQRCodeSVG,
    copyToClipboard,
    printQRCode,
    isReady: !state.loading && !state.error && !!state.dataURL,
  };
} 