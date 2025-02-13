import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie';
import { verifyJWT } from '@shared/utils/parse-jwt/parseJwt';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 200 });
    }

    const payload = await verifyJWT<{ uuid: string; sessionVersion: number }>(
      accessToken,
      authConfig.accessToken.secret,
    );

    if (!payload.sessionVersion || typeof payload.sessionVersion !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 200 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { uuid: payload.uuid as string },
      select: {
        uuid: true,
        email: true,
        role: true,
        isBlocked: true,
        lastActive: true,
        sessionVersion: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 200 });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account is temporarily locked. Contact support.',
        },
        { status: 200 },
      );
    }

    if (user.sessionVersion !== payload.sessionVersion) {
      return NextResponse.json(
        {
          success: false,
          message: 'Session version mismatch. Please re-login.',
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        uuid: user.uuid,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        lastActive: user.lastActive,
      },
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid session. Please re-authenticate.',
      },
      { status: 200 },
    );
  }
}
