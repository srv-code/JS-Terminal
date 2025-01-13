import { formatDateTime } from "../util/date";
import readline from "readline-sync";


export type ShellID = number;

export interface ShellAttributes {
  id:             ShellID;
  startTime:      Date;
  parentId:       ShellID|null;
  childId:        ShellID|null;
}

/**
 * Main command interpreter. Can have a single parent and a single child.
 */
export class Shell {
  protected static DEFAULT_PROMPT_STRING = '>> ';

  private id:             ShellID;
  private startTime:      Date;
  private promptString:   string = Shell.DEFAULT_PROMPT_STRING;
  private parentId:       ShellID|null;
  private childId:        ShellID|null;

  protected static generateShellID(): ShellID {
    const _id = Date.now();
    return _id;
  }

  protected getAttributes(): ShellAttributes {
    return {
      id: this.id,
      startTime: this.startTime,
      parentId: this.parentId,
      childId: this.childId,
    }
  }

  protected static printBornMessage(shell: Shell) {
    console.log('*****');
    console.log(`Shell (${shell.id}) started on ${formatDateTime(shell.startTime)}${shell.parentId ? '' : '\nThis is the top-most shell'}`);
    console.log('*****');
  }

  protected static printKillMessage(shell: Shell) {
    console.log('\n*****');
    console.log(`Shell (${shell.id}) exiting...`);
    if(shell.parentId) {
      console.log(`Returning to parent shell ${shell.id}`);
    } else {
      console.log('This was the top-most shell');
    }
    console.log('*****');
  }
    
  protected static initREPL(shell: Shell) {
    let command: string       = '';
    let shouldExit: boolean   = false;

    do {
      command = readline.question(`\n${shell.promptString}`)
      switch(command) {
        case 'exit': shouldExit = true; break;
        case 'hi': console.log('hi'); break;
        default:
          // if(ShellGlobal.env.DEBUG_ENABLED)  {
            console.assert(true, '[***DEFAULT CASE OF SHELL REPL***]');
          // }
      }
    } while(!shouldExit);
    shell.killChild();
  }

  constructor(parentId?: ShellID) {
    this.id = Shell.generateShellID();
    this.startTime = new Date();
    this.parentId = parentId ?? null;
    this.childId = null;
    // console.log('>> bef');
    
    Shell.printBornMessage(this);
    Shell.initREPL(this);
  }

  spawnChild(): Shell {
    const child = new Shell(this.id);
    this.childId = child.id;
    
    return child;
  }

  killChild() {
    const _id = this.childId;
    this.childId = null;
    Shell.printKillMessage(this);
    
    return this.childId;
  }
}