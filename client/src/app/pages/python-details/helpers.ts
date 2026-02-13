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
