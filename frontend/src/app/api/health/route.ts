import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  }, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

export async function POST() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'POST request received'
  }, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}