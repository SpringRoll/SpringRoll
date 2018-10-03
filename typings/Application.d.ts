import { IHintPlayer } from "../src/hints";

export type ApplicationFeatures = { [key:string]: boolean };

export type ApplicationConfig = {
  features: ApplicationFeatures,
  hintPlayer?: IHintPlayer
}

export class Application {
  constructor(config: ApplicationConfig);
  validateListeners(): void;
  state: StateManager;
  hints: IHintPlayer;
  features: ApplicationFeatures;
  container: BellhopIframe.Bellhop;

  static _plugins: ApplicationPlugin[];
  static validatePlugins: string[];
  static sortPlugins: void;
  static uses(plugin: ApplicationPlugin): void
}

export interface ApplicationPlugin {
  constructor(priority?: number)
  priority: number;
  setup(): any;
  preload(): Promise<any>;
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
