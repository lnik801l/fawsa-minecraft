import chalk = require('chalk');
import * as fs from 'fs';
import { Logger } from './Logger';

class Cfg {
  private name = '';
  private logger: Logger;
  params: { [name: string]: any };
  constructor(name: string, params: { [name: string]: any }) {
    if (!name || !params) {
      throw new Logger('cfg init').err('параметры или название конфига не указаны!');
    }
    this.name = name;
    this.params = params;
    this.logger = new Logger(name + '.cfg');
    this.init();
  }
  public init() {
    this.logger.log('Инициализация конфига ' + this.name);
    this.validate();
    if (!fs.existsSync('./config')) {
      fs.mkdirSync('./config');
    }
    if (!fs.existsSync('./config/' + this.name + '.json')) {
      fs.writeFileSync('./config/' + this.name + '.json', JSON.stringify(this.params, null, '\t'));
      this.logger.log('Конфиг ' + this.name + ' создан!');
    } else {
      this.validateFileAndRead(fs.readFileSync('./config/' + this.name + '.json'));
      this.logger.log('Конфиг ' + this.name + ' загружен!');
    }
  }
  public validate(): boolean {
    let status = true;
    for (const param in this.params) {
      if (param == undefined || param == null || this.params[param] == undefined || this.params[param] == null) {
        status = false;
        this.logger.err(
          'параметр ' +
          chalk.white(param) +
          ' в конфиге ' +
          chalk.white(this.name) +
          ' не прошёл валидацию! \n\n' +
          'ожидалось: ' +
          chalk.yellow(param) +
          ': value \n' +
          chalk.red('получено: ' + param + ': ') +
          this.params[param]
        );
      }
    }
    return status;
  }
  private validateFileAndRead(b: Buffer) {
    const toValidate = JSON.parse(b.toString());
    let bool = false;
    for (const param in this.params) {
      if (typeof toValidate[param] !== typeof this.params[param]) {
        bool = true;
        this.logger.err(
          'Файл конфига ' +
          this.name +
          ' не прошёл валидацию!\n' +
          'параметр ' +
          param +
          ' должен быть: ' +
          chalk.green(typeof this.params[param]) +
          ', получено: ' +
          chalk.yellow(typeof toValidate[param])
        );
      }
    }
    if (bool) throw '';
    this.params = toValidate;
  }
}
export { Cfg };
