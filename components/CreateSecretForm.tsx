"use client";

import { useState } from "react";
import { generateKey, encrypt, encryptKeyWithPin } from "@/lib/crypto";

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

export default function CreateSecretForm() {
  const [secret, setSecret] = useState("");
  const [pin, setPin] = useState("");
  const [ttl, setTtl] = useState(86400); // Default: 1 day
  const [loading, setLoading] = useState(false);
  const [shareableUrl, setShareableUrl] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch (err) {
      showToast("Failed to copy", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    if (!pin.trim() || pin.length < 4) {
      showToast("PIN must be at least 4 characters", "error");
      return;
    }

    setLoading(true);
    try {
      // Generate encryption key
      const key = await generateKey();

      // Encrypt the secret
      const { encryptedHex, ivHex } = await encrypt(secret, key);

      // Encrypt the key with PIN
      const { encryptedKeyHex, keyIvHex, saltHex } = await encryptKeyWithPin(key, pin);

      // POST to API
      const response = await fetch("/api/secret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encryptedHex,
          ivHex,
          ttlSeconds: ttl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to store secret");
      }

      const { id } = await response.json();

      // Construct shareable URL with encrypted key data
      const baseUrl = window.location.origin;
      const keyData = JSON.stringify({
        encryptedKeyHex,
        keyIvHex,
        saltHex,
      });
      const url = `${baseUrl}/view/${id}#key=${encodeURIComponent(btoa(keyData))}`;
      setShareableUrl(url);
    } catch (error) {
      console.error("Error creating secret:", error);
      showToast("Failed to create secret. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSecret("");
    setPin("");
    setShareableUrl("");
    setTtl(86400);
  };

  if (shareableUrl) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white border-4 border-black p-8 space-y-6 shadow-[8px_8px_0_0_rgb(59,130,246)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-blue-500"></div>
            <h2 className="text-2xl font-black text-black uppercase tracking-wide">
              Secret Link Ready
            </h2>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-black uppercase tracking-wide">
              Shareable Link
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={shareableUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border-2 border-black text-sm font-mono text-black focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => copyToClipboard(shareableUrl)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black font-bold uppercase tracking-wide transition-colors shadow-[4px_4px_0_0_rgb(0,0,0)] hover:shadow-[2px_2px_0_0_rgb(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="pt-6 border-t-4 border-black">
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 bg-white hover:bg-gray-50 text-black border-2 border-black font-bold uppercase tracking-wide transition-colors shadow-[4px_4px_0_0_rgb(0,0,0)] hover:shadow-[2px_2px_0_0_rgb(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              Create New Secret
            </button>
          </div>
        </div>

        {/* Toast Container */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-6 py-3 border-2 border-black font-bold uppercase tracking-wide shadow-[4px_4px_0_0_rgb(0,0,0)] ${
                toast.type === "success"
                  ? "bg-blue-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label
            htmlFor="secret"
            className="block text-sm font-bold text-black uppercase tracking-wide"
          >
            Enter your secret
          </label>
          <textarea
            id="secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Paste your API key, password, .env file content, or any sensitive data here..."
            className="w-full px-4 py-4 bg-gray-50 border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono text-sm min-h-[200px] resize-y"
            required
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="pin"
            className="block text-sm font-bold text-black uppercase tracking-wide"
          >
            PIN (minimum 4 characters)
          </label>
          <input
            id="pin"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter a PIN to protect your secret"
            className="w-full px-4 py-3 bg-gray-50 border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono text-lg text-center tracking-widest"
            required
            minLength={4}
          />
          <p className="text-xs text-gray-600 font-medium">
            Recipients will need this PIN to decrypt the secret
          </p>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="ttl"
            className="block text-sm font-bold text-black uppercase tracking-wide"
          >
            Expires in
          </label>
          <select
            id="ttl"
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border-2 border-black text-black focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value={3600}>1 hour</option>
            <option value={86400}>1 day</option>
            <option value={604800}>1 week</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !secret.trim() || !pin.trim() || pin.length < 4}
          className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-2 border-black font-black uppercase tracking-wide transition-all shadow-[6px_6px_0_0_rgb(0,0,0)] hover:shadow-[3px_3px_0_0_rgb(0,0,0)] hover:translate-x-[3px] hover:translate-y-[3px] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {loading ? "Encrypting..." : "Encrypt & Share"}
        </button>
      </form>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 border-2 border-black font-bold uppercase tracking-wide shadow-[4px_4px_0_0_rgb(0,0,0)] ${
              toast.type === "success"
                ? "bg-blue-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

