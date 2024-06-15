export default class BizError extends Error {
  public statusCode: number = 400
  constructor(message: string) {
    super(message)
    this.name = "BizError"
  }

  public setStatusCode(statusCode: number) {
    this.statusCode = statusCode
    return this
  }
}
