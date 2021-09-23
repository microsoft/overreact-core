import stringify from 'json-stable-stringify';

export function dataRefIdDecorator(prefix, locator) {
  return `${prefix}_${stringify(locator)}`;
}
