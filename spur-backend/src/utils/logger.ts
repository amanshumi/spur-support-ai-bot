export class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private formatMessage(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.module}] ${message}`;
  }

  info(message: string, meta?: any) {
    console.log(this.formatMessage(message), meta || '');
  }

  error(message: string, meta?: any) {
    console.error(this.formatMessage(message), meta || '');
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatMessage(message), meta || '');
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(message), meta || '');
    }
  }
}