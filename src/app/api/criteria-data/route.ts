
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ calls: [], sdrs: [] }, { status: 200 });
}
