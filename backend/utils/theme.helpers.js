/**
 * Tema visual configurable — ConfiguracionNegocio → variables CSS (--bc-*)
 */
const HEX_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const THEME_FIELDS = [
  'color_primario',
  'color_secundario',
  'color_fondo',
  'color_texto',
  'color_acento',
];

const FIELD_LABELS = {
  color_primario: 'Color primario',
  color_secundario: 'Color secundario',
  color_fondo: 'Color de fondo',
  color_texto: 'Color de texto',
  color_acento: 'Color de acento',
};

/**
 * @param {string|null|undefined} value
 * @returns {string|null} Hex #rrggbb en minúsculas
 */
function normalizeHexColor(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  let hex = value.trim();
  if (!hex) {
    return null;
  }

  if (!hex.startsWith('#')) {
    hex = `#${hex}`;
  }

  if (!HEX_REGEX.test(hex)) {
    return null;
  }

  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  return hex.toLowerCase();
}

/**
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }|null}
 */
function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) {
    return null;
  }

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

/**
 * @param {string} hexA
 * @param {string} hexB
 * @param {number} weightB 0–1
 * @returns {string|null}
 */
function mixHex(hexA, hexB, weightB = 0.5) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) {
    return null;
  }

  const w = Math.min(1, Math.max(0, weightB));
  const r = Math.round(a.r * (1 - w) + b.r * w);
  const g = Math.round(a.g * (1 - w) + b.g * w);
  const bl = Math.round(a.b * (1 - w) + b.b * w);

  return `#${[r, g, bl].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * @param {string} value
 * @param {string} fieldKey
 * @returns {{ valid: boolean, value: string|null, error?: string }}
 */
function validateThemeColor(value, fieldKey) {
  if (!value || !String(value).trim()) {
    return { valid: true, value: null };
  }

  const normalized = normalizeHexColor(value);
  if (!normalized) {
    const label = FIELD_LABELS[fieldKey] || fieldKey;
    return {
      valid: false,
      value: null,
      error: `${label} debe ser un color HEX válido (ej: #1a2b3c).`,
    };
  }

  return { valid: true, value: normalized };
}

/**
 * @param {object} datos
 * @returns {{ valid: boolean, errors: string[], sanitized: Record<string, string|null> }}
 */
exports.validateThemeColors = (datos) => {
  const errors = [];
  const sanitized = {};

  THEME_FIELDS.forEach((field) => {
    const result = validateThemeColor(datos[field], field);
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
    sanitized[field] = result.value;
  });

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * @param {object|null|undefined} row
 * @returns {boolean}
 */
exports.hasCustomTheme = (row) => {
  if (!row) {
    return false;
  }

  return THEME_FIELDS.some((field) => Boolean(normalizeHexColor(row[field])));
};

/**
 * @param {object|null|undefined} row
 * @returns {Record<string, string>|null}
 */
exports.buildThemeCssVars = (row) => {
  if (!row || !exports.hasCustomTheme(row)) {
    return null;
  }

  const primario = normalizeHexColor(row.color_primario);
  const secundario = normalizeHexColor(row.color_secundario);
  const fondo = normalizeHexColor(row.color_fondo);
  const texto = normalizeHexColor(row.color_texto);
  const acento = normalizeHexColor(row.color_acento);

  const ink = primario;
  const inkSoft = secundario || (primario ? mixHex(primario, '#000000', 0.18) : null);
  const paper = fondo;
  const text = texto || primario;
  const accent = acento || primario;

  const vars = {};

  if (ink) {
    vars['--bc-ink'] = ink;
    vars['--bc-border-strong'] = ink;
    vars['--color-primary'] = ink;
    vars['--bc-bg-inverse'] = ink;
  }

  if (inkSoft) {
    vars['--bc-ink-soft'] = inkSoft;
    vars['--color-primary-dark'] = inkSoft;
    vars['--color-primary-light'] = inkSoft;
  }

  if (paper) {
    vars['--bc-paper'] = paper;
    vars['--bc-bg'] = paper;
    vars['--color-bg'] = paper;
    vars['--color-bg-card'] = paper;
    vars['--color-bg-elevated'] = paper;
    vars['--bc-text-inverse'] = paper;
  }

  if (text) {
    vars['--bc-text'] = text;
    vars['--color-text'] = text;
    vars['--bc-gray-900'] = text;
  }

  if (accent) {
    vars['--bc-accent'] = accent;
    vars['--color-accent'] = accent;
  } else if (ink) {
    vars['--bc-accent'] = ink;
    vars['--color-accent'] = ink;
  }

  const baseText = text || ink;
  const baseFondo = paper || '#ffffff';

  if (baseText && baseFondo) {
    vars['--bc-text-muted'] = mixHex(baseText, baseFondo, 0.38);
    vars['--bc-text-subtle'] = mixHex(baseText, baseFondo, 0.58);
    vars['--bc-border'] = mixHex(baseText, baseFondo, 0.2);
    vars['--bc-gray-700'] = vars['--bc-text-muted'];
    vars['--bc-gray-500'] = vars['--bc-text-subtle'];
    vars['--bc-gray-300'] = vars['--bc-border'];
    vars['--bc-gray-100'] = mixHex(baseFondo, baseText, 0.05);
    vars['--bc-bg-alt'] = vars['--bc-gray-100'];
    vars['--color-text-muted'] = vars['--bc-text-muted'];
    vars['--color-text-subtle'] = vars['--bc-text-subtle'];
    vars['--color-border'] = vars['--bc-border'];
    vars['--color-surface'] = vars['--bc-gray-100'];
  }

  return vars;
};

/**
 * @param {object|null|undefined} row
 * @returns {string} Declaraciones CSS listas para :root (sin llaves)
 */
exports.buildThemeStyleBlock = (row) => {
  const vars = exports.buildThemeCssVars(row);
  if (!vars) {
    return '';
  }

  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
};

exports.normalizeHexColor = normalizeHexColor;
exports.THEME_FIELDS = THEME_FIELDS;
exports.FIELD_LABELS = FIELD_LABELS;
