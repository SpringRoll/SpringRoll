/// <reference types="bellhop-iframe" />
import { IHintPlayer } from "./Hint";

export type ApplicationFeatures = {
  captions?: boolean,
  captionsStyles?: boolean,
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
  buttonSize?: boolean,
  removableLayers?: boolean,
  hudPosition?: boolean,
  hitAreaScale?: boolean,
  dragThresholdScale?: boolean,
  health?: boolean,
  objectCount?: boolean,
  completionPercentage?: boolean,
  speedScale?: boolean,
  timersScale?: boolean,
  inputCount?: boolean
  keyBinding?: boolean,
  colorVision?: boolean,
  fullScreen?: boolean,
};

export type CaptionStyle = {
  color: string,
  edge: string,
  font:string,
  background:string,
  size:string,
  align:string,
  value?:string
}

export type KeyBinding = {
  [key:string]: string
}

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
    captionsStyles: Property<CaptionStyle>,
    playOptions: Property<object>,
    soundVolume: Property<number>,
    musicVolume: Property<number>,
    voVolume: Property<number>,
    sfxVolume: Property<number>,
    pointerSize: Property<number>,
    controlSensitivity: Property<number>,
    buttonSize: Property<number>,
    removableLayers: Property<number>,
    hudPosition: Property<string>,
    hitAreaScale: Property<number>,
    dragThresholdScale: Property<number>,
    health: Property<number>,
    objectCount: Property<number>,
    completionPercentage: Property<number>,
    speedScale: Property<number>,
    timersScale: Property<number>,
    inputCount: Property<number>
    keyBinding: Property<KeyBinding>,
    colorVision: Property<string>,
    fullScreen: Property<boolean>,
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

export interface ApplicationPluginOptions {
  name: string;
}

export class ApplicationPlugin {
  constructor(options: ApplicationPluginOptions)
  name: string;
  start(app: Application): void;
  preload(app: Application): Promise<any>;
  init(app: Application): void;
}


export type PropertyChangeListener<T> = (value: T, previousValue: T) => void;

export class Property<T> {
  constructor(initialValue: T, alwaysNotify?: boolean);
  private _value: T;
  private listeners: PropertyChangeListener<T>[];
  value: T;
  notifyChange(): void;
  subscribe(callback: PropertyChangeListener<T>): void;
  unsubscribe(callback: PropertyChangeListener<T>): void;
  hasListeners: boolean;
}

export class UserData {
  static read(name:string): Promise<any>;
  static write(name:string, value:any):Promise<any>;
  static delete(name:string): void;
}
