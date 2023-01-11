import { BadRequestException, HttpException } from "@nestjs/common";

const getErrorMessageInErrorResponseDataError = (error: any) => {
  return error?.response?.data?.errors?.[0]?.message;
};
const getErrorMessageInErrorResponseData = (error: any) => {
  return error?.response?.data?.message;
};
const getErrorMessageInErrorResponse = (error: any) => {
  let errorMessage: string;
  if (error?.response?.message) {
    if (Array.isArray(error.response.message)) {
      errorMessage = `${error.response.error}: ${error.response.message[0]}`;
    } else {
      errorMessage = `${error.response.error}: ${error.response.message}`;
    }
  }
  return errorMessage;
};
const getErrorMessageInError = (error: any) => {
  let errorMessage: string;

  if (error?.message) {
    if (error.name) {
      errorMessage = `${error.name}: ${error.message}`;
    } else {
      errorMessage = `${error.message}`;
    }
  }
  return errorMessage;
};
const getErrorMessageInGraphqlErrorResponse = (errors: []) => {
  let errorMessage: string;
  if (errors.length > 0)
    return (errorMessage = errors.map((error) => error['message']).toString());
  return errorMessage;
};
const removeLocalErrorMessage = (error:string)=>{
    return error.replace('HttpException:','').replace('Forbidden:','').replace('Bad Request:','').replace('Not Found:','')
}

export const getErrorMessage = (error: any) => {
  let result =
    getErrorMessageInErrorResponseDataError(error) ??
    getErrorMessageInErrorResponseData(error) ??
    getErrorMessageInErrorResponse(error) ??
    getErrorMessageInError(error) ??
    getErrorMessageInGraphqlErrorResponse(error) ??
    'Unknown error occurred';

  return removeLocalErrorMessage(result);
};
