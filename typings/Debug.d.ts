type DebuggerParam = {emitEnabled: Boolean, enabled: Boolean, minLevel: number};
type DebuggerLevel = { GENERAL: 1, DEBUG: 2, INFO: 3, WARN: 4, ERROR: 5};
export class Debugger {
  static LEVEL: DebuggerLevel;
  static params: DebuggerParam;
  static minLevel(level: string | number): void;
  static initParams(): void;
  static emit(eventName?: string): void;
  static meetsLevelRequirements(level?: string): boolean;
  static log(type?: string, ...args:any[]):void;
  static isValidLevelName(level: string): void;
  static assert(isTrue: boolean): void;
  static isEnabled(): boolean;
  static enable(flag: boolean): void;
  static paramKey:string;
}