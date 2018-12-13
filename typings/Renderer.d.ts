export interface IRender {
  start: Function;
  stop: Function;
  lineBegin: Function;
  lineEnd: Function;
}

export class DOMRenderer {
  start(templateVariables: object);
  stop();
}

export class HtmlRenderer extends DOMRenderer implements IRender {
  lineBegin: Function;
  lineEnd: Function;
}
export class TextRenderer extends DOMRenderer implements IRender {
  sanitize(html: string): string;
  lineBegin: Function;
  lineEnd: Function;
}

export function TemplateRenderer(template: string, args: object): string;

