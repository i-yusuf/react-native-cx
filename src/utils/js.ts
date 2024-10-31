import path from 'node:path';
import fs from 'fs-extra';
import { RE_SOURCE_EXT } from '@/constants';

export function getOutputFilePath(
  srcDir: string,
  outDir: string,
  filePath: string,
) {
  return path
    .join(outDir, path.relative(srcDir, filePath))
    .replace(RE_SOURCE_EXT, '.$1js');
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
  await fs.remove(getOutputFilePath(srcDir, outDir, filePath));
  await fs.remove(getOutputMapFilePath(srcDir, outDir, filePath));
}

export default {
  getOutputFilePath,
  getOutputMapFilePath,
  removeFileOutputs,
};
