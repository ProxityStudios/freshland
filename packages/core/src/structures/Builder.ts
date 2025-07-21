import { RepickError, type BuilderData, type BuildMode, type TemplateData } from '@repick/common';
import path from 'node:path';

export class Builder {
  private mode: BuildMode;

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

  public setMode(mode: BuildMode) {
    this.mode = mode;
    return this;
  }

  public setDestination(destination: string) {
    if (!path.isAbsolute(destination)) {
      throw new RepickError(
        'Destination path must be absolute. Use path.resolve() to set it.',
        'DESTINATION_NOT_ABSOLUTE'
      );
    }
    
    this.destination = destination
    return this;
  }

  public useTemplate(template: TemplateData) {
    // const template = getTemplateIfExistsOrThrow(templateKey);
    this.setSource(template.uri);
    return this;
  }

  public toJSON(): BuilderData {
    if (!this.source || !this.destination)
      throw new RepickError('Source or destination not set', 'MISSING_SOURCE_OR_DESTINATION');

    return {
      mode: this.mode,
      proxy: this.proxy,
      force: this.force,
      source: this.source,
      destination: this.destination,
    };
  }
}