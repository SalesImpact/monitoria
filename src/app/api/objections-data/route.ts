
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalObjections: 0,
    totalOvercome: 0,
    overcomeRate: 0,
    mostCommon: 'N/A',
    objectionsByType: {},
    objectionOvercomeRate: {},
    objectionsBySdr: [],
  }, { status: 200 });
}
