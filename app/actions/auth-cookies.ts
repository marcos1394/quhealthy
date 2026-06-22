'use server';

import { cookies } from 'next/headers';

// eslint-disable-next-line
export async function setAuthCookies(role: string, refreshToken: string) {
    const cookieStore = await cookies();
    
    // Configure secure cookie options
    const cookieOptions = {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    };

    // __Secure-userRole can be read by JS for UI logic
    cookieStore.set('__Secure-userRole', role, { ...cookieOptions, httpOnly: false });
    // refreshToken must be httpOnly to prevent XSS theft
    cookieStore.set('refreshToken', refreshToken, cookieOptions);
}

// eslint-disable-next-line
export async function clearAuthCookies() {
    const cookieStore = await cookies();
    
    cookieStore.delete('__Secure-userRole');
    cookieStore.delete('refreshToken');
}
