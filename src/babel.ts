import fs from 'node:fs';
import path from 'node:path';
import type { ConfigAPI, NodePath, PluginObj, PluginPass } from '@babel/core';
import type {
  ImportDeclaration,
  ExportAllDeclaration,
  ExportNamedDeclaration,
} from '@babel/types';

type Options = {
  /**
   * Extension to add to the imports
   * For commonjs use 'cjs' and for esm use 'mjs'
   * NodeJS requires explicit extension for esm
   * The `cjs` extension avoids disambiguity when package.json has "type": "module"
   */
  extension?: 'js' | 'cjs' | 'mjs';
  /**
   * Out of tree platforms to support
   * For `import './file'`, we skip adding extension if `file.${platform}.ts` exists
   * This is necessary for the platform specific extensions to be resolve correctly
   * Bundlers won't resolve the platform specific extension if explicit extension is present
   */
  platforms?: string[];
};

const isFile = (filename: string): boolean => {
  const exists =
    fs.lstatSync(filename, { throwIfNoEntry: false })?.isFile() ?? false;

  return exists;
};

const isDirectory = (filename: string): boolean => {
  const exists =
    fs.lstatSync(filename, { throwIfNoEntry: false })?.isDirectory() ?? false;

  return exists;
};

const isModule = (
  filename: string,
  extension: string,
  platforms: string[],
): boolean => {
  const exts = ['js', 'ts', 'jsx', 'tsx', extension];

  return exts.some(
    (ext) =>
      isFile(`${filename}.${ext}`) &&
      platforms.every((platform) => !isFile(`${filename}.${platform}.${ext}`)),
  );
};

const isTypeImport = (
  node: ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration,
) =>
  ('importKind' in node && node.importKind === 'type') ||
  ('exportKind' in node && node.exportKind === 'type');

const assertFilename: (
  filename: string | null | undefined,
) => asserts filename is string = (filename) => {
  if (filename == null) {
    throw new Error("Couldn't find a filename for the current file.");
  }
};

export default function (
  api: ConfigAPI,
  {
    extension,
    platforms = [
      'native',
      'android',
      'ios',
      'windows',
      'macos',
      'visionos',
      'web',
      'tv',
      'android.tv',
      'ios.tv',
    ],
  }: Options,
): PluginObj {
  api.assertVersion(7);

  function addExtension(
    {
      node,
    }: NodePath<
      ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration
    >,
    state: PluginPass,
  ) {
    if (
      extension == null ||
      // Skip type imports as they'll be removed
      isTypeImport(node) ||
      // Skip non-relative imports
      !node.source?.value.startsWith('.')
    ) {
      return;
    }

    assertFilename(state.filename);

    // Skip folder imports
    const filename = path.resolve(
      path.dirname(state.filename),
      node.source.value,
    );

    // Replace .ts extension with .js if file with extension is explicitly imported
    if (isFile(filename)) {
      node.source.value = node.source.value.replace(/\.tsx?$/, `.${extension}`);
      return;
    }

    // Add extension if .ts file or file with extension exists
    if (isModule(filename, extension, platforms)) {
      node.source.value += `.${extension}`;
      return;
    }

    // Expand folder imports to index and add extension
    if (
      isDirectory(filename) &&
      isModule(path.join(filename, 'index'), extension, platforms)
    ) {
      node.source.value = node.source.value.replace(
        /\/?$/,
        `/index.${extension}`,
      );
      return;
    }
  }

  return {
    name: '@acme/cx',
    visitor: {
      ImportDeclaration(path, state) {
        addExtension(path, state);
      },
      ExportNamedDeclaration(path, state) {
        addExtension(path, state);
      },
      ExportAllDeclaration(path, state) {
        addExtension(path, state);
      },
    },
  };
}
