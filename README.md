# Enigma - Host-Proof Secret Sharing

A secure, "burn-after-reading" secret sharing application where the server never sees plaintext secrets.

## Features

- 🔒 **Client-side encryption** - All encryption/decryption happens in the browser
- 🔥 **Burn-after-reading** - Secrets are destroyed after first view
- 🚫 **Zero-knowledge** - Server never sees plaintext secrets
- ⏱️ **TTL support** - Secrets expire after 1 hour, 1 day, or 1 week

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS (dark mode)
- Redis (Upstash) for ephemeral storage
- Web Crypto API (native browser crypto)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   ```

3. **Get Upstash Redis credentials:**
   - Sign up at [Upstash](https://upstash.com/)
   - Create a Redis database
   - Copy the REST URL and REST Token

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## How It Works

### Creation Flow
1. User enters secret text in the browser
2. Browser generates a random AES-GCM encryption key
3. Browser encrypts the text using the key
4. Only encrypted data is sent to the server
5. Server stores encrypted data in Redis with TTL
6. Browser constructs shareable URL: `/view/[id]#key=[base64key]`

### Retrieval Flow
1. User clicks the shareable link
2. Browser extracts decryption key from URL hash fragment (never sent to server)
3. Browser fetches encrypted data from API
4. API atomically retrieves and deletes the secret from Redis
5. Browser decrypts the data using the key from URL hash
6. Plain text is displayed (secret is now destroyed on server)

## Security

- All encryption/decryption uses Web Crypto API (AES-GCM)
- Decryption keys are transmitted via URL hash fragments (never sent to server)
- Atomic Redis operations prevent race conditions
- No caching on GET endpoint (`force-dynamic`)
- XSS protection via React's default escaping

## Project Structure

```
engima/
├── app/
│   ├── api/
│   │   └── secret/
│   │       └── route.ts          # API endpoints
│   ├── view/
│   │   └── [id]/
│   │       └── page.tsx          # View secret page
│   ├── layout.tsx
│   ├── page.tsx                  # Home page
│   └── globals.css
├── components/
│   ├── CreateSecretForm.tsx      # Create secret form
│   └── ViewSecret.tsx            # View secret component
├── lib/
│   ├── crypto.ts                 # Encryption utilities
│   └── redis.ts                  # Redis client
└── package.json
```

## License

MIT

