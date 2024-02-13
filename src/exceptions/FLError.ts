import Constants from '../utils/constants';

class FLError extends Error {
	public readonly code: string;

	public readonly statusCode: number;

	public readonly timestamp: Date;

	public readonly details: unknown;

	constructor(
		message: string,
		code: string,
		details?: unknown,
		statusCode: number = Constants.ProcessStatus.FAIL
	) {
		super(message);
		this.code = code;
		this.statusCode = statusCode;
		this.timestamp = new Date();
		this.details = details;
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}

	public getErrorDetails(): string {
		if (this.details) {
			return JSON.stringify(this.details, null, 2);
		}
		return '';
	}
}

export default FLError;
