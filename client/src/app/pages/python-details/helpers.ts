export const parseJsonField = <T>(value: unknown, fallback: T): T => {
  if (
    value === undefined ||
    value === null ||
    value === "null" ||
    value === ""
  ) {
    return fallback;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
};

export const parseProjectUrls = (
  projectUrls: unknown,
): { label: string; url: string }[] => {
  if (!projectUrls || projectUrls === "null") return [];
  try {
    const parsed =
      typeof projectUrls === "string" ? JSON.parse(projectUrls) : projectUrls;

    if (Array.isArray(parsed)) {
      return parsed
        .map((entry: string) => {
          const commaIndex = entry.indexOf(",");
          if (commaIndex === -1) {
            return null;
          }
          return {
            label: entry.substring(0, commaIndex).trim(),
            url: entry.substring(commaIndex + 1).trim(),
          };
        })
        .filter(Boolean) as { label: string; url: string }[];
    }

    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).map(([label, url]) => ({
        label,
        url: String(url),
      }));
    }
  } catch {
    // Return empty for now...
  }
  return [];
};

export const parseClassifiers = (classifiers: unknown): string[] => {
  return parseJsonField<string[]>(classifiers, []);
};

export const groupClassifiers = (
  classifiers: string[],
): Record<string, string[]> => {
  return classifiers.reduce(
    (acc, classifier) => {
      const parts = classifier.split(" :: ");
      const category = parts[0];
      if (!acc[category]) acc[category] = [];
      acc[category].push(parts.slice(1).join(" :: "));
      return acc;
    },
    {} as Record<string, string[]>,
  );
};

export const truncateLicense = (
  license: string | undefined,
  maxLength = 50,
): string => {
  if (!license) return "Unknown";
  return license.length > maxLength
    ? `${license.substring(0, maxLength)}...`
    : license;
};
