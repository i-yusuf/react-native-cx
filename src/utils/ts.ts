import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import spawn from 'cross-spawn';
import { RE_SOURCE_EXT } from '@/constants';

export function findTscPath(cwd: string, tsc?: string) {
  let output;

  if (tsc) {
    output = path.resolve(cwd, tsc);
  } else {
    const pm = process.env.npm_execpath?.split('/').pop()?.includes('yarn')
      ? 'yarn'
      : 'npm';

    if (pm === 'yarn') {
      const result = spawn.sync('yarn', ['bin', 'tsc'], {
        stdio: 'pipe',
        encoding: 'utf-8',
        cwd,
      });

      output = result.stdout.trim();
    } else {
      output = path.resolve(cwd, 'node_modules', '.bin', 'tsc');
    }
  }

  if (os.platform() === 'win32' && !output.endsWith('.cmd')) {
    output += '.cmd';
  }

  return output;
}

export function getOutputFilePath(
  srcDir: string,
  outDir: string,
  filePath: string,
) {
  return path
    .join(outDir, path.relative(srcDir, filePath))
    .replace(RE_SOURCE_EXT, '.d.ts');
}

export function getOutputMapFilePath(
  srcDir: string,
  outDir: string,
  filePath: string,
) {
  const outputFilePath = getOutputFilePath(srcDir, outDir, filePath);
  return outputFilePath + '.map';
}

export async function removeFileOutputs(
  srcDir: string,
  outDir: string,
  filePath: string,
) {
  const outDirs = {
    cjs: path.join(outDir, 'cjs'),
    esm: path.join(outDir, 'esm'),
  };

  for (const outPath of Object.values(outDirs)) {
    await Promise.all([
      fs.remove(getOutputFilePath(srcDir, outPath, filePath)),
      fs.remove(getOutputMapFilePath(srcDir, outPath, filePath)),
    ]);
  }
}

export default {
  getOutputFilePath,
  getOutputMapFilePath,
  removeFileOutputs,
};
