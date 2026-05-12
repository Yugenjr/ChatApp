-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_slug VARCHAR(255) UNIQUE NOT NULL,
  passphrase VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Create indexes for better performance
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_rooms_room_slug ON rooms(room_slug);

-- Enable realtime for messages table
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE rooms REPLICA IDENTITY FULL;

-- Create RLS (Row Level Security) policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to rooms
CREATE POLICY "Allow public read rooms" ON rooms
  FOR SELECT USING (true);

-- Allow public insert to rooms
CREATE POLICY "Allow public insert rooms" ON rooms
  FOR INSERT WITH CHECK (true);

-- Allow public read messages
CREATE POLICY "Allow public read messages" ON messages
  FOR SELECT USING (true);

-- Allow public insert messages
CREATE POLICY "Allow public insert messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Allow public delete messages (for soft delete)
CREATE POLICY "Allow public update messages" ON messages
  FOR UPDATE USING (true);
