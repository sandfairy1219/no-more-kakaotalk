import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const lastMessageId = searchParams.get('lastMessageId');
    
    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID required' },
        { status: 400 }
      );
    }
    
    const messages = chatService.getMessages(roomId, lastMessageId || undefined);
    const roomInfo = chatService.getRoomInfo(roomId);
    
    return NextResponse.json({
      success: true,
      messages,
      roomInfo
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { roomId, nickname, content } = await request.json();
    
    const message = chatService.sendMessage(roomId, nickname, content);
    
    return NextResponse.json({
      success: true,
      message
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}