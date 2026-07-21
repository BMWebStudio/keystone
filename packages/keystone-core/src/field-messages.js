/** Default validation copy keyed by inferred field kind and rule. */
export const defaultFieldMessages = {
  name: {
    required: "Enter your name.",
    minLength: "Enter your full name.",
    maxLength: "Enter a shorter name.",
  },
  email: {
    required: "Enter your email address.",
    email: "Enter an email address in the format name@example.com.",
  },
  phone: {
    required: "Enter your phone number.",
    pattern: "Enter a valid phone number.",
    minLength: "Enter a complete phone number.",
  },
  company: {
    required: "Enter your company name.",
    minLength: "Enter your full company name.",
  },
  message: {
    required: "Enter your message.",
    minLength: "Enter a longer message.",
    maxLength: "Enter a shorter message.",
  },
  subject: {
    required: "Enter a subject.",
    minLength: "Enter a longer subject.",
  },
  url: {
    required: "Enter a website URL.",
    pattern: "Enter a valid website URL.",
  },
  address: {
    required: "Enter your address.",
    minLength: "Enter your full address.",
  },
  city: {
    required: "Enter your city.",
  },
  state: {
    required: "Enter your state or province.",
  },
  zip: {
    required: "Enter your ZIP or postal code.",
    pattern: "Enter a valid ZIP or postal code.",
  },
  password: {
    required: "Enter your password.",
    minLength: "Use a longer password.",
    pattern: "Use the requested password format.",
  },
};

const AUTOCOMPLETE_KIND = {
  email: "email",
  tel: "phone",
  "tel-national": "phone",
  "tel-local": "phone",
  name: "name",
  "given-name": "name",
  "family-name": "name",
  "additional-name": "name",
  "full-name": "name",
  "first-name": "name",
  "last-name": "name",
  "middle-name": "name",
  "nickname": "name",
  "username": "name",
  "display-name": "name",
  "street-address": "address",
  "address-line1": "address",
  "address-line2": "address",
  "address-level2": "city",
  "address-level1": "state",
  "postal-code": "zip",
  organization: "company",
  "organization-title": "company",
  url: "url",
};

const TYPE_KIND = {
  email: "email",
  tel: "phone",
  url: "url",
  password: "password",
};

const FIELD_ALIASES = {
  name: [
    "name",
    "fullname",
    "givenname",
    "familyname",
    "firstname",
    "lastname",
    "fname",
    "lname",
  ],
  email: ["email", "emailaddress", "mail"],
  phone: ["phone", "tel", "telephone", "mobile", "cell", "fax", "phonenumber"],
  company: ["company", "organization", "organisation", "org", "business", "employer"],
  message: [
    "message",
    "comment",
    "comments",
    "body",
    "inquiry",
    "enquiry",
    "notes",
    "note",
    "description",
  ],
  subject: ["subject", "topic", "title"],
  url: ["url", "website", "site", "homepage", "web"],
  address: ["address", "street", "streetaddress", "addr"],
  city: ["city", "locality", "town"],
  state: ["state", "province", "region"],
  zip: ["zip", "zipcode", "postal", "postalcode", "postcode"],
  password: ["password", "pass", "pwd"],
};

function normalizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function fieldTokens(field) {
  const tokens = [];
  if (field.name) tokens.push(normalizeToken(field.name));
  if (field.id) tokens.push(normalizeToken(field.id));
  return [...new Set(tokens.filter(Boolean))];
}

function tokenMatchesKind(token, aliases) {
  return aliases.some(
    (alias) => token === alias || token.endsWith(alias) || token.startsWith(alias),
  );
}

/**
 * Infer a common field kind from autocomplete, input type, name, or id.
 * @returns {keyof typeof defaultFieldMessages | null}
 */
export function inferFieldKind(field) {
  const autocomplete = field.getAttribute?.("autocomplete")?.split(/\s+/)[0]?.toLowerCase();
  if (autocomplete && AUTOCOMPLETE_KIND[autocomplete]) {
    return AUTOCOMPLETE_KIND[autocomplete];
  }

  if (field.type && TYPE_KIND[field.type]) {
    return TYPE_KIND[field.type];
  }

  const tokens = fieldTokens(field);
  for (const [kind, aliases] of Object.entries(FIELD_ALIASES)) {
    if (tokens.some((token) => tokenMatchesKind(token, aliases))) {
      return kind;
    }
  }

  return null;
}

import { readDataset } from "./attrs.js";

/**
 * Resolve the message for a failed rule.
 * Priority: data-keystone-message-* → data-a11y-message-* → field kind default → generic rule default.
 */
export function resolveFieldMessage(field, rule, config, genericMessages) {
  const ruleKey = `${rule[0].toUpperCase()}${rule.slice(1)}`;
  const keystoneMessage = readDataset(field, `keystoneMessage${ruleKey}`, `a11yMessage${ruleKey}`);
  if (keystoneMessage) return keystoneMessage;

  const kind = inferFieldKind(field);
  if (kind) {
    const fieldMessages =
      config.fieldMessages?.[kind] || defaultFieldMessages[kind];
    if (fieldMessages?.[rule]) return fieldMessages[rule];
  }

  return config.messages?.[rule] || genericMessages[rule];
}
