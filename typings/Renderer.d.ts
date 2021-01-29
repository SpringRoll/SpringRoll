import { Timedline } from './Localization';

export interface IRender {
  start: (args:TemplateVariables) => void;
  stop: () => void;
  lineBegin: (line:Timedline) => void;
  lineEnd: () => void;
}

export interface TemplateVariables {
    [key:string]: any
}

export class DOMRenderer {
  constructor(element : HTMLElement, templateVariables?: TemplateVariables);
  start(templateVariables?: TemplateVariables): void;
  stop(): void;
}

export class HtmlRenderer extends DOMRenderer implements IRender {
  lineBegin(line:Timedline): void;
  lineEnd(): void;
}
export class TextRenderer extends DOMRenderer implements IRender {
  sanitize(html: string): string;
  lineBegin(line:Timedline): void;
  lineEnd(): void;
}

export function TemplateRenderer(template: string, args: TemplateVariables): string;