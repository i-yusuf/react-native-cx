import { cosmiconfig } from 'cosmiconfig';
import { type Config } from '@/types';

export async function load(): Promise<Config> {
  const explorer = cosmiconfig('cx');

  const result = await explorer.search();

  if (!result) {
    throw new Error('No config found!');
  }

  const error = check(result.config);

  if (error) {
    throw new Error(error);
  }

  return result.config as Config;
}

export function check(config: Config | null): string | undefined {
  if (!config) {
    return 'No config found!';
  }

  if (!config.outputs) {
    return 'No outputs found in config!';
  }

  if (!config.srcDir) {
    return 'No srcDir found in config!';
  }

  if (!config.outDir) {
    return 'No outDir found in config!';
  }
}

export default {
  load,
  check,
};
