import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('release checks pass for the current repository state', () => {
  const result = spawnSync(process.execPath, ['tools/run_release_checks.mjs'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
