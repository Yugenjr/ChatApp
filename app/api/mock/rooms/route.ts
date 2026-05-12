import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateMockRoomAsync, setRoomWallpaperAsync } from '@/lib/mock-server';

export async function GET(req: NextRequest) {
  const roomSlug = req.nextUrl.searchParams.get('roomSlug');

  if (!roomSlug) {
    return NextResponse.json({ error: 'roomSlug is required' }, { status: 400 });
  }

  return NextResponse.json(await getOrCreateMockRoomAsync(roomSlug));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const roomSlug = body.roomSlug as string | undefined;
  const passphrase = body.passphrase as string | undefined;
  const wallpaper = body.wallpaper as any | undefined;

  if (!roomSlug) {
    return NextResponse.json({ error: 'roomSlug is required' }, { status: 400 });
  }

  if (typeof wallpaper !== 'undefined') {
    return NextResponse.json(await setRoomWallpaperAsync(roomSlug, wallpaper));
  }

  return NextResponse.json(await getOrCreateMockRoomAsync(roomSlug, passphrase));
}
