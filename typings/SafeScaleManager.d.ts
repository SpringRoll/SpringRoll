import { ScaledEntity } from "../src/scale-manager/ScaledEntity";

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

export interface EntityResizeEvent {
  offset: Point;
  gameSize: Point;
  scale: Point;
}

export interface ScaledEntity {
  onResize(event: EntityResizeEvent):void
}

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
  addEntity(entity: ScaledEntity): void;
  removeEntity(entity: ScaledEntity): void;
  calcOffset(scale:Point): Point;
}

export interface AnchorConfig {
  position?: Point;
  direction?: Point;
  callback: PositionCallback;
}

export type PositionCallback = (position: Point) => void;

export class Anchor implements ScaledEntity {
  constructor(config: AnchorConfig);
  onResize(event: EntityResizeEvent): void;
}