// import events, { EventEmitter } from 'events'; 
import { formatDateTime } from "../util";
import { Shell } from "./shell";


/**
 * Main Terminal Process class
 */
export class Process {
  // private eventEmitter: EventEmitter;
  private startTime: Date;
  private rootShell: Shell;
  // private environment: Environment;

  showBootMessage() {
    console.clear();
    console.log('Terminal started');
    console.log(`Time: ${formatDateTime(this.startTime)}\n`);
  }

  constructor() {
    this.startTime = new Date();
    // this.eventEmitter = new events.EventEmitter();
    
    this.showBootMessage();
    this.rootShell = Shell.spawnNew();
  }
}
