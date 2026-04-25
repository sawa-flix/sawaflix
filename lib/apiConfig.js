const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sawaflix-backend.onrender.com';
export const BACKEND_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
