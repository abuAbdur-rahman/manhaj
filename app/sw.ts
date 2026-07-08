import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  RangeRequestsPlugin,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1a. Home page — StaleWhileRevalidate (instant load, background refresh)
    {
      matcher: ({ url }) => url.pathname === "/",
      handler: new StaleWhileRevalidate({
        cacheName: "manhaj-home",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 1,
            maxAgeSeconds: 24 * 60 * 60,
          }),
        ],
      }),
    },

    // 1b. Other HTML pages — NetworkFirst (try online first, fall back to cache)
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "manhaj-pages",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },

    // 2. Audio files — CacheFirst with range request support
    {
      matcher: /\.(?:mp3|wav|ogg|m4a)$/i,
      handler: new CacheFirst({
        cacheName: "manhaj-audio",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
          new RangeRequestsPlugin(),
        ],
      }),
    },

    // 3. Images — CacheFirst
    {
      matcher: /\.(?:png|jpg|jpeg|webp|svg|gif)$/i,
      handler: new CacheFirst({
        cacheName: "manhaj-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },

    // 4. API calls — NetworkFirst
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "manhaj-api",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60,
          }),
        ],
      }),
    },

    // 5. Default strategy (JS, CSS, fonts)
    ...defaultCache,
  ],
});

serwist.addEventListeners();

serwist.setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    const match = await caches.match("/offline.html");
    return match || Response.error();
  }
  return Response.error();
});
