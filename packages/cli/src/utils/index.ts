import { RepickError, TemplateData, TemplateKeysWithS, TemplateRAWData, Templates, TemplatesRAWData } from '@repick/common';
import { TemplatesRAWDataPath } from '../paths';
import * as fs from 'node:fs';

export function getTemplates(): Templates {
  const templatesData: TemplatesRAWData = JSON.parse(fs.readFileSync(TemplatesRAWDataPath, 'utf-8'));
  if (!templatesData || typeof templatesData !== 'object') {
    throw new RepickError('Invalid templates data', 'INVALID_TEMPLATES_DATA');
  }

  const simplifiedTemplates: TemplateData[] = Object.entries<TemplateRAWData>(templatesData).map(([name, data]) => ({
    name,
    ...data,
  }));

  return simplifiedTemplates;
}

export function getTemplateIfExistsOrThrow(templateKey: TemplateKeysWithS) {
  const simplifiedTemplates = getTemplates();

  const foundTemplate = simplifiedTemplates.find((t) => t.name === templateKey);

  if (!foundTemplate) {
    throw new RepickError(`Invalid template ${String(templateKey)}`, 'INVALID_TEMPLATE');
  }

  return foundTemplate;
}