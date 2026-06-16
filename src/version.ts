import { version, name } from '../package.json';

export const APP_NAME = name;
export const APP_VERSION = process.env.APP_VERSION || version;
export const MIN_FLUTTER_VERSION = '1.0.0';
