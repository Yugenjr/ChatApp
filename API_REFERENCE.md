# API & Feature Reference

## API Reference

### Database API (`lib/api.ts`)

#### getRoomOrCreate()

```typescript
async function getRoomOrCreate(
  roomSlug: string,
  passphrase?: string
): Promise<Room>
```

**Purpose**: Get existing room or create new one if doesn't exist

**Parameters**:
- `roomSlug` (string): Unique room identifier (e.g., "moon-river-921")
- `passphrase` (string, optional): Optional room passphrase

**Returns**: Room object

**Example**:
```typescript
const room = await getRoomOrCreate('moon-river-921')
// Returns: { id: uuid, room_slug: 'moon-river-921', created_at: '...', ... }
```

**Error Handling**:
```typescript
try {
  const room = await getRoomOrCreate(roomId)
} catch (err) {
  console.error('Failed to create room:', err)
}
```

---

#### getMessages()

```typescript
async function getMessages(
  roomId: string,
  limit?: number
): Promise<Message[]>
```

**Purpose**: Fetch message history for a room

**Parameters**:
- `roomId` (string): UUID of the room
- `limit` (number, default: 50): Maximum messages to fetch

**Returns**: Array of Message objects

**Example**:
```typescript
const messages = await getMessages(roomId, 100)
// Returns: [
//   { id: uuid, room_id: uuid, sender_name: 'Alice', content: 'Hi!', ... },
//   { id: uuid, room_id: uuid, sender_name: 'Bob', content: 'Hello!', ... }
// ]
```

---

#### sendMessage()

```typescript
async function sendMessage(
  roomId: string,
  senderName: string,
  content: string
): Promise<Message>
```

**Purpose**: Send a message to a room

**Parameters**:
- `roomId` (string): UUID of the room
- `senderName` (string): Name of sender
- `content` (string): Message content (auto-sanitized)

**Returns**: The created Message object

**Example**:
```typescript
const message = await sendMessage(roomId, 'Alice', 'Hello!')
// Returns: {
//   id: uuid,
//   room_id: roomId,
//   sender_name: 'Alice',
//   content: 'Hello!',
//   created_at: '2024-05-12T...',
//   is_deleted: false
// }
```

**Auto-Sanitization**:
```typescript
// Input: '<script>alert("xss")</script>'
// Stored: ''
// XSS attacks are prevented by DOMPurify
```

---

#### deleteMessage()

```typescript
async function deleteMessage(
  messageId: string,
  deleteForAll?: boolean
): Promise<void>
```

**Purpose**: Delete a message (soft delete)

**Parameters**:
- `messageId` (string): UUID of message to delete
- `deleteForAll` (boolean): Currently not used, for future enhancement

**Returns**: void

**Example**:
```typescript
await deleteMessage(messageId)
// Message is marked as is_deleted: true
// Display shows: "message deleted"
```

---

#### subscribeToMessages()

```typescript
function subscribeToMessages(
  roomId: string,
  callback: (message: Message) => void
): RealtimeChannel
```

**Purpose**: Subscribe to real-time message updates

**Parameters**:
- `roomId` (string): UUID of room
- `callback` (function): Called when new message arrives

**Returns**: RealtimeChannel (for unsubscription)

**Example**:
```typescript
const subscription = subscribeToMessages(roomId, (newMessage) => {
  console.log('New message:', newMessage)
  setMessages(prev => [...prev, newMessage])
})

// Later: unsubscribe
subscription.unsubscribe()
```

---

#### subscribeToTyping()

```typescript
function subscribeToTyping(
  roomId: string,
  callback: (data: { event: string; data: any }) => void
): RealtimeChannel
```

**Purpose**: Subscribe to typing indicators

**Parameters**:
- `roomId` (string): UUID of room
- `callback` (function): Called when someone types

**Returns**: RealtimeChannel

**Example**:
```typescript
subscribeToTyping(roomId, (data) => {
  console.log(data.data.userName, 'is typing:', data.data.isTyping)
  if (data.data.isTyping) {
    setTypingUser(data.data.userName)
  }
})
```

---

#### broadcastTyping()

```typescript
async function broadcastTyping(
  roomId: string,
  userName: string,
  isTyping: boolean
): Promise<void>
```

**Purpose**: Broadcast typing status to other users

**Parameters**:
- `roomId` (string): UUID of room
- `userName` (string): Your name
- `isTyping` (boolean): Whether you're typing

**Returns**: void

**Example**:
```typescript
// When user starts typing
await broadcastTyping(roomId, 'Alice', true)

// After 1.5 seconds of inactivity
await broadcastTyping(roomId, 'Alice', false)
```

---

## Utility Functions

### Storage (`lib/storage.ts`)

#### storage.nickname

```typescript
storage.nickname.get(roomId: string): string
storage.nickname.set(roomId: string, nickname: string): void
storage.nickname.remove(roomId: string): void
```

**Example**:
```typescript
// Get
const nick = storage.nickname.get(roomId) // "Alice"

// Set
storage.nickname.set(roomId, "Alice")

// Remove
storage.nickname.remove(roomId)
```

---

