import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body as { password: string };

    if (!password || !validatePassword(password)) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    await setAuthCookie();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
