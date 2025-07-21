export type URIType = `https://${string}` | `http://${string}`;

export interface CoreOptions {
  verbose: boolean;
  globalProxy?: string;
}

export type BuildMode = 'tar'; //| 'git';

export type Ref = {
  type: string;
  name?: string;
  hash: string;
};

export type RefArray = Ref[];

export interface PlatformSource {
  site: string;
  userName: string;
  repoName: string;
  ref: string;
  url: string;
  urlWithoutRepoAndUsername: string;
  ssh: string;
  subDirectory?: string;
  mode: string;
}

export type SupportedPlatformsType = Record<string, string>;

// TODO:
// export type TemplateKeys = keyof typeof templatesData;
export type TemplateKeysWithS =
  | 'javascript-starter'
  | 'typescript-starter'
  | 'discort-bot-starter-ts'
  | 'discort-bot-starter-js'
  | 'express-api-starter-ts'
  | (string & { __brand?: 'TemplateKeysWithS' });

export type CodeLanguage = 'typescript' | 'javascript'; // TODO:

export interface TemplatesRAWData {
  [key: string]: TemplateRAWData;
}

export interface TemplateRAWData {
  codeLanguage: CodeLanguage;
  displayName: string;
  // disabled: boolean;
  // description: string;
  uri: URIType;
}

export type Templates = TemplateData[];

export type TemplateData = TemplateRAWData & {
  name: string;
};

export interface BuilderData {
  mode: BuildMode;
  proxy?: string;
  force: boolean;

  source: string;
  destination: string;
}
