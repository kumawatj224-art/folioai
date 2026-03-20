const enabledValues = new Set(["1", "true", "yes", "on"]);

export function isNewAppEnabled(value: string | undefined = process.env.ENABLE_NEW_APP): boolean {
  if (!value) {
    return false;
  }

  return enabledValues.has(value.trim().toLowerCase());
}
