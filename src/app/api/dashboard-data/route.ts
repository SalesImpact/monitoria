
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    calls: [],
    sdrs: [],
    callsWithScores: [],
    stats: {
      totalCalls: 0,
      avgScore: 0,
      successRate: 0,
    },
  }, { status: 200 });
}
