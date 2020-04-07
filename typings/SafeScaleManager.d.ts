export type ViewAreaRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ScaleEvent {
  width: number;
  height: number;
  scale: Point;
  scaleRatio: number;
  viewArea: ViewAreaRect;
}

export type ScaleCallback = (event:ScaleEvent) => void;

export interface EntityResizeEvent {
  offset: Point;
  gameSize: Point;
  scale: Point;
  viewArea: ViewAreaRect;
}

export interface ScaledEntity {
  onResize(event: EntityResizeEvent):void
}

export interface SafeScaleManagerConfig {
  width: number;
  height: number;
  safeWidth?: number;
  safeHeight?: number;
  callback: ScaleCallback; 
}

export class SafeScaleManager {
  constructor(config: SafeScaleManagerConfig);
  disable(): void;
  enable(callback: ScaleCallback): void;
  onResize(event: UIEvent): void;
  addEntity(entity: ScaledEntity): void;
  addEntity(entities: ScaledEntity[]): void;
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
