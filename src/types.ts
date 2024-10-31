type Output = 'cjs' | 'esm' | 'dts';

type JavaScriptOptions = {
  esm?: boolean;
  babelrc?: boolean;
  configFile?: string | boolean;
  copyFlow?: boolean;
  sourceMaps?: boolean;
};

type TypeScriptOptions = {
  esm?: boolean;
  project?: string;
  tsc?: string;
};

type OutputWithOptions =
  | ['cjs', JavaScriptOptions]
  | ['esm', JavaScriptOptions]
  | ['dts', TypeScriptOptions];

export type Config = {
  srcDir: string;
  outDir: string;
  outputs: (Output | OutputWithOptions)[];
  exclude?: string[];
};
