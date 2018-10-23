import { IHintPlayer } from "../src/hints";

export type ApplicationFeatures = { [key:string]: boolean };

export type ApplicationConfig = {
  features: ApplicationFeatures,
  hintPlayer?: IHintPlayer
}

export class Application {
  constructor(config: ApplicationConfig);
  validateListeners(): void;
  state: {
    ready: Property<boolean>,
    pause: Property<boolean>,
    captionsMuted: Property<boolean>,
    playOptions: Property<object>,
    soundVolume: Property<number>,
    musicVolume: Property<number>,
    voVolume: Property<number>,
    sfxVolume: Property<number>,
    [key:string]: Property
  }
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


export class Property<T> {
  constructor(initialValue: T);
  private _value: T;
  private listeners: Function[];
  value: T;
  notifyChange(): void;
  subscribe(callback: Function): void;
  unsubscribe(callback: Function): void;
  hasListeners(): boolean;
}
