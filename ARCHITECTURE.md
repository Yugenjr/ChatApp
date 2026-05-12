# Architecture & Development Guide

## System Architecture

### Tech Stack Overview

```
┌─────────────────────────────────────────┐
│         Frontend (Vercel)               │
│  ┌─────────────────────────────────┐   │
│  │  Next.js 14 App Router          │   │
│  │  React 18 Components            │   │
│  │  TypeScript                     │   │
│  │  Tailwind CSS + Framer Motion   │   │
│  └─────────────────────────────────┘   │
└────────────────┬────────────────────────┘
                 │ HTTPS API Calls
┌────────────────▼────────────────────────┐
│         Backend (Supabase)              │
│  ┌─────────────────────────────────┐   │
│  │  PostgreSQL Database            │   │
│  │  Realtime Subscriptions         │   │
│  │  Row Level Security (RLS)       │   │
│  │  REST API                       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Data Flow

### Room Creation Flow

```
User opens /chat/room-id
    ↓
Try to fetch room from DB
    ↓
Does room exist?
├─ YES → Load existing room
└─ NO → Create new room with auto-generated ID
    ↓
Subscribe to realtime messages
    ↓
Load message history
    ↓
Load stored nickname from localStorage
    ↓
Render chat interface
```

### Message Flow

```
User types message
    ↓
Send message event triggered
    ↓
Sanitize message content (DOMPurify)
    ↓
Insert into messages table
    ↓
Supabase triggers realtime broadcast
    ↓
All connected clients receive new message
    ↓
Message appears with animation
```

### Typing Indicator Flow

```
User starts typing
    ↓
Send "typing: true" broadcast
    ↓
Other clients receive broadcast
    ↓
Show "typing..." indicator
    ↓
Auto-hide after 3 seconds of inactivity
    ↓
Send "typing: false" broadcast
```

## Component Architecture

### Component Hierarchy

```
RootLayout (app/layout.tsx)
└── Home Page (app/page.tsx)
    ├── Home: Create/Join UI
    └── ChatRoom (components/ChatRoom.tsx)
        ├── ChatHeader
        │   ├── Nickname display
        │   ├── Edit button
        │   └── Wallpaper button
        ├── MessageList
        │   └── MessageBubble (repeated)
        │       ├── Sender name
        │       ├── Message content
        │       └── Timestamp
        ├── MessageInput
        │   ├── Textarea (auto-expanding)
        │   └── Send button
        ├── WallpaperPicker (Modal)
        │   └── Wallpaper grid
        └── NicknameModal (Modal)
            └── Input field
```

### Component Responsibilities

| Component | Purpose |
|-----------|---------|
| `ChatRoom` | Main container, state management, subscriptions |
| `ChatHeader` | Display room info, buttons for nickname/wallpaper |
| `MessageList` | Render all messages with animations |
| `MessageBubble` | Individual message display with styling |
| `MessageInput` | Handle text input, send functionality |
| `WallpaperPicker` | Modal to choose wallpapers |
| `NicknameModal` | Modal to set/edit nickname |

## State Management

### Global State (Zustand Store)

```typescript
useChatStore {
  nickname: string
  typingUsers: TypingUser[]
  setNickname()
  addTypingUser()
  removeTypingUser()
}
```

### Local State

- Messages: Component state in ChatRoom
- UI modals: useState for picker/modal visibility
- Wallpaper: Component state in ChatRoom
- Current input: useState in MessageInput

### Persistent State (localStorage)

- Nickname per room
- Wallpaper per room
- Room preferences

## Database Operations

### API Functions (`lib/api.ts`)

```
getRoomOrCreate(roomSlug)
  → Get existing or create new room

getMessages(roomId, limit)
  → Fetch message history

sendMessage(roomId, senderName, content)
  → Insert new message

deleteMessage(messageId)
  → Soft delete message

subscribeToMessages(roomId, callback)
  → Real-time message subscription

subscribeToTyping(roomId, callback)
  → Real-time typing broadcast

broadcastTyping(roomId, userName, isTyping)
  → Send typing indicator
