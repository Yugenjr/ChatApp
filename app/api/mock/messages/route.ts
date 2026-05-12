import { NextRequest, NextResponse } from 'next/server';
import { deleteMockMessageAsync, getMockMessagesAsync, sendMockMessageAsync } from '@/lib/mock-server';

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId');
  const limit = Number(req.nextUrl.searchParams.get('limit') || '50');

  if (!roomId) {
    return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
  }

  return NextResponse.json(await getMockMessagesAsync(roomId, Number.isFinite(limit) ? limit : 50));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const roomId = body.roomId as string | undefined;
  const senderName = body.senderName as string | undefined;
  const content = body.content as string | undefined;

  if (!roomId || !senderName || !content) {
    return NextResponse.json({ error: 'roomId, senderName and content are required' }, { status: 400 });
  }

  return NextResponse.json(await sendMockMessageAsync(roomId, senderName, content));
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const messageId = body.messageId as string | undefined;

  if (!messageId) {
    return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
  }

  await deleteMockMessageAsync(messageId);
  return NextResponse.json({ ok: true });
}
