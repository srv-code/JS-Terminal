export type EnvironmentVariable = {[key: string]: string|number|undefined};

export default class Environment {
  static DEBUG_ENABLED: boolean = false;
  static INIT_DIRECTORY: string;
  static EXTRAS: EnvironmentVariable = {};

  init(vars: EnvironmentVariable) {
    for(const [key, val] of Object.entries(vars)) {
      switch (key) {
        case '-d': Environment.DEBUG_ENABLED = true; break;
        case 'cwd': Environment.INIT_DIRECTORY = val; break;
        // default: Environment.EXTRAS.push(v); break;
      }
    }

    Environment.checkForEmptyValues()
  }

  static checkForEmptyValues() {

  }
}
