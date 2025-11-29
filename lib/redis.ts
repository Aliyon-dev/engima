import { Redis } from "@upstash/redis";

/**
 * Redis client for ephemeral secret storage
 * Uses Upstash Redis REST API
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

