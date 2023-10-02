///
/// Respect to the person I stole this from
/// https://stackoverflow.com/a/34749873
///


/**
 * Simple object check.
 */
function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep<T>(target: T, ...sources: T[]) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!(target as any)[key]) Object.assign(target as any, { [key]: {} });
        mergeDeep((target as any)[key], source[key]);
      } else {
        Object.assign(target as any, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}