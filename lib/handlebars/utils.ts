export const halfWithSuffix = (value: any) => `${value / 2}px`;
export const relativeSpritesheetPath = (value: string) => {
  return `../img/${value}.png`;
};
export const convertAbsoluteSpritesheetPathToRelative = (value: string) => {
  return value.replace(/.*\/src\/img\//, '../img/');
};
