import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const raiz = dirname(require.main?.filename || process.argv[1]);
const rutaPkg = join(raiz, 'package.json');

let nombre = 'sistemapia-api';
let version = '1.0.0';

if (existsSync(rutaPkg)) {
  try {
    const pkg = JSON.parse(readFileSync(rutaPkg, 'utf-8'));
    nombre = pkg.name;
    version = pkg.version;
  } catch {
    // usa valores por defecto
  }
}

export const APP_NAME = nombre;
export const APP_VERSION = process.env.APP_VERSION || version;
export const MIN_FLUTTER_VERSION = '1.0.0';
