import path from 'node:path';
import fs from 'fs-extra';
import { transformAsync } from '@babel/core';
import { RE_SOURCE_EXT, RE_MODULE_EXT } from '@/constants';

export async function compile({
  cwd,
  filePath,
  modules,
  srcDir,
  outDir,
  esm = false,
  babelrc = false,
  configFile = false,
  copyFlow,
  sourceMaps = true,
}: {
  cwd: string;
  filePath: string;
  modules: string | false;
  srcDir: string;
  outDir: string;
  esm?: boolean;
  babelrc?: boolean;
  configFile?: string | boolean;
  copyFlow?: boolean;
  sourceMaps?: boolean;
}) {
  const outputFilePath = path
    .join(outDir, path.relative(srcDir, filePath))
    .replace(RE_SOURCE_EXT, '.$1js');

  await fs.mkdirp(path.dirname(outputFilePath));

  if (!RE_SOURCE_EXT.test(filePath)) {
    fs.copy(filePath, outputFilePath);
    return;
  }

  const code = await fs.readFile(filePath, 'utf-8');

  const result = await transformAsync(code, {
    cwd: cwd,
    babelrc: babelrc,
    configFile: configFile,
    sourceMaps: sourceMaps,
    sourceRoot: path.relative(path.dirname(outputFilePath), srcDir),
    sourceFileName: path.relative(srcDir, filePath),
    filename: filePath,
    presets: !(babelrc || configFile)
      ? [
          [
            require.resolve('../../babel-preset'),
            {
              modules: RE_MODULE_EXT.test(filePath) ? 'preserve' : modules,
              extension: esm ? '.js' : undefined,
            },
          ],
        ]
      : [],
  });

  if (result == null) {
    throw new Error('Output code was null!');
  }

  if (sourceMaps && result.map) {
    const mapFilePath = outputFilePath + '.map';

    result.code += '\n//# sourceMappingURL=' + path.basename(mapFilePath);
    result.map.sourcesContent = undefined;

    await fs.writeJSON(mapFilePath, result.map);
  }

  await fs.writeFile(outputFilePath, result.code);

  if (copyFlow) {
    fs.copy(filePath, outputFilePath + '.flow');
  }
}

export default {
  compile,
};
