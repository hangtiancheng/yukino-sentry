export enum BreadcrumbType {
  // Network request.
  Http = "Http",
  // User click.
  Click = "Click",
  // Route navigation.
  Route = "Route",
  // Resource loading.
  Resource = "Resource",
  // Code error.
  CodeError = "Code Error",
  // Custom event.
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
