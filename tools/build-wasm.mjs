import { spawnSync, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const sharedDir = path.resolve(process.cwd(), '../shared');
const outDir = path.resolve(process.cwd(), 'src/lib/wasm');

const check = spawnSync('wasm-pack', ['--version'], { shell: true });
if (check.status === 0) {
  console.log('[build-wasm] wasm-pack found. Building WASM from shared crate...');
  try {
    execSync(`wasm-pack build --target web --out-dir "${outDir}"`, {
      cwd: sharedDir,
      stdio: 'inherit',
      shell: true,
    });
  } catch (err) {
    if (fs.existsSync(path.join(outDir, 'onlinerpg_shared_bg.wasm'))) {
      console.warn('[build-wasm] wasm-pack failed, but prebuilt WASM exists. Proceeding with prebuilt WASM.');
    } else {
      throw err;
    }
  }
} else {
  console.log('[build-wasm] wasm-pack not found. Using prebuilt WASM in src/lib/wasm.');
  if (!fs.existsSync(outDir) || !fs.existsSync(path.join(outDir, 'onlinerpg_shared_bg.wasm'))) {
    console.error('[build-wasm] Error: prebuilt WASM files not found in src/lib/wasm!');
    process.exit(1);
  }
}
