# 💌 Private Chat App

A beautiful, lightweight private 1-on-1 realtime chat web application. Open a link, instantly start chatting with someone special. No login, no signup, no complications.

## ✨ Features

- **Instant Access**: Share a unique link, start chatting immediately
- **Realtime Messaging**: Messages appear instantly with smooth animations
- **Custom Wallpapers**: Choose from beautiful dark-themed backgrounds
- **Custom Nicknames**: Set your name, stored locally in your browser
- **Typing Indicators**: See when someone is typing
- **Mobile-First Design**: Optimized for all screen sizes
- **Dark Aesthetic**: Cinematic, cozy, intimate visual design
- **No Authentication**: No emails, no passwords, no tracking
- **Framer Motion Animations**: Smooth, premium feel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)

### 1. Setup Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anonymous key from Settings → API

### 2. Environment Setup

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 How It Works

### Creating a Room

1. Click "Create New Chat"
2. A unique room ID is generated (e.g., `moon-river-921`)
3. Share the link with someone special
4. They open the link and start chatting

### Room URLs

```
http://localhost:3000/chat/moon-river-921
http://localhost:3000/chat/catroom-882
```

### Features Guide

#### 📝 Custom Nickname
- Click the ✏️ icon in the header
- Enter your name (max 20 characters)
- Stored in browser localStorage

#### 🎨 Wallpaper
- Click the 🎨 icon in the header
- Choose from 8 beautiful gradients
- Wallpaper persists across sessions

#### ⌨️ Typing Indicator
- Others see "typing..." when you're writing
- Disappears after 3 seconds of inactivity
- Works realtime across all connected users

#### 💬 Messages
- Send with Enter key or send button
- Multi-line support with Shift+Enter
- Emoji support 🎉
- Timestamps in local timezone

## 🏗️ Project Structure

```
chatapp/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   ├── page.tsx                # Home page
│   └── chat/
│       └── [roomId]/
│           └── page.tsx        # Chat room page
├── components/
│   ├── ChatRoom.tsx            # Main chat container
│   ├── ChatHeader.tsx          # Header with info
│   ├── MessageList.tsx         # Messages container
│   ├── MessageBubble.tsx       # Individual message
│   ├── MessageInput.tsx        # Input bar
│   ├── WallpaperPicker.tsx     # Wallpaper modal
│   └── NicknameModal.tsx       # Nickname editor
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── api.ts                  # Database operations
│   ├── storage.ts              # localStorage utilities
│   ├── store.ts                # Zustand state management
│   ├── utils.ts                # Helper functions
│   ├── types.ts                # TypeScript types
│   └── constants.ts            # App constants
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🗄️ Database Schema

### `rooms` Table
```sql
- id (UUID) - Primary key
- room_slug (VARCHAR) - Unique room identifier
- passphrase (VARCHAR, nullable) - Optional room passphrase
- created_at (TIMESTAMP) - Room creation time
- updated_at (TIMESTAMP) - Last updated time
```

### `messages` Table
```sql
- id (UUID) - Primary key
- room_id (UUID) - Foreign key to rooms
- sender_name (VARCHAR) - Name of sender
- content (TEXT) - Message content
- created_at (TIMESTAMP) - Message timestamp
- is_deleted (BOOLEAN) - Soft delete flag
```

## 🎨 Design System

### Colors

- **Dark BG**: `#0f0f0f` - Main background
- **Dark Secondary**: `#1a1a1a` - Secondary elements
- **Dark Tertiary**: `#2a2a2a` - Tertiary elements
- **Accent Red**: `#dc2626` - Primary accent
- **Accent Red Dark**: `#991b1b` - Darker accent

### Animations

- Message appear: Fade + scale up with stagger
- Modal slide: Spring transition from bottom
- Send button: Bounce on hover
- Typing indicator: Pulsing animation

### Typography

- Font: System fonts (San Francisco, Segoe UI, etc.)
- Light weight for headings
- Size: 12px-20px depending on context

## 🔒 Security

- **Message Sanitization**: DOMPurify removes malicious content
- **Input Validation**: All inputs are validated and sanitized
- **RLS Policies**: Supabase Row Level Security ensures data isolation
- **No Sensitive Data**: Passwords not stored, no tracking
- **HTTPS Required**: Recommended for production deployment

## 🌐 Deployment

### Vercel (Frontend)

1. Push repository to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
git push origin main
```

### Supabase (Backend)

Already hosted at supabase.com. Just ensure RLS policies are enabled.

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📦 Built With

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Supabase** - Backend & realtime
- **Zustand** - State management
- **DOMPurify** - Security
- **date-fns** - Date formatting

## 🚀 Performance

- Optimized for mobile networks
- Lazy message loading
- Minimal re-renders
- Smooth animations (60fps)
- ~50KB bundle size (gzipped)

## 🎯 Future Enhancements

- End-to-end encryption
- Self-destruct messages
- Media sharing
- Voice notes
- Read receipts
- Message reactions
- Pin messages

## 📝 Development

### Run tests
```bash
npm run lint
npm run type-check
```

### Build for production
```bash
npm run build
npm start
```

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 💡 Tips

- **Room IDs are unique** but can be shared publicly - no password needed
- **Nicknames are local** - stored only in your browser
- **Messages are realtime** - appear instantly with Supabase subscriptions
- **No data collection** - your chats are private
- **Perfect for**: Close friends, couples, secret conversations, DMs

---

**Made with 💌 for intimate conversations**
