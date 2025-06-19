import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!body || !body.roomId || !body.message) {
      return new Response(
        JSON.stringify({ error: 'roomId and message are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // ...existing code...

    return new Response(
      JSON.stringify({ success: true, messageId: 'new-message-id' }), // 실제 응답으로 교체하세요
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // 오류 로깅
    console.error('메시지 전송 오류:', error);

    // 오류 응답 항상 유효한 JSON으로 반환
    return new Response(
      JSON.stringify({
        error: '메시지 전송 실패',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}