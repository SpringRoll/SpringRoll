type FilterType = 'protanopia' | 'protanomaly'| 'deuteranopia' | 'deuteranomaly' | 'tritanopia' | 'tritanomaly' | 'achromatopsia'| 'achromatomaly';
type FilterObject = {name: string, value: string};
export class ColorFilter {
  constructor(element?: HTMLElement, type?: FilterType);
  applyFilter(element: HTMLElement, type: FilterType): void;
  changeFilter(type: FilterType): void;
  removeFilter(): void;
  types: FilterObject[];
}

type SpeechSynthOptions = {voice?:number | {}, pitch?: number, rate?:number, volume?: number}
export class SpeechSynth {
  constructor(options: SpeechSynthOptions);
  options: SpeechSynthOptions;
  queue: string[];
  voicesLoaded: false;
  voiceOptions: any[];
  pause(): void;
  resume(): void;
  cancel(): void;
  say(message: string): void;
  rangeLimit(min: number, max: number, value: number): number;
  setVoice(index: number): void;
  getVoice(): object | null;
  rate: number;
  pitch: number;
  volume: number;
}