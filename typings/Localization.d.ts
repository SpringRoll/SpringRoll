import { IRender, TemplateVariables } from './Renderer';

type Locale = {path: string};
type LocalizerConfig = {default: string, locales: { name: Locale }};
type LocalizerOptions = {language: string, fallback: string};
type CaptionLine = {content: string, start: number, end: number};
type CaptionData = {[key: string]: CaptionLine[]};
export class Localizer {
  constructor(config: LocalizerConfig, options: LocalizerOptions);
  resolve(path: string, options: object);
  setPrimaryLocale(localeKey: string): boolean;
  setFallbackLocale(localeKey: string): boolean;
  getLocaleKey(localeKey: string): string;
  getBrowsersLocaleKey() : void | undefined | string;
  getBrowserLanguages(): ReadonlyArray<any> | Array<any>;
}

export class Timedline {
  constructor(startTime: number, endTime: number, content: string);
  startTime: number;
  endTime: number;
  content: string;
  setContent(content: string): void;
}

export class Caption {
  constructor(lines: Timedline[]);
  lines: Timedline[];
  renderer: IRender;
  reset(): void;
  update(deltaTime: number): void;
  updateState(currentTime: number, lastTime: number): void;
  isFinished(): boolean;
  start(time: number, renderer: any);
}

export class CaptionPlayer {
  constructor(captions: CaptionData, renderer: IRender);
  renderer: IRender;
  captions: {[name:string]: Caption};
  activeCaption: Caption;

  update(deltaTime:number): void;
  start(name: string, time?: number, args?: TemplateVariables): void;
  stop(): void;

}

export class CaptionFactory {
  static createCaptionMap(data: CaptionData): Timedline[];
  static createCaption(captionData: CaptionData): Timedline;
}
