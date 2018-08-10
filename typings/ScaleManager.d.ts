export class ScaleManager {
  constructor(callback: Function);
  disable(): void;
  enable(callback: Function): void;
  onResize(event: UIEvent): void;
}