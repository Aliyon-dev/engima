"use client";

import { useRef } from "react";
import CreateSecretForm from "@/components/CreateSecretForm";

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-8">
            <h1 className="text-6xl md:text-8xl font-black text-black tracking-tight uppercase">
              ENIGMA
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-bold max-w-3xl mx-auto">
              Share sensitive data securely with zero-knowledge encryption. 
              Your secrets are encrypted in your browser and destroyed after first view.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button
              onClick={scrollToForm}
              className="px-12 py-6 bg-blue-500 hover:bg-blue-600 text-white border-4 border-black font-black uppercase tracking-wide text-xl transition-all shadow-[8px_8px_0_0_rgb(0,0,0)] hover:shadow-[4px_4px_0_0_rgb(0,0,0)] hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              Create Secret
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_0_rgb(59,130,246)]">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-black text-black uppercase tracking-wide mb-2">
                Client-Side Encryption
              </h3>
              <p className="text-gray-700 font-medium">
                All encryption happens in your browser using Web Crypto API. 
                The server never sees your plaintext secrets.
              </p>
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_0_rgb(59,130,246)]">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-black text-black uppercase tracking-wide mb-2">
                Burn After Reading
              </h3>
              <p className="text-gray-700 font-medium">
                Secrets are automatically destroyed from the server after being viewed once. 
                No trace left behind.
              </p>
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_0_rgb(59,130,246)]">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-black text-black uppercase tracking-wide mb-2">
                Auto-Expiration
              </h3>
              <p className="text-gray-700 font-medium">
                Set expiration times from 1 hour to 1 week. 
                Secrets automatically expire even if never viewed.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-20 space-y-8">
            <h2 className="text-4xl font-black text-black uppercase tracking-wide text-center">
              How It Works
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 border-2 border-black flex items-center justify-center font-black text-white text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black uppercase mb-2">
                      Encrypt Your Secret
                    </h3>
                    <p className="text-gray-700 font-medium">
                      Paste your secret (API keys, passwords, .env files) into the form. 
                      Your browser generates a unique encryption key and encrypts the data locally.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 border-2 border-black flex items-center justify-center font-black text-white text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black uppercase mb-2">
                      Get Shareable Link
                    </h3>
                    <p className="text-gray-700 font-medium">
                      Only the encrypted data is sent to the server. 
                      You receive a shareable link with the decryption key in the URL hash.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 border-2 border-black flex items-center justify-center font-black text-white text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black uppercase mb-2">
                      Share Securely
                    </h3>
                    <p className="text-gray-700 font-medium">
                      Send the link to your recipient. 
                      The decryption key is in the URL hash, which browsers never send to the server.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 border-2 border-black flex items-center justify-center font-black text-white text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black uppercase mb-2">
                      Auto-Destroy
                    </h3>
                    <p className="text-gray-700 font-medium">
                      When the recipient views the secret, it&apos;s decrypted in their browser 
                      and immediately deleted from the server. One-time use only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section ref={formRef} className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight">
              Create Your Secret
            </h2>
            <p className="text-lg text-gray-700 font-medium">
              Enter your sensitive data below. It will be encrypted before leaving your device.
            </p>
          </div>
          <CreateSecretForm />
        </div>
      </section>
    </main>
  );
}

