// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { EmbedCommunicationBridge } from '../engine/EmbedCommunicationBridge';
import type { EmbedMessage } from '../types/embed-widget.types';

describe('EmbedCommunicationBridge', () => {
  let bridge: EmbedCommunicationBridge;

  afterEach(() => {
    bridge?.destroy();
  });

  describe('constructor & listener initialization', () => {
    it('should create bridge with default wildcard origin', () => {
      bridge = new EmbedCommunicationBridge();
      expect(bridge.listenerCount).toBe(0);
    });

    it('should create bridge with custom allowed origins', () => {
      bridge = new EmbedCommunicationBridge(['https://moodle.hust.edu.vn']);
      expect(bridge.listenerCount).toBe(0);
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

      const mockEvent = new MessageEvent('message', {
        origin: 'https://moodle.hust.edu.vn',
        data: {
          source: 'VISUALIZATION_DSA_HOST',
          action: 'STEP_FORWARD',
          payload: { stepIndex: 5 },
        } as EmbedMessage,
      });
      window.dispatchEvent(mockEvent);

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

      const mockEvent = new MessageEvent('message', {
        origin: 'https://any-site.com',
        data: {
          source: 'VISUALIZATION_DSA_WIDGET',
          action: 'WIDGET_READY',
          payload: null,
        } as EmbedMessage,
      });
      window.dispatchEvent(mockEvent);

      expect(spyCallback).toHaveBeenCalledTimes(1);
    });

    it('should deliver WIDGET source messages', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      const mockEvent = new MessageEvent('message', {
        origin: 'https://any-site.com',
        data: {
          source: 'VISUALIZATION_DSA_WIDGET',
          action: 'HEIGHT_CHANGED',
          payload: { height: 600 },
        } as EmbedMessage,
      });
      window.dispatchEvent(mockEvent);

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

      const mockMaliciousEvent = new MessageEvent('message', {
        origin: 'https://malicious-hacker.com',
        data: {
          source: 'VISUALIZATION_DSA_HOST',
          action: 'RESET',
          payload: null,
        } as EmbedMessage,
      });
      window.dispatchEvent(mockMaliciousEvent);

      expect(spyCallback).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('XSS_PREVENTION_BLOCKED'),
      );

      warnSpy.mockRestore();
    });

    it('should block messages from empty origin when whitelist is strict', () => {
      bridge = new EmbedCommunicationBridge(['https://canvas.usth.edu.vn']);
      const spyCallback = vi.fn();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      bridge.onMessage(spyCallback);

      const mockEvent = new MessageEvent('message', {
        origin: '',
        data: {
          source: 'VISUALIZATION_DSA_HOST',
          action: 'STEP_FORWARD',
          payload: null,
        } as EmbedMessage,
      });
      window.dispatchEvent(mockEvent);

      expect(spyCallback).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('message structure filtering', () => {
    it('should ignore messages without valid source field', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      const mockEvent = new MessageEvent('message', {
        origin: 'https://some-site.com',
        data: { action: 'STEP_FORWARD', payload: null },
      });
      window.dispatchEvent(mockEvent);

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should ignore null message data', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      const mockEvent = new MessageEvent('message', {
        origin: 'https://some-site.com',
        data: null,
      });
      window.dispatchEvent(mockEvent);

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should ignore messages from unknown sources', () => {
      bridge = new EmbedCommunicationBridge(['*']);
      const spyCallback = vi.fn();
      bridge.onMessage(spyCallback);

      const mockEvent = new MessageEvent('message', {
        origin: 'https://some-site.com',
        data: { source: 'SOME_OTHER_APP', action: 'CLICK', payload: null },
      });
      window.dispatchEvent(mockEvent);

      expect(spyCallback).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should call postMessage on target window', () => {
      bridge = new EmbedCommunicationBridge();
      const mockWindow = { postMessage: vi.fn() } as unknown as Window;
      const msg: EmbedMessage = {
        source: 'VISUALIZATION_DSA_WIDGET',
        action: 'WIDGET_READY',
        payload: null,
      };

      bridge.sendMessage(mockWindow, msg, 'https://moodle.hust.edu.vn');

      expect(mockWindow.postMessage).toHaveBeenCalledWith(
        msg,
        'https://moodle.hust.edu.vn',
      );
    });

    it('should default to wildcard target origin', () => {
      bridge = new EmbedCommunicationBridge();
      const mockWindow = { postMessage: vi.fn() } as unknown as Window;
      const msg: EmbedMessage = {
        source: 'VISUALIZATION_DSA_WIDGET',
        action: 'HEIGHT_CHANGED',
        payload: { height: 500 },
      };

      bridge.sendMessage(mockWindow, msg);

      expect(mockWindow.postMessage).toHaveBeenCalledWith(msg, '*');
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

      const mockEvent = new MessageEvent('message', {
        origin: 'https://any-site.com',
        data: {
          source: 'VISUALIZATION_DSA_HOST',
          action: 'STEP_FORWARD',
          payload: null,
        } as EmbedMessage,
      });
      window.dispatchEvent(mockEvent);

      expect(spyCallback).not.toHaveBeenCalled();
    });

    it('should handle double destroy gracefully', () => {
      bridge = new EmbedCommunicationBridge();
      bridge.destroy();
      expect(() => bridge.destroy()).not.toThrow();
    });
  });
});
