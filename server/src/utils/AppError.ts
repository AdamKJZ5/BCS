export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;

    // Set the error name to the class name (AppError)
    this.name = this.constructor.name;

    // Remove constructor call from stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
