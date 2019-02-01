export interface Point {
  x: Number;
  y: Number;
}

export interface ScaleEvent {
  width: Number;
  height: Number;
  scale: Point;
}

export type ScaleCallback = (event:ScaleEvent) => void;

export interface ScaleManagerConfig {
  width: Number;
  height: Number;
  safeWidth?: Number;
  safeHeight?: Number;
  callback: ScaleCallback; 
}

export class ScaleManager {
  constructor(config: ScaleManagerConfig);
  disable(): void;
  enable(callback: ScaleCallback): void;
  onResize(event: UIEvent): void;
  addAnchor(anchor: Anchor): void;
  removeAnchore(anchor: Anchor): void;
  calcOffset(scale:Point): Point;
}

export interface AnchorConfig {
  position?: Point;
  direction?: Point;
  callback: AnchorCallback;
}

export interface AnchorUpdateEvent {
  offset: Point;
  halfWidth: Number;
  halfHeight: Number;
}

export type AnchorCallback = (position: Point) => void;

export class Anchor {
  constructor(config: AnchorConfig);
  updatePosition(event: AnchorUpdateEvent): void;
}