import http from 'node:http';
import https from 'node:https';
import CacheableLookup from 'cacheable-lookup';

// Aggressive DNS cache to reduce dns.lookup() calls in SSR
// and improve performance when making multiple requests to the same API
const cacheable = new CacheableLookup({
  maxTtl: 3600,
  errorTtl: 0.15,
  fallbackDuration: 3600,
});

try {
  cacheable.install(http.globalAgent);
  cacheable.install(https.globalAgent);
} catch {
  // Already installed, ignore
}
