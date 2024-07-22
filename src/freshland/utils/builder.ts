import path from 'node:path';
import { FreshlandMode } from '../../root/types';

export class Builder {
  private mode: FreshlandMode;

  private proxy?: string;

  private force: boolean;

  private repository?: string;

  private destination?: string;

  constructor() {
    this.mode = 'tar';
    this.force = false;
  }

  public setProxy(proxy: string) {
    this.proxy = proxy;
    return this;
  }

  public setRepository(repository: string) {
    this.repository = repository;
    return this;
  }

  public setForce(force: boolean) {
    this.force = force;
    return this;
  }

  public setMode(mode: FreshlandMode) {
    this.mode = mode;
    return this;
  }

  public setDestination(destination: string) {
    this.destination = path.resolve(process.cwd(), destination);
    return this;
  }

  public useTemplate(template: 'typescript-starter') {
    // todo: get template from repo
    const templateURL = 'https://github.com/proxitystudios/typescript-starter';
    this.setRepository(templateURL);
    return this;
  }

  public toJSON(): BuilderData {
    if (!this.repository || !this.destination) throw new Error('Source or destination not set');

    return {
      mode: this.mode,
      proxy: this.proxy,
      force: this.force,
      source: this.repository,
      destination: this.destination,
    };
  }
}

export interface BuilderData {
  mode: FreshlandMode;
  proxy?: string;
  force: boolean;

  source: string;
  destination: string;
}
