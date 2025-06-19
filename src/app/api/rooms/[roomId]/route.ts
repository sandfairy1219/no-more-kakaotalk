import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  // Simple implementation to test if the type error resolves
  return NextResponse.json({ roomId: params.roomId });
}
