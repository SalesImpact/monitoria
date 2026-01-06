import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isAdmin = token?.role === 'admin';

    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/select-organization')) {
      const selectedOrgId = token.selectedOrganizationId;

      // Admins sempre podem acessar a página de seleção
      if (isAdmin && pathname === '/select-organization') {
        return NextResponse.next();
      }

      if (!selectedOrgId && pathname !== '/select-organization') {
        return NextResponse.redirect(new URL('/select-organization', req.url));
      }

      // Não redirecionar admins da página de seleção para o dashboard
      if (selectedOrgId && pathname === '/select-organization' && !isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/select-organization/:path*'],
};

