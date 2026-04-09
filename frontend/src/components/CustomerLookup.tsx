import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import api from "../api/axios";
import type { Customer } from "../types";

interface CustomerLookupProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
  onClear: () => void;
  inputStyle: CSSProperties;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

export default function CustomerLookup({
  selectedCustomer,
  onSelect,
  onClear,
  inputStyle,
  label = "Find Existing Customer",
  placeholder = "Search by customer name or phone...",
  helperText = "Optional, but recommended to avoid duplicate customers.",
}: CustomerLookupProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }
    setQuery("");
    setResults([]);
  }, [selectedCustomer]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/customers/", {
          params: { search: term },
        });
        const customers = (data.results || data || []) as Customer[];
        setResults(customers.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
        {label}
      </label>

      {selectedCustomer ? (
        <div
          className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl border"
          style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {selectedCustomer.name}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
              {selectedCustomer.phone}
              {selectedCustomer.email ? ` • ${selectedCustomer.email}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg font-semibold text-primary"
            style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={inputStyle}
          />

          {loading && (
            <div className="absolute right-3 top-2.5">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" style={{ color: "var(--color-muted)" }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {query.trim().length >= 2 && (
            <div
              className="absolute z-20 w-full mt-1 rounded-xl shadow-xl overflow-hidden border max-h-64 overflow-y-auto"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              {results.length > 0 ? (
                results.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => onSelect(customer)}
                    className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b last:border-b-0"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      {customer.name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                      {customer.phone}
                      {customer.email ? ` • ${customer.email}` : ""}
                    </p>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm" style={{ color: "var(--color-muted)" }}>
                  No existing customer found. You can continue with a new customer below.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
        {helperText}
      </p>
    </div>
  );
}
