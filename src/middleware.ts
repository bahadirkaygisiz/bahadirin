import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');
    const url = req.nextUrl;

    if (url.pathname.startsWith('/admin')) {
        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const [user, pwd] = atob(authValue).split(':');

            // Simple unified admin password from env or hardcoded fallback
            const validAdminPassword = process.env.ADMIN_PASSWORD || 'admin';

            if (user === 'admin' && pwd === validAdminPassword) {
                return NextResponse.next();
            }
        }

        url.pathname = '/api/basicauth';
        return new NextResponse('Auth required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
            },
        });
    }
}

export const config = {
    matcher: ['/admin/:path*'],
};
