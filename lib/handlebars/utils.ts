export const halfWithSuffix = (value: any) => `${value / 2}px`;
export const relativeSpritesheetPath = (value: string) => {
  return `../img/${value}.png`;
};
export const convertAbsoluteSpritesheetPathToRelative = (value: string) => {
  return value.replace(/.*\/src\/img\//, '../img/');
};

export const wrapTemplateVariablesForHandlebars = (
  context: Record<string, any>,
  reservedKeys: string[] = [],
) => {
  const wrappedContext: Record<string, any> = { ...context };
  const reservedKeySet = new Set(reservedKeys);

  for (const [key, value] of Object.entries(wrappedContext)) {
    if (reservedKeySet.has(key) || typeof value !== 'string') {
      continue;
    }

    if (value === '') {
      wrappedContext[key] = null;
      continue;
    }

    wrappedContext[key] = {
      toHTML() {
        return value;
      },
      toString() {
        return value;
      },
      valueOf() {
        return value;
      },
    };
  }

  return wrappedContext;
};
