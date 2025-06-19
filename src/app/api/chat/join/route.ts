import { NextRequest, NextResponse } from 'next/server';
// Update the import path below if your chatService is located elsewhere
import { chatService } from '@/lib/chat';

export async function POST(request: NextRequest) {
  try {
    const { roomId, nickname } = await request.json();
    
    const room = chatService.joinRoom(roomId, nickname);
    
    return NextResponse.json({
      success: true,
      messages: room.messages,
      users: room.users
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to join room' },
      { status: 500 }
    );
  }
}
