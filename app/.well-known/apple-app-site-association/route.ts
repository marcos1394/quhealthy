import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const aasa = {
    applinks: {
      apps: [],
      details: [
        {
          appID: '9Q87J44R49.org.quhealthy.app',
          paths: [
            '/patient/appointments/*',
            '/patient/video-call/*',
            '/especialistas/*',
            '/provider/dashboard/*',
          ],
        },
      ],
    },
    webcredentials: {
      apps: ['9Q87J44R49.org.quhealthy.app'],
    },
  };

  return NextResponse.json(aasa, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
