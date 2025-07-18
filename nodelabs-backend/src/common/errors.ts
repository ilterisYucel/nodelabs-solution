interface INodeLabsError extends Error {
  statusCode: number;
}
export type { INodeLabsError };

class NodeLabsError extends Error {
  readonly statusCode;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
export { NodeLabsError };
