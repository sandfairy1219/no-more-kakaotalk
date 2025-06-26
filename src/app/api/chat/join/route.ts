import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat';

export async function POST(request: NextRequest) {
  try {
    const { roomId, nickname } = await request.json();
    
    if (!roomId || !nickname) {
      return NextResponse.json(
        { success: false, error: 'roomId and nickname are required' },
        { status: 400 }
      );
    }

    // 방이 존재하는지 확인
    if (!chatService.roomExists(roomId)) {
      return NextResponse.json(
        { success: false, error: 'Room does not exist. Please check the room ID.' },
        { status: 404 }
      );
    }
    
    const room = chatService.joinRoom(roomId, nickname);
    
    return NextResponse.json({
      success: true,
      messages: room.messages,
      users: room.users
    });
  } catch (error) {
    console.error('Failed to join room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join room' },
      { status: 500 }
    );
  }
}
