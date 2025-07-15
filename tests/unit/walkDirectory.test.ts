import { describe, expect, it } from 'bun:test';

import walkDirectory from '../../src/utils/walkDirectory';
import { TestUtils } from '../helpers/test-utils';

describe('walkDirectory', () => {
  it('should return array of file paths', async () => {
    const testDir = await TestUtils.createTempDir();

    await Bun.write(`${testDir}/file1.ts`, 'export default {};');
    await Bun.write(`${testDir}/file2.js`, 'module.exports = {};');
    await Bun.write(`${testDir}/subdir/file3.ts`, 'export default {};');

    const files = await walkDirectory(testDir);

    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThan(0);

    const tsFiles = files.filter(file => file.endsWith('.ts'));
    const jsFiles = files.filter(file => file.endsWith('.js'));

    expect(tsFiles.length).toBeGreaterThan(0);
    expect(jsFiles.length).toBeGreaterThan(0);
  });

  it('should handle empty directory', async () => {
    const testDir = await TestUtils.createTempDir();
    const files = await walkDirectory(testDir);

    expect(Array.isArray(files)).toBe(true);

    expect(files.length).toBeLessThanOrEqual(1);
  });

  it('should handle non-existent directory', async () => {
    const nonExistentDir =
      process.platform === 'win32' ? 'C:\\path\\that\\does\\not\\exist' : '/path/that/does/not/exist';

    await expect(walkDirectory(nonExistentDir)).rejects.toThrow();
  });
});
