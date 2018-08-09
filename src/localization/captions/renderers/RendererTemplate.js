/**
 * TemplateRenderer accepts a string template e.g.`The ball is {{color}}` and a args object e.g. `{color: 'red'}`
 * and swaps out the placeholder inside the double brackets with the matching key inside the args object
 * @export
 * @param {string} template String template that will be rendered with the supplied arguments
 * @param {Object} args //An Object contain data to be inserted into the template This will match based on key values
 * @returns {string}
 */
export function TemplateRenderer(template, args) {
  return template.replace(
    /{{([a-zA-Z][A-Za-z0-9]*)}}/g,
    (_, key) => args[key] || _
  );
}
