import { dirname, basename } from 'path';

export const parseAdInfoFromDirectory = (directory) => {
  const [adSize, adVariant] = basename(directory).split('-');
  const client = basename(dirname(dirname(directory)));
  const job = basename(dirname(directory));
  const width = parseInt(adSize.split('x')[0]);
  const height = parseInt(adSize.split('x')[1]);
  const variant = adVariant;
  const name = `${width}x${height}${variant ? `-${variant}` : ''}`;
  const fullName = `${basename(dirname(directory))}-${width}x${height}${
    variant ? `-${variant}` : ''
  }-html`;

  return {
    client,
    job,
    width,
    height,
    variant,
    name,
    fullName,
  };
};
