'use client';

import { useParams } from 'next/navigation';
import ChatRoom from '@/components/ChatRoom';

export default function ChatPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  return <ChatRoom roomId={roomId} />;
}
