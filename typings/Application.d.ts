/// <reference types="bellhop-iframe" />
import { IHintPlayer } from "./Hint";


export type ApplicationFeatures = {
  captions?: boolean,
  sound?: boolean,
  vo?: boolean,
  music?: boolean,
  sfx?: boolean,
  soundVolume?: boolean,
  musicVolume?: boolean,
  voVolume?: boolean,
  sfxVolume?: boolean,
  pointerSize?: boolean,
  controlSensitivity?: boolean,
  difficulty?: boolean,
  buttonSize?: boolean,
};

export type ApplicationConfig = {
  features?: ApplicationFeatures,
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
    pointerSize: Property<number>,
    controlSensitivity: Property<number>,
    difficulty: Property<number>,
    buttonSize: Property<number>,
    [key:string]: Property<any>
  }
  hints: IHintPlayer;
  features: ApplicationFeatures;
  container: BellhopIframe.Bellhop;
  setupPlugins(): Promise<void>;
  getPlugin(name: string): ApplicationPlugin | undefined
  static _plugins: ApplicationPlugin[];
  static getPlugin(name: string): ApplicationPlugin | undefined
  static uses(plugin: ApplicationPlugin): void
}

export interface ApplicationPlugin {
  constructor(priority?: number)
  name: string;
  start(app: Application): void;
  preload(app: Application): Promise<any>;
  init(app: Application): void;
}

export class ApplicationPlugin implements ApplicationPlugin {}


export class Property<T> {
  constructor(initialValue: T);
  private _value: T;
  private listeners: Function[];
  value: T;
  notifyChange(): void;
  subscribe(callback:(value: T, previousValue: T) => void): void;
  unsubscribe(callback: Function): void;
  hasListeners(): boolean;
}

export class UserData {
  static read(name:string): Promise<any>;
  static write(name:string, value:any):Promise<any>;
  static delete(name:string): void;
}
