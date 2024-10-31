import path from 'node:path';
import spawn from 'cross-spawn';
import fs from 'fs-extra';
import { findTscPath } from '@/utils/ts';

export async function compile({
  cwd,
  outDir,
  esm = false,
  project = 'tsconfig.json',
  tsc,
}: {
  cwd: string;
  outDir: string;
  esm?: boolean;
  project?: string;
  tsc?: string;
}) {
  const tscPath = findTscPath(cwd, tsc);

  const outDirs = {
    cjs: path.join(outDir, 'cjs'),
    esm: path.join(outDir, 'esm'),
  };

  spawn.sync(
    tscPath,
    [
      '--pretty',
      '--incremental',
      '--declaration',
      '--declarationMap',
      '--noEmit',
      'false',
      '--noEmitOnError',
      'false',
      '--emitDeclarationOnly',
      '--project',
      project,
      '--outDir',
      outDirs.cjs,
    ],
    { stdio: 'inherit', cwd },
  );

  if (esm) {
    try {
      await fs.copy(outDirs.cjs, outDirs.esm);
    } catch {
      // Ignore
    }
    await fs.writeJSON(path.join(outDirs.cjs, 'package.json'), {
      type: 'commonjs',
    });
    await fs.writeJSON(path.join(outDirs.esm, 'package.json'), {
      type: 'module',
    });
  }
}

export default {
  compile,
};
