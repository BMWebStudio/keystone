/** Read Keystone data-* values with legacy data-a11y-* fallback. */
export function readDataset(entry, keystoneKey, legacyKey) {
  if (!entry?.dataset) return null;
  return entry.dataset[keystoneKey] ?? entry.dataset[legacyKey] ?? null;
}

export function hasFlag(entry, keystoneAttr, legacyAttr) {
  if (!entry) return false;
  return entry.hasAttribute(keystoneAttr) || entry.hasAttribute(legacyAttr);
}

export function readScriptValue(script, name) {
  const camel = name[0].toUpperCase() + name.slice(1);
  return readDataset(script, `keystone${camel}`, `a11y${camel}`);
}

export function hasScriptFlag(script, name) {
  return (
    hasFlag(script, `data-keystone-${name}`, `data-a11y-${name}`) ||
    readScriptValue(script, name) != null
  );
}
