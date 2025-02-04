import { formatDateTime } from "../util/date";
import readline from "readline-sync";
import yargsParser from 'yargs-parser';

export type ShellID = number;

/**
 * Represents all the public attributes of a Shell instance
 */
export interface ShellAttributes {
  id              : ShellID;
  startTime       : Date;
  parentId        : ShellID|null;
  childId         : ShellID|null;
}

enum REPLReturnValue {
  SUCCESS,
  EXIT, 
  COMMAND_NOT_FOUND,
  UNKNOWN_ERROR,
}

/**
 * Main command interpreter. Can have a single parent and a single child.
 */
export class Shell {
  protected static DEFAULT_PROMPT_STRING            = '>> ';
  private static instanceMap: Map<ShellID, Shell>   = new Map();

  private id              : ShellID;
  private startTime       : Date;
  private promptString    : string = Shell.DEFAULT_PROMPT_STRING;
  private parentId        : ShellID|null;
  private childId         : ShellID|null;

  private static loadApps(onlyCore?: boolean) {
    // TODO: To be implemented
  }

  protected static generateShellID(): ShellID {
    return Date.now();
  }

  protected getAttributes(): ShellAttributes {
    return {
      id: this.id,
      startTime: this.startTime,
      parentId: this.parentId,
      childId: this.childId,
    }
  }

  protected static printBirthMessage(shell: Shell) {
    let message: string;

    message = '\n*****';
    message += `\nShell (${shell.id}) started on ${formatDateTime(shell.startTime)}`;
    if(shell.parentId) {
      message += '\nThis is the top-most shell';
    }
    message += '\n*****';

    console.log(message);
  }

  protected static printDeathMessage(shell: Shell) {
    let message: string;

    message = '\n*****';
    message += `\nShell (${shell.id}) exiting...`;
    if(shell.parentId) {
      message += `\nReturning to parent shell (${shell.id})`;
    } else {
      message += '\nThis was the top-most shell';
    }
    message += '\n*****';

    console.log(message);
  }

  private static async processCommand(cmd, parsed): Promise<REPLReturnValue> {
    switch(cmd) {
      case 'exit': return REPLReturnValue.EXIT;

      case 'hi': {
        console.log('hi');
        return REPLReturnValue.SUCCESS;
      }

      default: {
        // console.log('default case 1', {cmd, args});
        try {
          const cmdFn = await import(`../apps/commands/core/${cmd}`);
          // console.log('import | success: ', cmdFn);
          cmdFn.default(parsed);
          // console.log('import | cmd success: ', cmdFn);
          return REPLReturnValue.SUCCESS;
        } catch (err) {
          // console.error('import | err: ', {
          //   err,
          //   message: err.message, 
          //   keys: Object.keys(err), 
          //   code: err.code
          // });
          if(err.code === 'MODULE_NOT_FOUND') {
            console.error(`Invalid command '${cmd}'`);
            return REPLReturnValue.COMMAND_NOT_FOUND;
          }
          console.error('Unhandled Error:', err);
          return REPLReturnValue.UNKNOWN_ERROR;
        }
      }
    }
  } 
    
  protected static async initREPL(shell: Shell) {
    let cmdln:  string;
    let shouldExit:   boolean   = false;

    do {
      cmdln = readline.question(`\n${shell.promptString}`);
      const parsed = yargsParser(cmdln);
      const cmd = parsed['_'][0];

      const returned = await Shell.processCommand(cmd, parsed);
      shouldExit = returned === REPLReturnValue.EXIT;
    } while(!shouldExit);
    shell.die();
  }

  private static registerInstance(shell: Shell) {
    Shell.instanceMap.set(shell.id, shell);
  }

  static spawnNew() {
    return new Shell();
  }

  private constructor(parentId?: ShellID) {
    this.id = Shell.generateShellID();
    this.startTime = new Date();
    this.parentId = parentId ?? null;
    this.childId = null;
    
    Shell.registerInstance(this);
    Shell.printBirthMessage(this);
    Shell.initREPL(this);
  }

  spawnChild(): Shell {
    const child = new Shell(this.id);
    this.childId = child.id;
    return child;
  }

  static findInstance(id: ShellID): Shell|undefined {
    return Shell.instanceMap.get(id);
  }

  private die() {
    Shell.printDeathMessage(this);
  }
}