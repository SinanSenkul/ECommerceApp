import {
  getCrashlytics,
  log,
  recordError,
  setAttributes,
  setUserId,
} from "@react-native-firebase/crashlytics";
import { Platform } from "react-native";

type CrashlyticsAttributes = Record<
  string,
  string | number | boolean | null | undefined
>;

const MAX_ATTRIBUTE_LENGTH = 96;

const sanitizeAttributes = (attributes?: CrashlyticsAttributes) => {
  const safeAttributes: Record<string, string> = {
    platform: Platform.OS,
  };

  Object.entries(attributes ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    safeAttributes[key] = String(value).slice(0, MAX_ATTRIBUTE_LENGTH);
  });

  return safeAttributes;
};

const toError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  return new Error("Unknown error");
};

export const logCrashlyticsBreadcrumb = (
  message: string,
  attributes?: CrashlyticsAttributes,
) => {
  try {
    const crashlytics = getCrashlytics();
    log(crashlytics, message);

    if (attributes) {
      setAttributes(crashlytics, sanitizeAttributes(attributes));
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("Crashlytics breadcrumb failed:", error);
    }
  }
};

export const recordCrashlyticsError = (
  error: unknown,
  context: string,
  attributes?: CrashlyticsAttributes,
) => {
  try {
    const crashlytics = getCrashlytics();
    log(crashlytics, context);
    setAttributes(
      crashlytics,
      sanitizeAttributes({
        ...attributes,
        last_error_context: context,
      }),
    );
    recordError(crashlytics, toError(error), context);
  } catch (crashlyticsError) {
    if (__DEV__) {
      console.warn("Crashlytics error reporting failed:", crashlyticsError);
    }
  }
};

export const setCrashlyticsUser = async (userId?: string | null) => {
  try {
    await setUserId(getCrashlytics(), userId ?? "");
  } catch (error) {
    if (__DEV__) {
      console.warn("Crashlytics user sync failed:", error);
    }
  }
};
