# ⚙️ Technical Specification - Design Patterns & Observer Simulator (Sprint 9)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình mô phỏng mẫu thiết kế **ObserverPatternSimulator** phát xung tín hiệu hoạt ảnh đường nối Bezier nét đứt Neon trong Sprint 9.

---

## 1. Trình Mô Phỏng Mẫu Thiết Kế Observer (ObserverPatternSimulator TS)

Lớp hạt nhân chịu trách nhiệm đăng ký, hủy đăng ký người quan sát (Observer) và truyền phát tin đa phương thức Client-side dưới 2ms:

```typescript
export interface Observer {
  id: string;
  update(data: string): void;
}

export interface MessageEvent {
  senderId: string;
  receiverId: string;
  data: string;
  timestamp: number;
}

export class ObserverPatternSimulator {
  private observers: Map<string, Observer> = new Map();
  private subjectState = '';
  private eventLogs: MessageEvent[] = [];
  private onNotifyCallback: (event: MessageEvent) => void;

  constructor(onNotify: (event: MessageEvent) => void) {
    this.onNotifyCallback = onNotify;
  }

  /**
   * Đăng ký người quan sát mới (Attach Observer)
   */
  public attach(observer: Observer): void {
    this.observers.set(observer.id, observer);
  }

  /**
   * Hủy đăng ký người quan sát (Detach Observer)
   */
  public detach(observerId: string): void {
    this.observers.delete(observerId);
  }

  /**
   * Cập nhật trạng thái Chủ thể và tự động truyền phát tin (Notify Observers)
   */
  public updateState(newState: string): void {
    this.subjectState = newState;
    this.notify();
  }

  private notify(): void {
    const timestamp = performance.now();

    this.observers.forEach(observer => {
      // 1. Thực thi hàm update của từng observer
      observer.update(this.subjectState);

      // 2. Sinh sự kiện truyền phát tin làm dữ liệu hoạt ảnh (Emit Message Event)
      const event: MessageEvent = {
        senderId: 'SUBJECT',
        receiverId: observer.id,
        data: this.subjectState,
        timestamp
      };

      this.eventLogs.push(event);

      // 3. Kích hoạt Callback để Canvas/SVG bắn hạt Neon dọc đường nối Bezier
      this.onNotifyCallback(event);
    });
  }

  public getObserversCount(): number {
    return this.observers.size;
  }

  public getEventLogs(): MessageEvent[] {
    return this.eventLogs;
  }
}
```

---

## 2. Ca Kiểm Thử Tự Động Mẫu Thiết Kế Observer (Unit Test Specs)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ObserverPatternSimulator, Observer, MessageEvent } from './ObserverPatternSimulator';

class ConcreteObserver implements Observer {
  public receivedData = '';
  constructor(public id: string) {}

  public update(data: string): void {
    this.receivedData = data;
  }
}

describe('Sprint 9 Observer Design Pattern Unit Tests', () => {
  let simulator: ObserverPatternSimulator;
  let triggeredEvents: MessageEvent[];

  beforeEach(() => {
    triggeredEvents = [];
    simulator = new ObserverPatternSimulator((ev) => {
      triggeredEvents.push(ev);
    });
  });

  it('Should attach observers and dynamically broadcast status changes correctly', () => {
    const obs1 = new ConcreteObserver('OBS_1');
    const obs2 = new ConcreteObserver('OBS_2');

    // Đăng ký 2 Observer
    simulator.attach(obs1);
    simulator.attach(obs2);
    expect(simulator.getObserversCount()).toBe(2);

    // Cập nhật trạng thái -> Phát thông tin đến tất cả Observers
    simulator.updateState('STATE_A');

    expect(obs1.receivedData).toBe('STATE_A');
    expect(obs2.receivedData).toBe('STATE_A');

    // Kiểm tra đã kích hoạt 2 sự kiện hoạt ảnh
    expect(triggeredEvents.length).toBe(2);
    expect(triggeredEvents[0].receiverId).toBe('OBS_1');
    expect(triggeredEvents[1].receiverId).toBe('OBS_2');
  });

  it('Should detach observer successfully and stop sending future updates to it', () => {
    const obs1 = new ConcreteObserver('OBS_1');
    const obs2 = new ConcreteObserver('OBS_2');

    simulator.attach(obs1);
    simulator.attach(obs2);

    // Hủy đăng ký Observer 1
    simulator.detach('OBS_1');
    expect(simulator.getObserversCount()).toBe(1);

    // Cập nhật trạng thái
    simulator.updateState('STATE_B');

    // Observer 1 không nhận được tin mới, Observer 2 nhận đầy đủ
    expect(obs1.receivedData).not.toBe('STATE_B');
    expect(obs2.receivedData).toBe('STATE_B');
  });
});
```
 Thiết kế bộ mô phỏng mẫu thiết kế Observer Pattern phát tín hiệu hoạt ảnh mượt mà và linh hoạt 100% Client-side đảm bảo sinh viên thấu hiểu hoàn mỹ cơ chế kiến trúc Event-driven và hướng đối tượng chuyên nghiệp hàng đầu thế giới.
