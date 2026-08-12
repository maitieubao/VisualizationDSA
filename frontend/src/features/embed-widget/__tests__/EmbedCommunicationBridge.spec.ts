// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from 'vitest';
import { EmbedCommunicationBridge } from '../engine/EmbedCommunicationBridge';
import type { EmbedMessage } from '../types/embed-widget.types';

function dispatchMessage(origin: string, data: unknown): void {
  window.dispatchEvent(new MessageEvent('message', { origin, data }));
}

function widgetMessage(
  action: EmbedMessage['action'],
  payload: EmbedMessage['payload'] = null,
): EmbedMessage {
  return { source: 'VISUALIZATION_DSA_WIDGET', action, payload };
}

describe('EmbedCommunicationBridge', () => {
  let bridge: EmbedCommunicationBridge;

  afterEach(() => {
    bridge?.destroy();
    vi.restoreAllMocks();
  });

  describe('constructor & listener initialization', () => {
    it('should create bridge with default same-origin allowlist (not wildcard)', () => {
      bridge = new EmbedCommunicationBridge();
      expect(bridge.listenerCount).toBe(0);
    });

    it('should create bridge with custom allowed origins', () => {
      bridge = new EmbedCommunicationBridge(['https://moodle.hust.edu.vn']);
      expect(bridge.listenerCount).toBe(0);
    });

    it('should expose isOriginAllowed for host script verification', () => {
      bridge = new EmbedCommunicationBridge(['https://moodle.hust.edu.vn']);
      expect(bridge.isOriginAllowed('https://moodle.hust.edu.vn')).toBe(true);
      expect(bridge.isOriginAllowed('https://malicious-hacker.com')).toBe(false);
    });
  });

  describe('EW-007 (P1): default allowlist là same-origin thật (dispatch origin lạ)', () => {
    it('should NOT deliver messages from foreign origins with default allowlist', () => {
      bridge = new EmbedCommunicationBridge();
      const spyCallback = vi.fn();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      bridge.onMessage(spyCallback);

      dispatchMessage('https://evil-cdn.example.com', widgetMessage('STEP_FORWARD'));

      expect(spyCallback).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('XSS_PREVENTION_BLOCKED'));
      warnSpy.mockRestore();
    });

    it('should deliver messages from own origin with default allowlist', () => {
      bridge = new EmbedCommunicationBridge();
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage(window.location.origin, widgetMessage('STEP_FORWARD'));

      expect(spyCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('EW-006 (P1): fail-closed — allowedOrigins=[] không bao giờ fail-open', () => {
    it('should reject ALL foreign origins when constructed with empty array', () => {
      bridge = new EmbedCommunicationBridge([]);
      const spyCallback = vi.fn();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      bridge.onMessage(spyCallback);

      dispatchMessage('https://any-site.com', widgetMessage('WIDGET_READY'));
      dispatchMessage('https://another-site.org', widgetMessage('STEP_FORWARD'));

      expect(spyCallback).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should only trust own origin when constructed with empty array', () => {
      bridge = new EmbedCommunicationBridge([]);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage(window.location.origin, widgetMessage('WIDGET_READY'));

      expect(spyCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('onMessage', () => {
    it('should register listener and return unsubscribe function', () => {
      bridge = new EmbedCommunicationBridge();
      const callback = vi.fn();
      const unsubscribe = bridge.onMessage(callback);

      expect(bridge.listenerCount).toBe(1);
      unsubscribe();
      expect(bridge.listenerCount).toBe(0);
    });

    it('should support multiple listeners simultaneously', () => {
      bridge = new EmbedCommunicationBridge();
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      const cb3 = vi.fn();

      bridge.onMessage(cb1);
      bridge.onMessage(cb2);
      bridge.onMessage(cb3);

      expect(bridge.listenerCount).toBe(3);
    });
  });

  describe('message delivery from trusted origins', () => {
    it('should deliver messages from whitelisted origins', () => {
      bridge = new EmbedCommunicationBridge(['https://moodle.hust.edu.vn']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage(
        'https://moodle.hust.edu.vn',
        {
          source: 'VISUALIZATION_DSA_HOST',
          action: 'STEP_FORWARD',
          payload: { stepIndex: 5 },
        } as EmbedMessage,
      );

      expect(spyCallback).toHaveBeenCalledTimes(1);
      expect(spyCallback).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'STEP_FORWARD' }),
        'https://moodle.hust.edu.vn',
      );
    });

    it('should deliver messages when wildcard origin is configured', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://any-site.com', widgetMessage('WIDGET_READY'));

      expect(spyCallback).toHaveBeenCalledTimes(1);
    });

    it('should deliver WIDGET source messages', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage(
        'https://any-site.com',
        widgetMessage('HEIGHT_CHANGED', { height: 600 }),
      );

      expect(spyCallback).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'HEIGHT_CHANGED', payload: { height: 600 } }),
        'https://any-site.com',
      );
    });
  });

  describe('XSS prevention — origin blocking', () => {
    it('should block messages from non-whitelisted origins', () => {
      bridge = new EmbedCommunicationBridge(['https://moodle.hust.edu.vn']);
      const spyCallback = vi.fn();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      bridge.onMessage(spyCallback);

      dispatchMessage(
        'https://malicious-hacker.com',
        { source: 'VISUALIZATION_DSA_HOST', action: 'RESET', payload: null } as EmbedMessage,
      );

      expect(spyCallback).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('XSS_PREVENTION_BLOCKED'));
      warnSpy.mockRestore();
    });

    it('should block messages from empty origin when whitelist is strict', () => {
      bridge = new EmbedCommunicationBridge(['https://canvas.usth.edu.vn']);
      const spyCallback = vi.fn();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      bridge.onMessage(spyCallback);

      dispatchMessage(
        '',
        { source: 'VISUALIZATION_DSA_HOST', action: 'STEP_FORWARD', payload: null } as EmbedMessage,
      );

      expect(spyCallback).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('EW-012t (P2): shape validation fail-closed', () => {
    it('should not dispatch message with unknown action (GARBAGE)', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://any-site.com', {
        source: 'VISUALIZATION_DSA_HOST',
        action: 'GARBAGE',
        payload: null,
      });

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should not dispatch HEIGHT_CHANGED with string height payload', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://any-site.com', {
        source: 'VISUALIZATION_DSA_WIDGET',
        action: 'HEIGHT_CHANGED',
        payload: { height: '600' },
      });

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should not dispatch STEP_FORWARD with string stepIndex payload', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://any-site.com', {
        source: 'VISUALIZATION_DSA_HOST',
        action: 'STEP_FORWARD',
        payload: { stepIndex: '5' },
      });

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should not dispatch empty object data', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://any-site.com', {});

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should not dispatch payload of wrong primitive type (height as object)', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://any-site.com', {
        source: 'VISUALIZATION_DSA_WIDGET',
        action: 'HEIGHT_CHANGED',
        payload: { height: { px: 600 } },
      });

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should still deliver fully valid messages after rejections', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://any-site.com', { source: 'X', action: 'Y', payload: null });
      dispatchMessage(
        'https://any-site.com',
        widgetMessage('HEIGHT_CHANGED', { height: 600 }),
      );

      expect(spyCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('EW-032 (P3): replay, multi-instance, sendMessage fallback', () => {
    it('should deliver each message — replay 2 messages → 2 callbacks', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://any-site.com', widgetMessage('STEP_FORWARD'));
      dispatchMessage('https://any-site.com', widgetMessage('RESET'));

      expect(spyCallback).toHaveBeenCalledTimes(2);
      expect(spyCallback).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ action: 'STEP_FORWARD' }),
        'https://any-site.com',
      );
      expect(spyCallback).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ action: 'RESET' }),
        'https://any-site.com',
      );
    });

    it('should keep instances isolated — destroy one bridge, the other still receives', () => {
      const bridgeA = new EmbedCommunicationBridge(['*']);
      const bridgeB = new EmbedCommunicationBridge(['*']);
      const cbA = vi.fn();
      const cbB = vi.fn();
      bridgeA.onMessage(cbA);
      bridgeB.onMessage(cbB);

      dispatchMessage('https://any-site.com', widgetMessage('STEP_FORWARD'));
      expect(cbA).toHaveBeenCalledTimes(1);
      expect(cbB).toHaveBeenCalledTimes(1);

      bridgeA.destroy();

      dispatchMessage('https://any-site.com', widgetMessage('RESET'));
      expect(cbA).toHaveBeenCalledTimes(1);
      expect(cbB).toHaveBeenCalledTimes(2);
      bridgeB.destroy();
    });

    it('sendMessage without targetOrigin falls back to first whitelisted domain for control actions', () => {
      bridge = new EmbedCommunicationBridge([window.location.origin]);
      const mockWindow = { postMessage: vi.fn() } as unknown as Window;

      bridge.sendMessage(mockWindow, widgetMessage('STEP_FORWARD'));

      expect(mockWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'STEP_FORWARD' }),
        window.location.origin,
      );
    });

    it('sendMessage with empty allowlist falls back to self origin (EW-022 guard)', () => {
      bridge = new EmbedCommunicationBridge([]);
      const mockWindow = { postMessage: vi.fn() } as unknown as Window;

      bridge.sendMessage(mockWindow, widgetMessage('STEP_FORWARD'));

      expect(mockWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'STEP_FORWARD' }),
        window.location.origin,
      );
    });
  });

  describe('EW-001 (P0): sendMessage targetOrigin hướng về host', () => {
    it('should use hostOrigin as default target for WIDGET_READY', () => {
      bridge = new EmbedCommunicationBridge(['*'], 'https://moodle.hust.edu.vn');
      const mockWindow = { postMessage: vi.fn() } as unknown as Window;

      bridge.sendMessage(mockWindow, widgetMessage('WIDGET_READY'));

      expect(mockWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'WIDGET_READY' }),
        'https://moodle.hust.edu.vn',
      );
    });

    it('should default HEIGHT_CHANGED to wildcard when host origin unknown (cross-origin must not be dropped)', () => {
      bridge = new EmbedCommunicationBridge();
      const mockWindow = { postMessage: vi.fn() } as unknown as Window;

      bridge.sendMessage(mockWindow, widgetMessage('HEIGHT_CHANGED', { height: 600 }));

      expect(mockWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'HEIGHT_CHANGED', payload: { height: 600 } }),
        '*',
      );
    });

    it('should call postMessage with explicit targetOrigin when provided', () => {
      bridge = new EmbedCommunicationBridge();
      const mockWindow = { postMessage: vi.fn() } as unknown as Window;

      bridge.sendMessage(
        mockWindow,
        widgetMessage('WIDGET_READY'),
        'https://moodle.hust.edu.vn',
      );

      expect(mockWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'WIDGET_READY' }),
        'https://moodle.hust.edu.vn',
      );
    });
  });

  describe('message structure filtering', () => {
    it('should ignore messages without valid source field', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://some-site.com', { action: 'STEP_FORWARD', payload: null });

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should ignore null message data', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://some-site.com', null);

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should ignore messages from unknown sources', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      dispatchMessage('https://some-site.com', {
        source: 'SOME_OTHER_APP',
        action: 'CLICK',
        payload: null,
      });

      expect(spyCallback).not.toHaveBeenCalled();
    });
  });

  describe('destroy & cleanup', () => {
    it('should clear all listeners on destroy', () => {
      bridge = new EmbedCommunicationBridge();
      bridge.onMessage(vi.fn());
      bridge.onMessage(vi.fn());

      expect(bridge.listenerCount).toBe(2);
      bridge.destroy();
      expect(bridge.listenerCount).toBe(0);
    });

    it('should stop receiving messages after destroy', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);
      bridge.destroy();

      dispatchMessage('https://any-site.com', widgetMessage('STEP_FORWARD'));

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should handle double destroy gracefully', () => {
      bridge = new EmbedCommunicationBridge();
      bridge.destroy();
      expect(() => bridge.destroy()).not.toThrow();
    });
  });
});
