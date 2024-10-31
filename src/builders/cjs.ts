import path from 'node:path';
import del from 'del';
import fs from 'fs-extra';
import glob from 'glob';
import js from '@/compilers/js';

export async function build({
  cwd,
  srcDir,
  outDir,
  exclude,
  options = {},
}: {
  cwd: string;
  srcDir: string;
  outDir: string;
  exclude: string[];
  options?: {
    esm?: boolean;
    babelrc?: boolean;
    configFile?: string | boolean;
    sourceMaps?: boolean;
    copyFlow?: boolean;
  };
}) {
  await del([outDir]);

  const files = glob.sync('**/*', {
    cwd: srcDir,
    absolute: true,
    nodir: true,
    ignore: exclude,
  });

  await fs.mkdirp(outDir);

  if (!options.esm) {
    await fs.writeJSON(path.join(outDir, 'package.json'), {
      type: 'commonjs',
    });
  }

  await Promise.all(
    files.map(async (filePath) => {
      await js.compile({
        cwd: cwd,
        filePath: filePath,
        modules: 'commonjs',
        srcDir: srcDir,
        outDir: outDir,
        ...options,
      });
    }),
  );
}

export default {
  build,
};
