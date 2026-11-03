import { proxy, config as proxyConfig } from './proxy';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = proxyConfig;
