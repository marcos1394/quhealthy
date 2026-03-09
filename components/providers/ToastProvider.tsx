'use client';

import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { hydrateErrorMessages } from '@/lib/handleApiError';

// Keys we pull from the "Errors" namespace
const ERROR_KEYS = [
    '400', '401', '403', '404', '408', '409', '413', '422', '429',
    '500', '502', '503', 'network', 'timeout', 'unknown',
] as const;

/**
 * ToastProvider — Client component that:
 * 1. Detects dark/light mode for proper toast theming
 * 2. Hydrates the error dictionary with the current locale's translations
 */
export function ToastProvider() {
    const t = useTranslations('Errors');

    // Hydrate the error dictionary on mount + locale change
    useEffect(() => {
        const messages: Record<string, string> = {};
        for (const key of ERROR_KEYS) {
            try {
                messages[key] = t(key);
            } catch {
                // Key might not exist, skip
            }
        }
        hydrateErrorMessages(messages);
    }, [t]);

    // Detect dark mode via the `dark` class on <html>
    const [isDark, setIsDark] = React.useState(false);

    useEffect(() => {
        const html = document.documentElement;

        const check = () => setIsDark(html.classList.contains('dark'));
        check();

        // Listen for class changes (theme toggle)
        const observer = new MutationObserver(check);
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return (
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDark ? 'dark' : 'light'}
            toastStyle={{
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
            }}
        />
    );
}