```

## Performance Optimizations

### Current Optimizations

1. **Message Pagination**: Load latest 50 messages (configurable)
2. **Lazy Animations**: Staggered message animations reduce reflow
3. **Zustand Store**: Minimal re-renders with selective subscriptions
4. **CSS-in-JS**: Tailwind reduces CSS parsing
5. **Image Optimization**: No images in default setup
6. **Viewport Meta**: Prevents auto-zoom on mobile

### Potential Future Optimizations

1. **Virtual Scrolling**: For 1000+ messages
2. **Message Archiving**: Move old messages to cold storage
3. **Service Workers**: Offline support
4. **Code Splitting**: Split components for faster initial load
5. **Image Caching**: If media sharing added

## Security Measures

### Input Validation

```typescript
// Sanitize all user input
const sanitized = sanitizeInput(userInput)
// Result: Removes HTML/JS, keeps text only
```

### Database Security

```sql
-- RLS Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY
CREATE POLICY "Allow public read rooms" ON rooms FOR SELECT USING (true)

-- Messages are also public but could be scoped
CREATE POLICY "Allow room members to see messages" ON messages
  FOR SELECT USING (room_id = current_setting('app.current_room_id'))
```

### No Sensitive Data

- ✅ No passwords stored
- ✅ No auth tokens in localStorage
- ✅ No personally identifiable info required
- ✅ Messages not encrypted (future enhancement)

## Scalability Considerations

### Supabase Limits (Free Tier)

- Storage: 1GB
- Realtime connections: Unlimited
- Database rows: ~1M typical
- Messages per room: ~50k before pagination needed

### Optimizations for Scale

1. **Add Message Pagination**: Implement cursor-based pagination
2. **Archive Old Messages**: Move to separate table after 30 days
3. **Index Optimization**: Already added in schema
4. **Connection Pooling**: Enabled in Supabase
5. **Upgrade Plan**: Pro tier supports more connections/storage

## Development Workflow

### Setup

```bash
npm install
cp .env.local.example .env.local
# Add Supabase credentials to .env.local
npm run dev
```

### Adding Features

1. **UI Component**: Create in `components/`
2. **Types**: Add to `lib/types.ts`
3. **API Call**: Add to `lib/api.ts`
4. **State**: Update `lib/store.ts` if global
5. **Testing**: Test locally with `npm run dev`

### Code Standards

- **TypeScript**: All code typed
- **Component Patterns**: Functional components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for complex functions
- **Formatting**: Prettier auto-formats on save

### Debugging

```typescript
// Enable Supabase debugging
const { data, error } = await supabase.from('table').select()
if (error) console.error('DB Error:', error)

// React DevTools: Check state
// Browser DevTools: Check network/storage
// Vercel Analytics: Monitor performance
```

## Deployment Pipeline

```
Local Development
    ↓ git push
GitHub Repository
    ↓ webhook
Vercel Build
    ↓ build success
Deploy to CDN
    ↓
Production Live (vercel.app)
```

### Environment Variables Flow

```
.env.local (local)
    ↓
GitHub (encrypted secrets)
    ↓
Vercel (secure environment)
    ↓
Build process (injected at build time)
    ↓
Production code
```

## Monitoring & Logging

### Vercel Analytics

- Build time
- Page load time
- Runtime errors
- Deployment status

### Supabase Logs

- Database errors
- RLS policy violations
- Realtime connection issues

### Browser Console

- Client-side errors
- WebSocket connection status
- Message send/receive logs

## Testing Checklist

### Manual Testing

- [ ] Create new room
- [ ] Send message
- [ ] Receive message in real-time
- [ ] Type indicator appears/disappears
- [ ] Edit nickname
- [ ] Change wallpaper
- [ ] Desktop responsive
- [ ] Mobile responsive
- [ ] Emoji support
- [ ] Multi-line messages

### Performance Testing

- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90
- [ ] Mobile performance score > 80

## Future Architecture Improvements

1. **End-to-End Encryption**: Add encryption layer before DB
2. **Message Reactions**: New reactions table
3. **Media Sharing**: Firebase Cloud Storage integration
4. **Voice Notes**: Audio encoding/storage
5. **Read Receipts**: Track message reads
6. **Message Search**: Full-text search on PostgreSQL

---

**This architecture prioritizes simplicity, performance, and user experience over enterprise scalability.**
