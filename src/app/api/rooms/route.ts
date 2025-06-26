import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat';

export async function POST(request: NextRequest) {
  try {
    const { roomId, creatorNickname } = await request.json();

    if (!roomId || !creatorNickname) {
      return NextResponse.json(
        { success: false, error: 'roomId and creatorNickname are required' },
        { status: 400 }
      );
    }

    // 방 ID 형식 검증 (예: 6자리 영문+숫자)
    const roomIdRegex = /^[A-Z0-9]{6}$/;
    if (!roomIdRegex.test(roomId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid room ID format. Must be 6 characters (A-Z, 0-9)' },
        { status: 400 }
      );
    }

    const result = chatService.createRoom(roomId, creatorNickname);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Room created successfully',
        roomId
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error('Failed to create room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'roomId is required' },
        { status: 400 }
      );
    }

    const exists = chatService.roomExists(roomId);
    const roomInfo = chatService.getRoomInfo(roomId);

    return NextResponse.json({
      success: true,
      exists,
      roomInfo
    });
  } catch (error) {
    console.error('Failed to check room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check room' },
      { status: 500 }
    );
  }
}
