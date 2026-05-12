# Quick Start Guide

Get the chat app running in 5 minutes.

## Frontend-Only Mode

You can run the UI without any Supabase credentials. If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, the app starts in local demo mode using browser storage only.

In demo mode:
- rooms are stored locally in your browser
- messages persist in localStorage
- typing indicators are disabled across tabs
- the full UI still loads and you can test layout, wallpaper, nicknames, and message flow

## Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- Supabase account ([free at supabase.com](https://supabase.com))
- Git (optional)

## Step 1: Get Supabase Credentials (Optional for frontend-only mode)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project
3. Wait for initialization
4. Go to Settings → API
5. Copy:
   - **Project URL**
   - **Anon Key**

## Step 2: Setup Database (1 min)

1. In Supabase, go to SQL Editor
2. Click New Query
3. Paste this:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_slug VARCHAR(255) UNIQUE NOT NULL,
  passphrase VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_rooms_room_slug ON rooms(room_slug);

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE rooms REPLICA IDENTITY FULL;

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update messages" ON messages FOR UPDATE USING (true);
```

4. Click Run
5. Go to Realtime → Enable for both tables

## Step 3: Setup Project (1 min)

```bash
# 1. Clone or download project
cd chatapp

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.local.example .env.local

# 4. Add your Supabase credentials to .env.local
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

## Step 4: Run (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test It

1. Click "Create New Chat"
2. Copy the link
3. Open in another tab/browser
4. Send a message
5. Watch it appear in real-time! ✨

## Deploy to Vercel (Optional, 2 min)

```bash
npm install -g vercel
vercel
# Follow prompts
# Add environment variables
# Done!
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"

```bash
npm install @supabase/supabase-js
npm run dev
```

### Messages not appearing

1. Check Supabase Realtime is enabled
2. Check `.env.local` has correct credentials
3. Check browser console for errors
4. Try refreshing page

### "Syntax error in SQL"

Make sure you ran the complete SQL schema. Check Supabase SQL Editor for errors.

### Port 3000 already in use

```bash
npm run dev -- -p 3001
```

## Next Steps

- ✅ Customize wallpapers in `lib/constants.ts`
- ✅ Change colors in `tailwind.config.js`
- ✅ Add more animations in components
- ✅ Deploy to production with Vercel
- ✅ Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand code structure

## File Structure Quick Reference

```
chatapp/
├── app/                    # Next.js pages
│   ├── page.tsx           # Home page
│   ├── chat/[roomId]      # Chat room
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ChatRoom.tsx       # Main container
│   ├── ChatHeader.tsx     # Top bar
│   ├── MessageList.tsx    # Messages
│   ├── MessageBubble.tsx  # Individual message
│   ├── MessageInput.tsx   # Input box
│   ├── WallpaperPicker.tsx # Wallpaper modal
│   └── NicknameModal.tsx  # Name modal
├── lib/                   # Utilities
│   ├── api.ts            # Database operations
│   ├── supabase.ts       # Supabase client
│   ├── storage.ts        # localStorage
│   ├── store.ts          # Zustand state
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Helpers
│   └── constants.ts      # App constants
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind config
└── .env.local.example    # Environment template
```

## Common Customizations

### Change App Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  'accent-red': '#your-color',
  // More colors...
}
```

### Add More Wallpapers

Edit `lib/constants.ts`:
```typescript
export const WALLPAPERS = [
  {
    id: 'my-wallpaper',
    name: 'My Wallpaper',
    type: 'gradient',
    value: 'bg-gradient-to-br from-color1 to-color2'
  }
  // More wallpapers...
]
```

### Change Welcome Message

Edit `app/page.tsx` home page text.

### Modify Animations

Edit component files and adjust Framer Motion configs:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

## Performance Tips

- Messages load in batches of 50
- Typing indicator auto-hides after 3 seconds
- Auto-sanitization prevents XSS
- CSS animations use GPU acceleration
- Optimized for mobile networks

## Support

- **Docs**: See README.md, ARCHITECTURE.md, API_REFERENCE.md
- **Issues**: Check browser console for errors
- **Debug**: Enable Redux DevTools (Zustand works with it)

## What's Next?

1. ✅ Share the link with someone
2. ✅ Start chatting!
3. ✅ Customize colors and wallpapers
4. ✅ Deploy to production
5. ✅ Add features (see Architecture docs)

---

**Happy chatting! 💌**
