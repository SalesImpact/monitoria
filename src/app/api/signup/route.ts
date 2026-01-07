
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role, organizationId, meetimeAccountIds } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Check if user already exists in this organization
    const existingUser = await prisma.user.findUnique({
      where: { 
        email_organizationId: {
          email,
          organizationId
        }
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists in this organization' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with Meetime accounts in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name: fullName || email.split('@')[0],
          password: hashedPassword,
          role: role || 'sdr',
          organizationId,
        },
      });

      // Associate Meetime accounts if provided
      if (meetimeAccountIds && Array.isArray(meetimeAccountIds) && meetimeAccountIds.length > 0) {
        await tx.userMeetimeAccount.createMany({
          data: meetimeAccountIds.map((meetimeUserId: number) => ({
            userId: user.id,
            meetimeUserId: BigInt(meetimeUserId),
          })),
          skipDuplicates: true,
        });
      }

      return user;
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = result;

    return NextResponse.json({ 
      user: userWithoutPassword,
      meetimeAccountsAssociated: meetimeAccountIds?.length || 0
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
