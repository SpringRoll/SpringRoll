export type ScaleManagerCallback = (event:{width:number, height: number, ratio: number}) => void;

export class ScaleManager {
    constructor(callback?: ScaleManagerCallback);
    disable(): void;
    enable(callback: ScaleManagerCallback): void;
    onResize(event: UIEvent): void;
}