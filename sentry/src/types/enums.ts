export enum BreadcrumbType {
  Http = "Http",
  Click = "Click",
  Route = "Route",
  Resource = "Resource",
  CodeError = "Code Error",
  Custom = "Custom",
}

export enum Status {
  Error = "Error",
  OK = "OK",
}

export enum EventType {
  Xhr = "XMLHttpRequest",
  Fetch = "fetch",
  Click = "Click",
  HashChange = "Event hashchange",
  History = "History",
  Resource = "Resource",
  UnhandledRejection = "Event unhandledrejection",
  Error = "Error",
  Vue = "Vue",
  React = "React",
  OtherFrameworks = "OtherFrameworks",
  Performance = "Performance",
  ScreenRecord = "ScreenRecord",
  Exposure = "Exposure",
  WhiteScreen = "WhiteScreen",
  Custom = "Custom",
  PV = "PV",
}