#### storage.wallpaper

```typescript
storage.wallpaper.get(roomId: string): WallpaperOption | null
storage.wallpaper.set(roomId: string, wallpaper: WallpaperOption): void
storage.wallpaper.remove(roomId: string): void
```

**Example**:
```typescript
const wallpaper = storage.wallpaper.get(roomId)
// {
//   id: 'cosmic',
//   name: 'Cosmic',
//   type: 'gradient',
//   value: 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'
// }
```

---

### Sanitization (`lib/utils.ts`)

```typescript
sanitizeInput(text: string): string
```

**Purpose**: Remove HTML/JS from user input

**Example**:
```typescript
sanitizeInput('<script>alert("xss")</script>')
// Returns: ''

sanitizeInput('Hello <b>world</b>')
// Returns: 'Hello world'

sanitizeInput('Safe text 😊')
// Returns: 'Safe text 😊'
```

---

## Component Props

### ChatRoom

```typescript
interface ChatRoomProps {
  roomId: string
}
```

---

### ChatHeader

```typescript
interface ChatHeaderProps {
  nickname: string
  onEditNickname: () => void
  onWallpaperClick: () => void
  typingUser: string | null
}
```

---

### MessageBubble

```typescript
interface MessageBubbleProps {
  message: Message
  isOwn: boolean  // Is this user's message?
}
```

---

### MessageInput

```typescript
interface MessageInputProps {
  onSendMessage: (content: string) => void
  onTyping: (isTyping: boolean) => void
}
```

---

### WallpaperPicker

```typescript
interface WallpaperPickerProps {
  currentWallpaper: WallpaperOption | null
  onSelect: (wallpaper: WallpaperOption) => void
  onClose: () => void
}
```

---

### NicknameModal

```typescript
interface NicknameModalProps {
  currentNickname: string
  onSave: (nickname: string) => void
  onClose: () => void
}
```

---

## State Management (Zustand)

### useChatStore

```typescript
interface ChatStore {
  nickname: string
  setNickname: (nickname: string) => void
  typingUsers: TypingUser[]
  addTypingUser: (user: TypingUser) => void
  removeTypingUser: (name: string) => void
  clearTypingUsers: () => void
}
```

**Usage**:
```typescript
import { useChatStore } from '@/lib/store'

export default function Component() {
  const { nickname, setNickname } = useChatStore()
  
  return <div>{nickname}</div>
}
```

---

## Database Types

### Room

```typescript
interface Room {
  id: string              // UUID
  room_slug: string       // Unique identifier (e.g., 'moon-river-921')
  passphrase: string | null // Optional room passphrase
  created_at: string      // ISO timestamp
}
```

---

### Message

```typescript
interface Message {
  id: string              // UUID
  room_id: string         // Foreign key to rooms
  sender_name: string     // Display name of sender
  content: string         // Message text (sanitized)
  created_at: string      // ISO timestamp
  is_deleted: boolean     // Soft delete flag
}
```

---

### WallpaperOption

```typescript
interface WallpaperOption {
  id: string              // Unique wallpaper ID
  name: string            // Display name (e.g., 'Cosmic')
  type: 'gradient' | 'image' | 'dark'
  value: string           // Tailwind class (e.g., 'bg-gradient-to-br...')
  thumbnail?: string      // Color for preview
}
```

---

## Hooks & Patterns

### Using Real-time Subscriptions

```typescript
useEffect(() => {
  const subscription = subscribeToMessages(roomId, (newMessage) => {
    setMessages(prev => [...prev, newMessage])
  })

  return () => subscription.unsubscribe()
}, [roomId])
```

### Handling Typing Indicators

```typescript
const typingTimeoutRef = useRef<NodeJS.Timeout>()

useEffect(() => {
  subscribeToTyping(roomId, (data) => {
    setTypingUser(data.data.userName)
    
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUser(null)
    }, 3000)
  })
}, [roomId])
```

### Auto-expand Textarea

```typescript
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = 
      Math.min(textareaRef.current.scrollHeight, 120) + 'px'
  }
}, [message])
```

---

## Error Handling

### Database Errors

```typescript
try {
  await sendMessage(roomId, name, content)
} catch (error) {
  console.error('Error sending message:', error)
  setError('Failed to send message')
  // Show user-friendly error message
}
```

### Network Errors

Handled automatically by Supabase client. Retries up to 3 times.

### Validation Errors

```typescript
if (!message.trim()) {
  setError('Message cannot be empty')
  return
}
```

---

## Performance Tips

1. **Message Pagination**: Load in batches of 50, not all at once
2. **Memoization**: Wrap expensive components with `React.memo()`
3. **Debouncing**: Typing indicator broadcast is naturally debounced
4. **Lazy Loading**: Consider virtualization for 1000+ messages
5. **Optimize Re-renders**: Use Zustand selectors, not entire store

---

## Security Checklist

- ✅ Input sanitization with DOMPurify
- ✅ RLS policies on database
- ✅ HTTPS-only communication
- ✅ No sensitive data in localStorage
- ✅ No tokens in client code
- ✅ XSS prevention built-in

---

**For more examples, check the component source files!**
