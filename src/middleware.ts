import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const COOKIE_NAME = 'dilinh-user-role';
const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SECRET_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY must be set for HMAC cookie signing');
}

async function getHMACSignature(text: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const textData = encoder.encode(text);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, textData);
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  // 1. Sanitize request headers to prevent header spoofing from clients
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-role');

  // Handle Mock Mode middleware bypass & headers replication
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const mockUserCookie = request.cookies.get('dilinh-mock-user')?.value;
    let userRole = 'customer';
    let userEmail = '';
    
    if (mockUserCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(mockUserCookie));
        userEmail = parsed.email || '';
        userRole = (userEmail.includes('platform@') || userEmail === 'admin@dlmenu.com') ? 'platform_admin' : 'shop_owner';
      } catch (e) {
        console.error('Error parsing mock user cookie in middleware:', e);
      }
    }

    const hasUser = !!mockUserCookie;

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!hasUser) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Protect /platform-admin
    if (request.nextUrl.pathname.startsWith('/platform-admin')) {
      if (!hasUser) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (userRole !== 'platform_admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Set x-user-role header so tRPC procedure knows the role
    requestHeaders.set('x-user-role', userRole);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /platform-admin: requires authenticated user AND role='platform_admin'
  if (request.nextUrl.pathname.startsWith('/platform-admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Try to get role from secure signed cookie cache
    const roleCookie = request.cookies.get(COOKIE_NAME)?.value;
    let userRole: string | null = null;
    let shouldSetCookie = false;

    if (roleCookie) {
      const [roleVal, signature] = roleCookie.split('.');
      if (roleVal && signature) {
        const expectedSig = await getHMACSignature(roleVal, SECRET_KEY!);
        if (signature === expectedSig) {
          userRole = roleVal;
        }
      }
    }

    // Cache miss or invalid signature: query profiles database table
    if (!userRole) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profileError && profile?.role) {
        userRole = profile.role;
        shouldSetCookie = true;
      }
    }

    // Redirect to home if user has no role or is not platform_admin
    if (!userRole || userRole !== 'platform_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Cache hit/retrieved: set x-user-role header and write signed cookie
    requestHeaders.set('x-user-role', userRole);
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    if (shouldSetCookie) {
      const signature = await getHMACSignature(userRole, SECRET_KEY!);
      response.cookies.set(COOKIE_NAME, `${userRole}.${signature}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day cache
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
