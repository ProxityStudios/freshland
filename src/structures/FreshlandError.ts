export class FreshlandError extends Error {
  public readonly code: string;

  public readonly status: number;

  constructor(message: string, code: string, status = 1) {
    super(message);
    this.code = code;
    this.status = status;

    Object.setPrototypeOf(this, FreshlandError.prototype);
  }
}
