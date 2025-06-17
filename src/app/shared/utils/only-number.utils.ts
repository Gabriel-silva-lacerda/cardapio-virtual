export function onlyNumber(object: any): boolean {
  const reg = new RegExp('^\\d+$');
  const controlIsValid = reg.test(object.toString());
  return controlIsValid;
}
