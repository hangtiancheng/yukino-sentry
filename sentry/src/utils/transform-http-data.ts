import { Status, type IHttpData } from "../types";

function transformHttpData(data: IHttpData): IHttpData {
  const { statusCode } = data;
  let message: string;
  let status: Status;
  if (statusCode === 0) {
    // Network failure or aborted request: keep the original error message.
    message = data.message || "Network error";
    status = Status.Error;
  } else if (statusCode >= 100 && statusCode < 200) {
    message = "Informational response";
    status = Status.OK;
  } else if (statusCode >= 200 && statusCode < 300) {
    message = "Successful responses";
    status = Status.OK;
  } else if (statusCode >= 300 && statusCode < 400) {
    message = "Redirection messages";
    status = Status.OK;
  } else if (statusCode >= 400 && statusCode < 500) {
    message = "Client error responses";
    status = Status.Error;
  } else if (statusCode >= 500 && statusCode < 600) {
    message = "Server error responses";
    status = Status.Error;
  } else {
    message = "Invalid status code";
    status = Status.Error;
  }
  return { ...data, message, status };
}

export default transformHttpData;
