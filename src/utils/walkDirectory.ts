import { join } from 'path';

import { Glob } from 'bun';

/**
 * Recursively walks through a directory and returns an array of file paths.
 *
 * @param root - The root directory to start the walk from.
 * @returns A promise that resolves to an array of file paths.
 */
export default async (root: string): Promise<string[]> => {
  const glob = new Glob('**/*');
  const filePaths: string[] = [];

  for await (const relativePath of glob.scan({ 'cwd': root, 'onlyFiles': true, 'dot': true }))
    filePaths.push(join(root, relativePath));

  return filePaths;
};
