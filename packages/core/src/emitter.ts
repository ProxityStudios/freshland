import { EventEmitter } from 'node:events';
import { BuilderData } from '@repick/common';

export class Emitter extends EventEmitter {
  override on<K extends keyof EventMap>(event: K, listener: EventMap[K]): this {
    return super.on(event, listener);
  }

  override emit<K extends keyof EventMap>(event: K, ...args: Parameters<EventMap[K]>): boolean {
    return super.emit(event, ...args);
  }
}

// TODO:
export interface EventMap {
  successClone: (builderData: BuilderData) => void;
  error: (err: any) => void;
}
