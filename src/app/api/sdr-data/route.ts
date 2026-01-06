
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ sdrs: [] }, { status: 200 });
}
