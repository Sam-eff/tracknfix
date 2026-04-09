import { useState } from "react";
import { dispatchSimulatedBarcodeScan } from "../hooks/useBarcodeScanner";

interface BarcodeScannerNoticeProps {
  title: string;
  description: string;
}

export default function BarcodeScannerNotice({
  title,
  description,
}: BarcodeScannerNoticeProps) {
  const [testCode, setTestCode] = useState("");
  const showTestTool = import.meta.env.DEV;

  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{
        borderColor: "#bfdbfe",
        backgroundColor: "#eff6ff",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(37, 99, 235, 0.12)", color: "#1d4ed8" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7V5a1 1 0 011-1h2m10 0h2a1 1 0 011 1v2M4 17v2a1 1 0 001 1h2m10 0h2a1 1 0 001-1v-2M7 8v8m3-8v8m4-8v8m3-8v8" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold" style={{ color: "#1e3a8a" }}>
              {title}
            </p>
            <span
              className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}
            >
              Scanner Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: "#1e40af" }}>
            {description}
          </p>
        </div>
      </div>

      {showTestTool ? (
        <div
          className="mt-4 rounded-xl border p-3 sm:p-4 space-y-3"
          style={{ borderColor: "#bfdbfe", backgroundColor: "rgba(255,255,255,0.65)" }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1e3a8a" }}>
              Test without a physical scanner
            </p>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "#1e40af" }}>
              Enter a barcode or SKU value below and send a simulated scan through the same app flow used by the real scanner.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              placeholder="Example: 12345678"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: "white",
                border: "1px solid #93c5fd",
                color: "#1e3a8a",
              }}
            />
            <button
              type="button"
              onClick={() => {
                dispatchSimulatedBarcodeScan(testCode);
                setTestCode("");
              }}
              disabled={!testCode.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                backgroundColor: "#2563eb",
                opacity: testCode.trim() ? 1 : 0.6,
                cursor: testCode.trim() ? "pointer" : "not-allowed",
              }}
            >
              Test Scan
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
