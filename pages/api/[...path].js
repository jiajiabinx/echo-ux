import httpProxyMiddleware from 'next-http-proxy-middleware';

export const config = {
  api: {
    // Enable `externalResolver` to let Next.js know this is handled by an external service
    externalResolver: true,
    // Increase body size limit for uploads if needed
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Proxy request to backend API
  return httpProxyMiddleware(req, res, {
    target: 'http://35.223.31.93:8000',
    pathRewrite: [
      {
        patternStr: '^/api',
        replaceStr: '/api',
      },
    ],
    // Handle HTTP errors
    onError(err, req, res) {
      console.error(`Proxy error: ${err.message}`);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    // Handle headers for CORS
    onProxyRes(proxyRes, req, res) {
      // Set CORS headers
      proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
  });
} 