import { Application } from './Application';

export class ApplicationPlugin {
  constructor(priority = 0) {
    this.priority = priority;
    Application._plugins.push(this);
    Application._plugins.sort((p1, p2) => p2.priority - p1.priority);
  }

  setup() {
  }

  preload() {
    return Promise.resolve();
  }

  teardown() {
  }
}
