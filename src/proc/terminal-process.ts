import events, { EventEmitter } from 'events'; 

/**
 * Main Terminal Process class
 */
export class TerminalProcess {
  private eventEmitter: EventEmitter;
  private startTime: Date;
  // private environment: Environment;

  showBootMessage() {
    console.clear();
    console.log('Terminal started');
    console.log(`Time: ${this.startTime}`);
  }

  constructor() {
    this.startTime = new Date();
    this.eventEmitter = new events.EventEmitter();

    this.showBootMessage();
  }
}
