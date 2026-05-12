# Place your favicon files here

## Recommended favicon sizes:

1. **favicon.ico** (32x32 or 64x64)
   - Root level or this folder
   - Fallback for older browsers

2. **apple-touch-icon.png** (180x180)
   - For iOS home screen

3. **icon-192x192.png** (192x192)
   - For Android

4. **icon-512x512.png** (512x512)
   - For web app manifest

## How to use:

1. Generate favicons at [favicon.io](https://favicon.io) or [realfavicongenerator.net](https://realfavicongenerator.net)
2. Place `.ico` and `.png` files in this folder
3. The app already references them in `app/layout.tsx`

## Quick Data URI Favicon:

If you want a simple emoji favicon, you can use this in `layout.tsx`:

```typescript
// Add to head
<link 
  rel="icon" 
  href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💌</text></svg>" 
/>
```

This gives you a 💌 emoji as favicon!
