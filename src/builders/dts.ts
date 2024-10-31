import del from 'del';
import ts from '@/compilers/ts';

export async function build({
  cwd,
  outDir,
  options = {},
}: {
  cwd: string;
  outDir: string;
  options?: {
    esm?: boolean;
    project?: string;
    tsc?: string;
  };
}) {
  await del([outDir]);

  await ts.compile({
    cwd: cwd,
    outDir: outDir,
    ...options,
  });
}

export default {
  build,
};
