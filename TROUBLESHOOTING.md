# Troubleshooting Guide

Common issues and solutions.

## Installation & Setup

### ❌ "npm: command not found"
**Cause**: Node.js not installed

**Solution**:
1. Install Node.js from https://nodejs.org (LTS version)
2. Restart terminal/IDE
3. Verify: `node --version`

---

### ❌ "Cannot find .env.local"
**Cause**: Environment file not created

**Solution**:
```bash
cp .env.local.example .env.local
# Then add your Supabase credentials
```

---

### ❌ "'NEXT_PUBLIC_SUPABASE_URL' is not defined"
**Cause**: Environment variables not set

**Solution**:
1. Check `.env.local` exists
2. Add both variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   ```
3. Restart dev server: `npm run dev`

---

### ❌ "Port 3000 already in use"
**Cause**: Another app using same port

**Solution**:
```bash
# Option 1: Use different port
npm run dev -- -p 3001

# Option 2: Kill process on port 3000
# Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

---

## Database Issues

### ❌ "relation 'public.rooms' does not exist"
**Cause**: Database schema not created

**Solution**:
1. Go to Supabase SQL Editor
2. Run the complete schema from `supabase/migrations/001_initial_schema.sql`
3. Verify tables exist in Table Editor

---

### ❌ "No rows updated" when sending message
**Cause**: Table doesn't exist or wrong permissions

**Solution**:
1. Check `messages` table exists in Supabase
2. Verify `rooms` table has a room with matching ID
3. Check RLS policies are enabled (should be `true`)

---

### ❌ "Realtime not working - messages don't appear instantly"
**Cause**: Realtime subscriptions not enabled

**Solution**:
1. Go to Supabase → Realtime
2. Check `messages` table has realtime enabled
3. Check `rooms` table has realtime enabled
4. Toggle off/on if already enabled
5. Restart dev server

---

### ❌ "Listen for REALTIME_SUBSCRIBE failed" (console error)
**Cause**: RLS policies blocking subscriptions

**Solution**:
1. Check RLS policies in Supabase
2. Verify `REPLICA IDENTITY FULL` is set:
   ```sql
   ALTER TABLE messages REPLICA IDENTITY FULL;
   ALTER TABLE rooms REPLICA IDENTITY FULL;
   ```
3. Re-enable realtime

---

## Authentication & Permissions

### ❌ "Policy 'Allow public...' violates policy for table..."
**Cause**: RLS policies not set correctly

**Solution**:
```sql
-- Run in SQL Editor
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update messages" ON messages FOR UPDATE USING (true);
```

---

## Realtime & WebSocket

### ❌ "WebSocket is closed"
**Cause**: Connection lost or not established

**Solution**:
1. Check internet connection
2. Check Supabase is online
3. Check firewall isn't blocking WebSockets
4. Refresh page
5. Check browser console for errors

---

### ❌ "Typing indicator doesn't work"
**Cause**: Broadcast channel not working

**Solution**:
1. Verify realtime is enabled
2. Check typing logic in `MessageInput.tsx`
3. Verify `broadcastTyping` function being called
4. Check browser network tab for broadcast messages

---

### ❌ "Messages appear late or delayed"
**Cause**: Network lag or Supabase issue

**Solution**:
1. Check network latency (DevTools → Network)
2. Verify Supabase region is close to user
3. Check database isn't overloaded
4. Try Vercel Analytics to monitor

---

## Styling & UI

### ❌ "Tailwind CSS not applying"
**Cause**: CSS not compiled

**Solution**:
```bash
# Restart dev server
npm run dev

# Clear Next.js cache if needed
rm -rf .next
npm run dev
```

---

### ❌ "Colors look different than expected"
**Cause**: Browser color management or dark mode issue

**Solution**:
1. Check `theme-color` meta tag
2. Verify `tailwind.config.js` has correct colors
3. Force refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Clear browser cache

---

### ❌ "Animations stuttering or laggy"
**Cause**: Low-end device or browser issue

**Solution**:
1. Reduce animation complexity
2. Disable hardware acceleration
3. Update browser to latest version
4. Close other apps
5. Check DevTools Performance tab

---

### ❌ "Mobile keyboard overlapping input"
**Cause**: Viewport not configured correctly

