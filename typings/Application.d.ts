export type ApplicationFeatures = { [key:string]: boolean };

export class Application {
  constructor(features: ApplicationFeatures);
  promisify(e: any): any;
  validateListeners(): void;
  state: StateManager;
  features: ApplicationFeatures;
  container: BellhopIframe.Bellhop;
  promisify(callback: Function): Promise<any>;
  validateListeners(): void;



  static _plugins: ApplicationPlugin[];
  static uses(plugin: ApplicationPlugin): void
}

export interface ApplicationPlugin {
  constructor(priority?: number)
  priority: number;
  setup(): any;
  preload(): Promise<any> | undefined | void;
}

export class ApplicationPlugin implements ApplicationPlugin {}

export class StateManager {
  addField(name: string, initialValue: any): Property;
  [key:string]:((name: string, initialValue: string) => Property) | Property
}

export class Property {
  constructor(initialValue: any);
  private _value: any;
  private listeners: Function[];
  value: any;
  notifyChange(): void;
  subscribe(callback: Function): void;
  unsubscribe(callback: Function): void;
  hasListeners(): boolean;
}