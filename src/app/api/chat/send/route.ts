import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 요청 본문 파싱
    const body = await request.json().catch(() => null);
    
    if (!body || !body.roomId || !body.message) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // ...existing code...
    
    return NextResponse.json({ success: true, messageId: 'new-message-id' }); // 실제 응답으로 교체하세요
  } catch (error) {
    console.error('메시지 전송 오류:', error);
    
    // 항상 유효한 JSON 응답 반환
    return NextResponse.json(
      { error: '메시지 전송 실패', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}