import { describe, expect, test, beforeEach, it } from '@jest/globals';

import {Repick, Builder } from '../src';
import path from 'path';

describe('clone a repository from the sources', () => {
  let instance: Repick;
  beforeEach(() => {
    instance = new Repick();
  });

  it('clone a repository from Github', async () => {
    const builder = new Builder().setSource('ProxityStudios/typescript-starter').setDestination(path.resolve(__dirname, '..' , 'tmp', 'myapp')).setForce(true);
    
    const result = await instance.clone(builder);

    expect(result).toBeDefined();
    expect(result.destination).toBe(path.resolve(__dirname, "..", 'tmp', 'myapp'));
    expect(result.source).toBe('ProxityStudios/typescript-starter');
    expect(result.mode).toBe('tar');
    expect(result.force).toBe(true);
    expect(result.proxy).toBeUndefined();
  });
})