**Solution**:
1. Check meta tags in `app/layout.tsx`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
   ```
2. Try disabling zoom on Safari iOS
3. Use native `<input>` tag (not custom)

---

## Messages & Chat

### ❌ "Message content is blank"
**Cause**: Sanitization removing content

**Solution**:
```typescript
// Check if content is sanitized too much
const test = sanitizeInput("Hello <b>world</b>")
console.log(test) // Should be "Hello world"
```

DOMPurify strips HTML by default (secure).

---

### ❌ "Can't send emoji messages"
**Cause**: Encoding issue or validation

**Solution**:
1. Check textarea allows emoji: ✅ It does
2. Verify content isn't empty: `message.trim() !== ''`
3. Check browser supports emoji (modern browsers do)
4. Try different emoji from different keyboard

---

### ❌ "Deleted messages still showing"
**Cause**: Component not re-rendering

**Solution**:
1. Check `is_deleted` flag in database
2. Verify component filters deleted messages
3. Try refreshing page
4. Check message subscription is working

---

### ❌ "Old messages don't load"
**Cause**: Message history limit or pagination

**Solution**:
```typescript
// Edit in ChatRoom.tsx
const loadedMessages = await getMessages(roomData.id, 100) // Increase from 50
```

---

## Performance Issues

### ❌ "App is slow or laggy"
**Solution**:
1. Check Lighthouse score
2. Disable extensions
3. Check DevTools Network tab for slow requests
4. Check for console errors
5. Check Supabase region
6. Verify message count (consider pagination)

---

### ❌ "High CPU usage on mobile"
**Cause**: Too many animations or re-renders

**Solution**:
1. Reduce animation count
2. Use React DevTools Profiler
3. Check for infinite loops
4. Implement virtualization for many messages

---

### ❌ "Large bundle size"
**Cause**: Unnecessary dependencies

**Solution**:
```bash
npm run build
# Check `npm list` for unused packages
# Current: ~50KB gzipped is normal
```

---

## Deployment Issues

### ❌ "Build fails on Vercel"
**Cause**: Missing dependencies or environment variables

**Solution**:
1. Check Vercel Build Logs
2. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Rebuild: `vercel redeploy`

---

### ❌ "App works locally but not on Vercel"
**Cause**: Environment variable not set

**Solution**:
1. Go to Vercel Project Settings
2. Check Environment Variables section
3. Add both Supabase variables
4. Redeploy

---

### ❌ "CORS errors in production"
**Cause**: Supabase domain restrictions

**Solution**:
1. Go to Supabase Settings → API
2. Check if domain is allowed
3. Add your Vercel domain to allowed list
4. Supabase handles CORS automatically usually

---

### ❌ "Domain not working after custom domain setup"
**Cause**: DNS propagation takes time

**Solution**:
1. Wait up to 48 hours for DNS
2. Verify DNS records are correct
3. Use nslookup to check: `nslookup yourdomain.com`
4. Clear browser cache
5. Try another browser

---

## Development & Debugging

### ❌ "Can't see changes when editing code"
**Cause**: Dev server not watching files

**Solution**:
1. Make sure dev server is running
2. Check for syntax errors in file
3. Restart dev server: `npm run dev`
4. Check file was saved: `Ctrl+S`

---

### ❌ "TypeScript errors in editor"
**Cause**: Types not properly imported

**Solution**:
```bash
# Regenerate types
npm run type-check

# Clear cache
rm -rf node_modules/.cache
npm run dev
```

---

### ❌ "Console shows lots of errors"
**Cause**: Various possibilities

**Solution**:
1. Check each error message
2. Google the specific error
3. Check this troubleshooting guide
4. Check GitHub Issues if no solution

---

## Browser-Specific Issues

### Safari (iOS/macOS)

**❌ "Input field zooms page"**
```typescript
// Fix in component
input {
  font-size: 16px; /* Prevents auto-zoom on iOS */
}
```

**❌ "Messages not updating"**
- Try clearing Safari cache
- Disable private browsing
- Update iOS

---

### Chrome
**❌ "WebSocket connection fails"**
- Disable extensions
- Check incognito mode
- Update Chrome

---

### Firefox
**❌ "Animations jittery"**
- Update Firefox
- Check about:config
- Disable extensions

---

## Getting Help

### Where to Look

1. **This Guide**: Read relevant section
2. **Browser Console**: `F12` → Console tab
3. **Network Tab**: `F12` → Network tab
4. **Documentation**: README.md, ARCHITECTURE.md
5. **Code Comments**: Search function names

### Debugging Steps

1. Check console for errors
2. Check network requests
3. Verify environment variables
4. Test with different room ID
5. Test on different device
6. Check Supabase logs
7. Try incognito mode

---

### Emergency Reset

**Clear Everything**:
```bash
# Remove local data
rm -rf .next node_modules

# Reinstall
npm install

# Restart server
npm run dev
```

---

## Still Stuck?

1. ✅ Check all documentation
2. ✅ Google the error message
3. ✅ Try the steps above
4. ✅ Check Supabase logs
5. ✅ Check Vercel logs (if deployed)
6. ✅ Try different browser/device

---

**Most issues are environment variable related or Supabase configuration. Double-check those first!**
