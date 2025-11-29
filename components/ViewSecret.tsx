"use client";

import { useState, useEffect } from "react";
import { decrypt } from "@/lib/crypto";

type ViewSecretProps = {
  id: string;
};

export default function ViewSecret({ id }: ViewSecretProps) {
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    // Clear toast after 3 seconds
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ message: "Copied to clipboard!", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to copy", type: "error" });
    }
  };

  const handleReveal = async () => {
    setLoading(true);
    setError("");

    try {
      // Extract key from URL hash
      const hash = window.location.hash;
      if (!hash || !hash.startsWith("#key=")) {
        throw new Error("Missing decryption key in URL");
      }

      const keyBase64 = decodeURIComponent(hash.substring(5));

      // Fetch encrypted data from API
      const response = await fetch(`/api/secret?id=${id}`);

      if (response.status === 404) {
        setError("Secret not found. It may have already been viewed or expired.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to retrieve secret");
      }

      const { encryptedHex, ivHex } = await response.json();

      // Decrypt the secret
      const decrypted = await decrypt(encryptedHex, keyBase64, ivHex);
      setSecret(decrypted);
      setRevealed(true);
    } catch (err) {
      console.error("Error revealing secret:", err);
      if (err instanceof Error && err.message.includes("Missing decryption key")) {
        setError("Invalid link: Missing decryption key");
      } else if (err instanceof Error && err.message.includes("Secret not found")) {
        setError("Secret not found. It may have already been viewed or expired.");
      } else {
        setError("Failed to decrypt secret. The link may be invalid or corrupted.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (error && !revealed) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-red-50 border-4 border-red-500 p-8 space-y-4 shadow-[8px_8px_0_0_rgb(239,68,68)]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-2xl font-black text-red-600 uppercase tracking-wide">Secret Not Found</h2>
          </div>
          <p className="text-black font-medium">{error}</p>
          <p className="text-sm text-gray-600 font-medium">
            It may have already been viewed or it expired.
          </p>
        </div>
      </div>
    );
  }

  if (revealed) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Warning Banner */}
        <div className="bg-yellow-50 border-4 border-yellow-500 p-6 shadow-[6px_6px_0_0_rgb(234,179,8)]">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-black text-yellow-700 mb-2 uppercase tracking-wide text-lg">
                This message has been destroyed from the server
              </p>
              <p className="text-sm text-black font-medium">
                You cannot view it again. Make sure to copy it if you need it.
              </p>
            </div>
          </div>
        </div>

        {/* Secret Display */}
        <div className="bg-white border-4 border-black p-8 space-y-6 shadow-[8px_8px_0_0_rgb(59,130,246)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black uppercase tracking-wide">Your Secret</h2>
            <button
              onClick={() => copyToClipboard(secret)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black font-bold uppercase tracking-wide transition-all text-sm shadow-[4px_4px_0_0_rgb(0,0,0)] hover:shadow-[2px_2px_0_0_rgb(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              Copy Secret
            </button>
          </div>
          <pre className="bg-gray-50 border-2 border-black p-6 overflow-x-auto text-sm text-black font-mono whitespace-pre-wrap break-words">
            {secret}
          </pre>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-4 right-4 px-6 py-3 border-2 border-black font-bold uppercase tracking-wide shadow-[4px_4px_0_0_rgb(0,0,0)] z-50 ${
              toast.type === "success"
                ? "bg-blue-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border-4 border-black p-10 text-center space-y-8 shadow-[8px_8px_0_0_rgb(59,130,246)]">
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-black uppercase tracking-wide">
            Secure Message Ready
          </h2>
          <p className="text-gray-700 font-medium text-lg">
            Click the button below to decrypt and view the secret message.
          </p>
        </div>

        <button
          onClick={handleReveal}
          disabled={loading}
          className="px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-2 border-black font-black uppercase tracking-wide transition-all shadow-[6px_6px_0_0_rgb(0,0,0)] hover:shadow-[3px_3px_0_0_rgb(0,0,0)] hover:translate-x-[3px] hover:translate-y-[3px] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {loading ? "Decrypting secure message..." : "Reveal Secret"}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-500 text-red-600 text-sm font-bold">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

