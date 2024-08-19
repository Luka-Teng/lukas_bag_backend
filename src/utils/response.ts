import BizError from '../error/BizError'

export const createError = (message: string, statusCode = 400) => {
  return new BizError(message).setStatusCode(statusCode)
}

export const createResponse = (data: any, message = 'success') => {
  return {
    message,
    data
  }
}