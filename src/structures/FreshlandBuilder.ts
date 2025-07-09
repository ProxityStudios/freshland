import path from 'node:path';
import { FreshlandMode, TemplateKeysWithS } from '../types';
import { getTemplateIfExistsOrThrow } from '../freshland/utils';

export class FreshlandBuilder {
  private mode: FreshlandMode;

  private proxy?: string;

  private force: boolean;

  private source?: string;

  private destination?: string;

  constructor() {
    this.mode = 'tar';
    this.force = false;
  }

  public setProxy(proxy: string) {
    this.proxy = proxy;
    return this;
  }

  public setSource(source: string) {
    this.source = source;
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

  public useTemplate(templateKey: TemplateKeysWithS) {
    const template = getTemplateIfExistsOrThrow(templateKey);
    this.setSource(template.uri);
    return this;
  }

  public toJSON(): FreshBuilderData {
    if (!this.source || !this.destination) throw new Error('Source or destination not set');

    return {
      mode: this.mode,
      proxy: this.proxy,
      force: this.force,
      source: this.source,
      destination: this.destination,
    };
  }
}

export interface FreshBuilderData {
  mode: FreshlandMode;
  proxy?: string;
  force: boolean;

  source: string;
  destination: string;
}
