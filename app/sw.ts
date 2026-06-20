import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  RangeRequestsPlugin,
  Serwist,
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
    {
      matcher: /\.(?:mp3|wav|ogg)$/i,
      handler: new CacheFirst({
        cacheName: "manhaj-audio",
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 2592000 }),
          new RangeRequestsPlugin(),
        ],
      }),
    },
    {
      matcher: /\.(?:png|jpg|jpeg|webp|svg)$/i,
      handler: new CacheFirst({
        cacheName: "manhaj-images",
        plugins: [
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 604800 }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
