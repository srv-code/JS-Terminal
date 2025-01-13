import { formatDateTime } from "../util/date";

export type ShellID = number;

/**
 * Main command interpreter. Can have a single parent and a single child.
 */
export default class Shell {
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

  protected getAttributes(): Object {
    const attr: any = {};
    attr.id = this.id;
    attr.startTime = this.startTime;
    attr.parentId = this.parentId;
    attr.childId = this.childId;
    
    return attr;
  }

  protected static printBornMessage(shell: Shell) {
    console.log(`*****
Shell (${shell.id}) started on ${formatDateTime(shell.startTime)}${shell.parentId ? '' : '\nThis is the top-most shell'}
*****`);
  }

  protected static printKillMessage(shell: Shell) {
    console.log(`*****
Shell (${shell.id}) exiting...
${shell.parentId ? `Returning to parent shell ${shell.id}` : '\nThis was the top-most shell'}
*****`);
    }
    
  protected static initREPL(shell: Shell) {
    let command: string       = '';
    let shouldExit: boolean   = false;

    while(!shouldExit) {
      switch(command) {
        case '': console.log(`\n${shell.promptString}`); break;
        default:
          if(ShellGlobal.env.DEBUG_ENABLED)  {
            console.assert(true, '[***DEFAULT CASE OF SHELL REPL***]');
          }
      }
    }
  }

  constructor(parentId?: ShellID) {
    this.id = Shell.generateShellID();
    this.startTime = new Date();
    this.parentId = parentId ?? null;
    this.childId = null;
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