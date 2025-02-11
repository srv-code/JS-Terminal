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

enum ShellInternalCommands {
  HI = 'hi',
  GET_COMMAND = 'get-command',
  HELP = 'help',
  EXIT = 'exit',
}

/**
 * Main command interpreter. Can have a single parent and a single child.
 */
export class Shell {
  protected static DEFAULT_PROMPT_STRING            = '$';
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

  private static async processCommand(command, parsedArguments): Promise<REPLReturnValue> {
    console.log('processCommand', {command, parsedArguments});

    const internalCommands = Object.values(ShellInternalCommands);

    switch(command) {
      case ShellInternalCommands.HELP: {
        let message = '';

        message += 'Commands:\n\tShell internal:\n';
        for(const idx in internalCommands) {
          message += `\n\t[${(+idx+1)}] ${internalCommands[idx]}`;
        }
        console.log(message);

        return REPLReturnValue.SUCCESS;
      }

      case ShellInternalCommands.EXIT: return REPLReturnValue.EXIT;

      case ShellInternalCommands.GET_COMMAND: {
        const resultSet = {};
        parsedArguments['_'].shift();

        for(const _cmd of parsedArguments['_']) { // TODO: Add the args from parsed
          resultSet[_cmd] = 'Not found';

          for(const commandType of ['internal', 'core', 'external']) {
            switch(commandType) {
              case 'internal': {
                  if(internalCommands.includes(_cmd)) {
                    resultSet[_cmd] = {type: commandType};
                    break;
                  }
                }
                break;
            
              case 'core': {
                  console.log('core...', {_cmd, commandType});
                  let found = false;
                  import(`../apps/commands/core/${_cmd}`).then(() => {
                    resultSet[_cmd] = {type: commandType};
                  });
                  if(found) {
                    break;
                  }
                }
                break;

              case 'external': {
                  
                }
                break;
                
              default: throw new Error('Internal');
            }
          }
        }
        
        for(const [key, value] of Object.entries(resultSet)) {
          console.log(`${key}: ${JSON.stringify(value)}`);
        }

        return REPLReturnValue.SUCCESS;
      }

      case ShellInternalCommands.HI: {
        console.log('hi');
        return REPLReturnValue.SUCCESS;
      }

      default: {
        // console.log('default case 1', {cmd, args});
        try {
          const cmdFn = await import(`../apps/commands/core/${command}`);
          // console.log('import | success: ', cmdFn);
          cmdFn.default(parsedArguments);
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
            console.error(`Invalid command '${command}'`);
            return REPLReturnValue.COMMAND_NOT_FOUND;
          }
          console.error('Unhandled Error:', err);
          return REPLReturnValue.UNKNOWN_ERROR;
        }
      }
    }
  } 
    
  protected static async initREPL(shell: Shell) {
    let commandLine:  string;
    let shouldExit:   boolean   = false;

    do {
      commandLine = readline.question(`\n${shell.promptString} `);
      const parsedArguments = yargsParser(commandLine);
      const command = parsedArguments['_'][0];

      const returned = await Shell.processCommand(command, parsedArguments);
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