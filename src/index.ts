import path from 'path';
import chokidar from 'chokidar';
import yargs from 'yargs';
import config from '@/config';
import cjs from '@/builders/cjs';
import esm from '@/builders/esm';
import dts from '@/builders/dts';
import js from '@/compilers/js';
import ts from '@/compilers/ts';
import jsutils from '@/utils/js';
import tsuilts from '@/utils/ts';

const cwd = process.cwd();

yargs
  .command({
    command: 'build',
    handler: async () => {
      const {
        srcDir,
        outDir,
        outputs,
        exclude = ['**/__tests__/**', '**/__fixtures__/**', '**/__mocks__/**'],
      } = await config.load();

      for (const item of outputs) {
        const [output, options] = Array.isArray(item) ? item : [item];

        console.log(`Generating ${output} output.`);

        switch (output) {
          case 'cjs':
            await cjs.build({
              cwd: cwd,
              srcDir: path.resolve(cwd, srcDir),
              outDir: path.resolve(cwd, outDir, 'cjs'),
              exclude: exclude,
              options: options,
            });
            break;
          case 'esm':
            await esm.build({
              cwd: cwd,
              srcDir: path.resolve(cwd, srcDir),
              outDir: path.resolve(cwd, outDir, 'esm'),
              exclude: exclude,
              options: options,
            });
            break;
          case 'dts':
            await dts.build({
              cwd: cwd,
              outDir: path.resolve(cwd, outDir, 'dts'),
              options: options,
            });
            break;
          default:
            throw new Error(`Unknown output type!`);
        }
      }
    },
  })
  .command({
    command: 'start',
    handler: async () => {
      const {
        srcDir,
        outDir,
        outputs,
        exclude = ['**/__tests__/**', '**/__fixtures__/**', '**/__mocks__/**'],
      } = await config.load();

      console.log('Watching for changes...');

      const watcher = chokidar.watch(srcDir, {
        ignored: exclude,
        ignoreInitial: true,
        persistent: true,
      });

      watcher.on('all', async (event, filePath) => {
        if (['add', 'change'].includes(event)) {
          for (const item of outputs) {
            const [output, options] = Array.isArray(item) ? item : [item];

            console.log(`Generating ${output} output.`);

            switch (output) {
              case 'cjs':
                await js.compile({
                  cwd: cwd,
                  filePath: filePath,
                  modules: 'commonjs',
                  srcDir: path.resolve(cwd, srcDir),
                  outDir: path.resolve(cwd, outDir, 'cjs'),
                  ...options,
                });
                break;
              case 'esm':
                await js.compile({
                  cwd: cwd,
                  filePath: filePath,
                  modules: false,
                  srcDir: path.resolve(cwd, srcDir),
                  outDir: path.resolve(cwd, outDir, 'esm'),
                  ...options,
                });
                break;
              case 'dts':
                await ts.compile({
                  cwd: cwd,
                  outDir: path.resolve(cwd, outDir, 'dts'),
                  ...options,
                });
                break;
              default:
                throw new Error(`Unknown output type!`);
            }
          }
        }

        if (['unlink'].includes(event)) {
          for (const item of outputs) {
            const [output] = Array.isArray(item) ? item : [item];

            console.log(`Removing ${filePath} output.`);

            switch (output) {
              case 'cjs':
                await jsutils.removeFileOutputs(
                  path.resolve(cwd, srcDir),
                  path.resolve(cwd, outDir, 'cjs'),
                  filePath,
                );
                break;
              case 'esm':
                await jsutils.removeFileOutputs(
                  path.resolve(cwd, srcDir),
                  path.resolve(cwd, outDir, 'esm'),
                  filePath,
                );
                break;
              case 'dts':
                await tsuilts.removeFileOutputs(
                  path.resolve(cwd, srcDir),
                  path.resolve(cwd, outDir, 'dts'),
                  filePath,
                );
                break;
              default:
                throw new Error(`Unknown output type!`);
            }
          }
        }
      });
    },
  })
  .demandCommand()
  .recommendCommands()
  .strict()
  .parse();
