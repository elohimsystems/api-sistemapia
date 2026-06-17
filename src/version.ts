import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const candidatos = [
  join(dirname(require.main?.filename || process.argv[1] || process.cwd()), 'package.json'),
  join(process.cwd(), 'package.json'),
];

let nombre = 'sistemapia-api';
let version = '1.0.0';

for (const rutaPkg of candidatos) {
  if (existsSync(rutaPkg)) {
    try {
      const pkg = JSON.parse(readFileSync(rutaPkg, 'utf-8'));
      nombre = pkg.name;
      version = pkg.version;
      break;
    } catch {
      // intenta el siguiente
    }
  }
}

export const APP_NAME = nombre;
export const APP_VERSION = process.env.APP_VERSION || version;
export const MIN_FLUTTER_VERSION = '1.0.0';
