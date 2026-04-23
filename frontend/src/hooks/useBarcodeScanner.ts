import { useEffect, useRef } from "react";

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void;
  /**
   * Minimum length to consider it a barcode.
   */
  minLength?: number;
  /**
   * Maximum time between keystrokes in milliseconds.
   * Scanners act like very fast keyboards.
   */
  maxIntervalMs?: number;
}

export const BARCODE_SCAN_EVENT = "Giztrack:barcode-scan";

export function dispatchSimulatedBarcodeScan(barcode: string) {
  if (typeof window === "undefined") {
    return;
  }

  const value = barcode.trim();
  if (!value) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<string>(BARCODE_SCAN_EVENT, {
      detail: value,
    })
  );
}

export function useBarcodeScanner({
  onScan,
  minLength = 4,
  maxIntervalMs = 50,
}: UseBarcodeScannerProps) {
  const buffer = useRef("");
  const lastKeyTime = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if the user is explicitly typing into an input field or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const now = performance.now();
      const timeSinceLastKey = now - lastKeyTime.current;

      // If time between keystrokes is too long, it's a human typing, reset buffer
      if (timeSinceLastKey > maxIntervalMs) {
        buffer.current = "";
      }

      lastKeyTime.current = now;

      // Handle Enter key which scanners usually send at the end of the code
      if (e.key === "Enter") {
        if (buffer.current.length >= minLength) {
          onScan(buffer.current);
          e.preventDefault();
        }
        buffer.current = "";
        return;
      }

      // Only accumulate printable single characters
      if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };

    const handleSimulatedScan = (event: Event) => {
      const barcode = (event as CustomEvent<string>).detail?.trim() || "";
      if (barcode.length >= minLength) {
        onScan(barcode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(BARCODE_SCAN_EVENT, handleSimulatedScan as EventListener);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(BARCODE_SCAN_EVENT, handleSimulatedScan as EventListener);
    };
  }, [onScan, minLength, maxIntervalMs]);
}
