import chalk = require('chalk');
import * as fs from 'fs';

enum logType {
  log, err
}

enum timeFormat {
  file, console
}

class Logger {

  private static format_two_digits(n): string {
    return n < 10 ? '0' + n : n;
  }
  private static startedTime = Logger.formattedTime(new Date(), timeFormat.file);
  private static logPath = './logs';
  private static startedDate = Logger.format_two_digits(new Date().getDate()) + '.' + Logger.format_two_digits(new Date().getMonth() + 1) + '.' + new Date().getFullYear();

  private static formattedTime(d: Date = new Date(), t: timeFormat = timeFormat.console): string {
    const hours = Logger.format_two_digits(d.getHours());
    const minutes = Logger.format_two_digits(d.getMinutes());
    const seconds = Logger.format_two_digits(d.getSeconds());
    const sep = t == timeFormat.console ? ':' : '.';
    return hours + sep + minutes + sep + seconds;
  }

  private async writeToFile(s: string, type: logType) {
    fs.access(Logger.logPath, (err) => {
      const write = () => fs.appendFile(Logger.logPath + '/' + Logger.startedDate + '/' + Logger.startedTime + '.' + logType[type], s + '\n', () => { });
      const cb = () => {
        fs.access(Logger.logPath + '/' + Logger.startedDate, (err1) => {
          err1 ? fs.mkdir(Logger.logPath + '/' + Logger.startedDate, write) : write();
        });
      }
      err ? fs.mkdir(Logger.logPath, cb) : cb();
    });
  }


  name: string;
  constructor(name: string) {
    this.name = name;
  }

  public log(str: string | number | object, writeToFile: boolean = true) {
    if (typeof str == 'object')
      str = JSON.stringify(str, null, '\t');

    const write: string = '[' + this.name + ' logger][' + Logger.formattedTime() + '] ' + str;
    if (writeToFile) this.writeToFile(write, logType.log);
    console.log(chalk.green(write));
  }

  public warn(str: string | number | object, writeToFile: boolean = true) {
    if (typeof str == 'object')
      str = JSON.stringify(str, null, '\t');
    const write: string = '[' + this.name + ' logger][' + Logger.formattedTime() + '] ' + str;
    if (writeToFile) this.writeToFile(write, logType.log);
    console.warn(chalk.yellow(write));
  }

  public err(str: string | number | object) {
    if (typeof str == 'object')
      str = JSON.stringify(str, null, '\t');
    const write: string = '[' + this.name + ' logger][' + Logger.formattedTime() + '] ' + str;
    this.writeToFile(write, logType.log);
    this.writeToFile(write, logType.err);
    console.error(chalk.red(write));
  }
}
export { Logger };
