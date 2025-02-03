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
    
  protected static initREPL(shell: Shell) {
    let commandLine:  string;
    let shouldExit:   boolean   = false;

    do {
      commandLine = readline.question(`\n${shell.promptString}`);
      const commandArgs = yargsParser(commandLine);
      const command = commandArgs['_'][0];
      console.log('>> ', {commandArgs});

      switch(command) {
        case 'exit': shouldExit = true; break;
        case 'hi': console.log('hi'); break;
        case 't.glob': {
          console.log('>> global', {global});
          global.hello = function(arg) { console.log('this is from global::hello', arg); };
          global.hello(1);
          // hello(2);
        }
        break;

        case 't.cmd': {
          console.log('yargs | start');
          try {
            const parsed = yargsParser("hello two --version 2 -n 34 -fd --file='abc.txt' zoo")
            console.log('yargs | result', parsed);
          } catch (error) {
            console.log('[catch]', error);
          } finally {
            console.log('[finally]');
          }
          console.log('yargs | end');
        }
        break;
        
        default:
          // if(ShellGlobal.env.DEBUG_ENABLED)  {
            console.assert(true, '[***DEFAULT CASE OF SHELL REPL***]');
            console.log('[***DEFAULT CASE OF SHELL REPL***]', {
              command: commandLine,
              splits: commandLine.split(/\s/)
            });
          // }
      }
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