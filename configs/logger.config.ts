type LogLevel = "info" | "warn" | "error" | "debug";

export interface Logger {
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
  debug: (message: string, meta?: unknown) => void;
}

function formatTimestamp(): string {
  return new Date().toISOString();
  
}

function formatMessage(
  level: LogLevel,
  message: string,
  context?: string,
  meta?: unknown
): string {
  const timestamp = formatTimestamp();
  const contextPart = context ? ` [${context}]` : "";
  const prefix = `[${timestamp}] [${level.toUpperCase()}]${contextPart}`;
  const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
  return `${prefix} ${message}${metaStr}`;
}

function createLogFn(context?: string) {
  return function log(level: LogLevel, message: string, meta?: unknown): void {
    const formatted = formatMessage(level, message, context, meta);
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
        if (process.env.NODE_ENV !== "production") {
          console.debug(formatted);
        }
        break;
      default:
        console.log(formatted);
    }
  };
}

/** Create a logger scoped to a module. Use the module name as context. */
export function createLogger(context: string): Logger {
  const log = createLogFn(context);
  return {
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
    debug: (message, meta) => log("debug", message, meta),
  };
}

/** Default logger without module context */
export const logger = createLogger("");
