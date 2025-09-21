import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { message: 'DELETE method works!' },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'GET method works!' },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }
  );
}