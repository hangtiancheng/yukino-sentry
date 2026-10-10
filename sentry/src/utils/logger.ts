const themeColors = {
  info: "#74d4ff",
  success: "#bbf450",
  error: "#ffa2a2",
  text: "#62748e",
  timestamp: "#dab2ff",
};

const fontFamily =
  "font-family: Yukino, Maple Mono, Menlo, Cascadia Code, Sarasa Gothic SC, PingFang SC, Microsoft YaHei;";
const getMessageStyle = (color: string) => `color: ${color}; ${fontFamily}`;

const getPrefixStyle = (color: string) =>
  `color: ${themeColors.text}; background: ${color}; border-radius: 4px; ${fontFamily}`;

type SentryStyles = Record<
  "info" | "success" | "error",
  {
    message: string;
    prefix: string;
  }
>;

const sentryStyles: SentryStyles = {
  info: {
    message: getMessageStyle(themeColors.info),
    prefix: getPrefixStyle(themeColors.info),
  },
  success: {
    message: getMessageStyle(themeColors.success),
    prefix: getPrefixStyle(themeColors.success),
  },
  error: {
    message: getMessageStyle(themeColors.error),
    prefix: getPrefixStyle(themeColors.error),
  },
};

const nativeConsoleError = console.error.bind(console);

const DEFAULT_PREFIX = "@yukino.js/sentry";

type LogLevel = keyof SentryStyles;

function isEnabled(): boolean {
  return globalThis.__sentry__?.options.debug ?? false;
}

function printGroup(
  level: LogLevel,
  prefix: string,
  message: string,
  body: () => void,
): void {
  if (!isEnabled()) return;
  console.groupCollapsed(
    `%c ${prefix} %c ${message} `,
    sentryStyles[level].prefix,
    sentryStyles[level].message,
  );
  body();
  console.groupEnd();
}

function logData(data: unknown, tableColumns?: string[]): void {
  if (data === undefined) return;
  if (Array.isArray(data)) {
    if (tableColumns) {
      console.table(data, tableColumns);
    } else {
      console.table(data);
    }
    return;
  }
  if (typeof data === "object" && data !== null) {
    console.group("Details");
    console.log(data);
    console.groupEnd();
    return;
  }
  console.log(data);
}

export const sentryLogger = {
  get isEnabled() {
    return isEnabled();
  },

  info(
    message: string,
    data?: unknown,
    tableColumns?: string[],
    prefix = DEFAULT_PREFIX,
  ) {
    printGroup("info", prefix, message, () => {
      logData(data, tableColumns);
    });
  },

  success(
    message: string,
    data?: unknown,
    duration?: number,
    prefix = DEFAULT_PREFIX,
  ) {
    printGroup("success", prefix, message, () => {
      if (duration !== undefined) {
        console.log(
          `%c Time cost %c ${duration}ms`,
          sentryStyles.success.prefix,
          sentryStyles.success.message,
        );
      }
      logData(data);
    });
  },

  error(message: string, error?: unknown, prefix = DEFAULT_PREFIX) {
    printGroup("error", prefix, message, () => {
      if (error !== undefined) {
        console.group("Details");
        nativeConsoleError(error);
        console.groupEnd();
      }
    });
  },
};
