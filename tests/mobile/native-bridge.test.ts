import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axiosInstance from '@/lib/axios';
import { nativeBridge } from '@/lib/mobile/native-bridge';

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('ENG-IOS-02: Native Mobile Bridge (WKWebView, Push & WebRTC)', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    vi.clearAllMocks();
    delete (window as any).Capacitor;
    delete (window as any).webkit;
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
  });

  describe('isNativeApp & getPlatform', () => {
    it('detects standard web browser environment', () => {
      expect(nativeBridge.isNativeApp()).toBe(false);
      expect(nativeBridge.getPlatform()).toBe('web');
    });

    it('detects Capacitor native platform', () => {
      (window as any).Capacitor = {
        isNativePlatform: () => true,
        getPlatform: () => 'ios',
      };

      expect(nativeBridge.isNativeApp()).toBe(true);
      expect(nativeBridge.getPlatform()).toBe('ios');
    });

    it('detects iOS WKWebView container via webkit.messageHandlers', () => {
      (window as any).webkit = {
        messageHandlers: {
          pushHandler: { postMessage: vi.fn() },
        },
      };
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true,
      });

      expect(nativeBridge.isNativeApp()).toBe(true);
      expect(nativeBridge.getPlatform()).toBe('ios');
    });

    it('detects Android container via User-Agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) quhealthy-android/1.4.0',
        configurable: true,
      });

      expect(nativeBridge.isNativeApp()).toBe(true);
      expect(nativeBridge.getPlatform()).toBe('android');
    });
  });

  describe('requestMediaPermissions (LiveKit WebRTC)', () => {
    it('requests media permissions and stops tracks upon success', async () => {
      const mockStop = vi.fn();
      const mockStream = {
        getTracks: () => [{ stop: mockStop }, { stop: mockStop }],
      };

      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: vi.fn().mockResolvedValue(mockStream),
        },
        configurable: true,
      });

      const res = await nativeBridge.requestMediaPermissions();

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: true,
        audio: true,
      });
      expect(mockStop).toHaveBeenCalledTimes(2);
      expect(res.camera).toBe(true);
      expect(res.microphone).toBe(true);
    });

    it('handles permission rejection gracefully', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
        configurable: true,
      });

      const res = await nativeBridge.requestMediaPermissions();

      expect(res.camera).toBe(false);
      expect(res.microphone).toBe(false);
      expect(res.error).toBe('Permission denied');
    });
  });

  describe('registerPushDevice', () => {
    it('posts device token to /api/notifications/devices', async () => {
      (axiosInstance.post as any).mockResolvedValue({ data: { registered: true } });

      const success = await nativeBridge.registerPushDevice({
        userId: 10,
        deviceToken: 'apns-test-token-xyz-123',
        platform: 'ios',
        appVersion: '1.4.0',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('/api/notifications/devices', {
        userId: 10,
        deviceToken: 'apns-test-token-xyz-123',
        platform: 'ios',
        appVersion: '1.4.0',
      });
      expect(success).toBe(true);
    });
  });

  describe('parseDeepLink', () => {
    it('parses custom scheme quhealthy:// deep link', () => {
      const parsed = nativeBridge.parseDeepLink(
        'quhealthy://telemedicine/room/456?role=patient&token=livekit-abc'
      );

      expect(parsed).not.toBeNull();
      expect(parsed?.route).toBe('/telemedicine/room/456');
      expect(parsed?.params.role).toBe('patient');
      expect(parsed?.params.token).toBe('livekit-abc');
    });

    it('parses universal link https://www.quhealthy.org', () => {
      const parsed = nativeBridge.parseDeepLink(
        'https://www.quhealthy.org/es/market/item/60-cartucho-ta-30mm'
      );

      expect(parsed).not.toBeNull();
      expect(parsed?.route).toBe('/es/market/item/60-cartucho-ta-30mm');
    });

    it('returns null for invalid URLs', () => {
      expect(nativeBridge.parseDeepLink('')).toBeNull();
      expect(nativeBridge.parseDeepLink('not-a-valid-url')).toBeNull();
    });
  });
});
