export class RepickError extends Error {
  public readonly code: string;

  public readonly status: number;

  constructor(message: string, code: string, status = 1) {
    super(message);
    this.code = code;
    this.status = status;

    Object.setPrototypeOf(this, RepickError.prototype);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
    };
  }

  override toString() {
    return `[${this.code}] (${this.status}): ${this.message}`;
  }
}
export default RepickError