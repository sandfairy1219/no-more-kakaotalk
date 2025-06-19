"use client";
import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat';
import { useRef } from 'react';

export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 추출
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');
    const lastMessageId = url.searchParams.get('lastMessageId');
    
    // roomId가 없는 경우 오류 반환
    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }
    
    const messages = chatService.getMessages(roomId, lastMessageId || undefined);
    const roomInfo = chatService.getRoomInfo(roomId);
    
    // 응답 데이터가 undefined나 null이 아닌지 확인
    const responseData = {
      messages: [] // 실제 데이터로 교체하세요
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    // 오류 로깅
    console.error('메시지 가져오기 오류:', error);
    
    // 오류 응답 항상 유효한 JSON으로 반환
    return new Response(
      JSON.stringify({
        error: '메시지 가져오기 실패',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
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

const pollingRef = useRef<NodeJS.Timeout | null>(null);
