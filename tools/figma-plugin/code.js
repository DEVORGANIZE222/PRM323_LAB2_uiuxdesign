/*
 * CapstoneMatch DS Builder
 * Builds, inside the open Figma file:
 *   1. "04 Design System" – Variables (color, spacing, radius, size, typography, elevation),
 *      text styles and effect styles bound to those variables, plus a documentation board.
 *   2. "05 Components"    – the 9 required components (+ supporting ones), all Auto Layout,
 *      all variants, all fills/strokes/paddings/radii bound to the variables.
 *   3. "03 Final UI"      – SCR_01 → SCR_09 with every state variant next to its screen,
 *      built only from instances of page 05, plus a 412 dp width check.
 * Each step can be run on its own from the plugin menu (so the file history shows the work
 * in stages). Re-running step 1 updates variable values in place; step 3 rebuilds its section.
 */
'use strict';

const NS = 'capstonematch'; // shared plugin data namespace (works without a published plugin id)
const KEY = 'stage';
const PAGES = ['01 User Flow', '02 Wireframe', '03 Final UI', '04 Design System', '05 Components', '06 Prototype'];
const warnings = [];
function warn(msg) {
  if (warnings.length < 300) warnings.push(msg);
  console.warn('[CapstoneMatch] ' + msg);
}

/* ------------------------------------------------------------------------------------------
 * TOKENS  (corrected palette – every text/background pair measured against WCAG 2.1)
 * ---------------------------------------------------------------------------------------- */

// [name, hex, alpha, usage, Flutter mapping, [foreground, background] pair to report]
const COLORS = [
  ['primary', '#AD4A0A', 1, 'Primary CTA fill, selected border, links, active radio', 'ColorScheme.primary', ['on-primary', 'primary']],
  ['on-primary', '#FFFFFF', 1, 'Text and icons on primary', 'ColorScheme.onPrimary', ['on-primary', 'primary']],
  ['primary-pressed', '#8A3C08', 1, 'Pressed primary button', 'AppColors.primaryPressed', ['on-primary', 'primary-pressed']],
  ['primary-container', '#FFF1E8', 1, 'Selected card tint, nav indicator, unread item', 'ColorScheme.primaryContainer', ['primary', 'primary-container']],
  ['on-primary-container', '#5C2204', 1, 'Text and icons on primary-container', 'ColorScheme.onPrimaryContainer', ['on-primary-container', 'primary-container']],
  ['brand-orange', '#F27024', 1, 'FPT orange. Decorative only: never text, never a control', 'AppColors.brandOrange', ['brand-orange', 'surface']],
  ['background', '#F8F9FA', 1, 'Screen background (Scaffold)', 'ColorScheme.surface', ['on-surface', 'background']],
  ['surface', '#FFFFFF', 1, 'Cards, app bar, sheets, dialogs', 'ColorScheme.surfaceContainerLowest', ['on-surface', 'surface']],
  ['surface-variant', '#F1F3F4', 1, 'Pressed card / icon button, disabled field', 'ColorScheme.surfaceContainerHigh', ['on-surface-variant', 'surface-variant']],
  ['on-surface', '#1A1D1E', 1, 'Titles and body text', 'ColorScheme.onSurface', ['on-surface', 'surface']],
  ['on-surface-variant', '#596066', 1, 'Secondary text, inactive icons', 'ColorScheme.onSurfaceVariant', ['on-surface-variant', 'surface']],
  ['outline', '#737980', 1, 'Text-field border, radio outline, outlined button', 'ColorScheme.outline', ['outline', 'surface']],
  ['outline-variant', '#E1E3E5', 1, 'Dividers and card borders (decorative)', 'ColorScheme.outlineVariant', ['outline-variant', 'surface']],
  ['disabled-container', '#E1E3E5', 1, 'Disabled button fill', 'AppColors.disabledContainer', ['on-disabled', 'disabled-container']],
  ['on-disabled', '#5E6469', 1, 'Label on disabled fill', 'AppColors.onDisabled', ['on-disabled', 'disabled-container']],
  ['success', '#0A6E38', 1, 'Locked / confirmed / eligible', 'AppColors.success', ['success', 'success-container']],
  ['success-container', '#E6F4EA', 1, 'Success banner and badge fill', 'AppColors.successContainer', ['success', 'success-container']],
  ['warning', '#8F5400', 1, 'Deadline urgency, pending', 'AppColors.warning', ['warning', 'warning-container']],
  ['warning-container', '#FFF4E0', 1, 'Warning banner and badge fill', 'AppColors.warningContainer', ['warning', 'warning-container']],
  ['error', '#BA1A1A', 1, 'Validation error, destructive action', 'ColorScheme.error', ['error', 'error-container']],
  ['on-error', '#FFFFFF', 1, 'Text on error fill', 'ColorScheme.onError', ['on-error', 'error']],
  ['error-pressed', '#93000A', 1, 'Pressed destructive button', 'AppColors.errorPressed', ['on-error', 'error-pressed']],
  ['error-container', '#FDF2F2', 1, 'Error banner fill', 'ColorScheme.errorContainer', ['error', 'error-container']],
  ['info', '#1F5FA8', 1, 'Neutral information, voting status', 'AppColors.info', ['info', 'info-container']],
  ['info-container', '#E8F1FB', 1, 'Info banner and badge fill', 'AppColors.infoContainer', ['info', 'info-container']],
  ['tag-container', '#E9ECEF', 1, 'Tech tag / neutral badge fill', 'AppColors.tagContainer', ['on-tag', 'tag-container']],
  ['on-tag', '#343A40', 1, 'Tech tag text', 'AppColors.onTag', ['on-tag', 'tag-container']],
  ['inverse-surface', '#1A1D1E', 1, 'Snackbar fill', 'ColorScheme.inverseSurface', ['inverse-on-surface', 'inverse-surface']],
  ['inverse-on-surface', '#FFFFFF', 1, 'Snackbar text', 'ColorScheme.onInverseSurface', ['inverse-on-surface', 'inverse-surface']],
  ['inverse-primary', '#FFB68A', 1, 'Snackbar action', 'ColorScheme.inversePrimary', ['inverse-primary', 'inverse-surface']],
  ['skeleton', '#E9ECEF', 1, 'Skeleton placeholder blocks', 'AppColors.skeleton', null],
  ['scrim', '#1A1D1E', 0.5, 'Modal scrim behind dialogs (50%)', 'ColorScheme.scrim', null],
  ['shadow', '#000000', 0.16, 'Drop-shadow color for elevation', 'ColorScheme.shadow', null],
];

// Palette corrections made after measuring the original DESIGN.md colors.
const CONTRAST_FIXES = [
  ['primary (button fill)', '#F27024', '#AD4A0A', 'White label 2.95:1 → 5.58:1', 'Original claim of 4.8:1 was wrong; white on #F27024 fails AA (SC 1.4.3). #F27024 kept as brand-orange for decoration only.'],
  ['warning (countdown text)', '#B26A00', '#8F5400', 'On white 4.24:1 → 6.11:1', 'Deadline text is 14 sp body text, so it needs 4.5:1.'],
  ['success (on success-container)', '#0D8244', '#0A6E38', 'On #E6F4EA 4.31:1 → 5.60:1', '"Confirmed" / "Locked" badge label sits on the tinted fill, not on white.'],
  ['outline (text-field border)', '#E1E3E5', '#737980', 'On white 1.29:1 → 4.40:1', 'Input and radio boundaries are UI components (SC 1.4.11 needs 3:1). #E1E3E5 stays as outline-variant for decorative dividers.'],
  ['on-disabled (disabled label)', '#8E9192', '#5E6469', 'On #E1E3E5 2.47:1 → 4.66:1', 'Disabled controls are exempt, but the persona reads in sunlight; the label must still say what the button does.'],
];

// [collection, name, value, scopes, description]
const NUMBERS = [
  ['Spacing', 'space-4', 4, ['GAP'], 'Micro padding, badge vertical padding · AppSpacing.xs'],
  ['Spacing', 'space-8', 8, ['GAP'], 'Icon-to-text gap, chip gap · AppSpacing.sm'],
  ['Spacing', 'space-12', 12, ['GAP'], 'Compact card padding, list gap · AppSpacing.md'],
  ['Spacing', 'space-16', 16, ['GAP'], 'Screen margin, card padding · AppSpacing.lg'],
  ['Spacing', 'space-24', 24, ['GAP'], 'Section rhythm, dialog padding · AppSpacing.xl'],
  ['Spacing', 'space-32', 32, ['GAP'], 'Hero / empty-state padding · AppSpacing.xxl'],
  ['Radius', 'radius-sm', 8, ['CORNER_RADIUS'], 'Buttons, inputs, banners · BorderRadius.circular(8)'],
  ['Radius', 'radius-md', 12, ['CORNER_RADIUS'], 'Cards, bottom sheets · BorderRadius.circular(12)'],
  ['Radius', 'radius-lg', 16, ['CORNER_RADIUS'], 'Dialogs · BorderRadius.circular(16)'],
  ['Radius', 'radius-full', 999, ['CORNER_RADIUS'], 'Pills, avatars, icon buttons · StadiumBorder / CircleBorder'],
  ['Size', 'size-touch', 48, ['WIDTH_HEIGHT'], 'Minimum touch target 48×48 dp · kMinInteractiveDimension'],
  ['Size', 'size-button', 48, ['WIDTH_HEIGHT'], 'Button height · minimumSize: Size.fromHeight(48)'],
  ['Size', 'size-field', 48, ['WIDTH_HEIGHT'], 'Text-field container height'],
  ['Size', 'size-icon', 24, ['WIDTH_HEIGHT'], 'Default icon size · IconThemeData(size: 24)'],
  ['Size', 'size-icon-sm', 16, ['WIDTH_HEIGHT'], 'Icon inside badges and helper text'],
  ['Size', 'size-icon-lg', 48, ['WIDTH_HEIGHT'], 'Icon in empty / error illustrations'],
  ['Size', 'size-avatar', 40, ['WIDTH_HEIGHT'], 'Avatar diameter · CircleAvatar(radius: 20)'],
  ['Size', 'size-illustration', 96, ['WIDTH_HEIGHT'], 'Empty / error illustration circle'],
  ['Size', 'size-logo', 80, ['WIDTH_HEIGHT'], 'App logo on the sign-in screen'],
  ['Size', 'size-chip', 32, ['WIDTH_HEIGHT'], 'Visible chip height (touch area stays 48)'],
  ['Size', 'size-progress', 8, ['WIDTH_HEIGHT'], 'Team capacity progress bar height'],
  ['Size', 'size-status-bar', 24, ['WIDTH_HEIGHT'], 'System status bar (not built in Flutter)'],
  ['Size', 'size-app-bar', 64, ['WIDTH_HEIGHT'], 'AppBar toolbarHeight: 64'],
  ['Size', 'size-nav-bar', 80, ['WIDTH_HEIGHT'], 'NavigationBar height: 80'],
  ['Size', 'size-screen', 360, ['WIDTH_HEIGHT'], 'Baseline screen width (360 × 800 dp)'],
  ['Size', 'size-dialog', 312, ['WIDTH_HEIGHT'], 'Dialog width on 360 dp (screen − 2 × 24)'],
  ['Size', 'size-stroke', 1, ['STROKE_FLOAT'], 'Default border width'],
  ['Size', 'size-stroke-strong', 2, ['STROKE_FLOAT'], 'Focused field / selected card border'],
  ['Elevation', 'elevation-1-y', 1, ['EFFECT_FLOAT'], 'Level 1 shadow offset Y (Card elevation 1)'],
  ['Elevation', 'elevation-1-blur', 3, ['EFFECT_FLOAT'], 'Level 1 shadow blur'],
  ['Elevation', 'elevation-2-y', 2, ['EFFECT_FLOAT'], 'Level 2 shadow offset Y (bottom action bar, snackbar)'],
  ['Elevation', 'elevation-2-blur', 8, ['EFFECT_FLOAT'], 'Level 2 shadow blur'],
  ['Elevation', 'elevation-3-y', 6, ['EFFECT_FLOAT'], 'Level 3 shadow offset Y (dialogs)'],
  ['Elevation', 'elevation-3-blur', 16, ['EFFECT_FLOAT'], 'Level 3 shadow blur'],
];

const WEIGHTS = { regular: 'Regular', medium: 'Medium', semibold: 'Semi Bold', bold: 'Bold' };
const FAMILY = 'Inter';

// [key, style name, size, line height, weight, Flutter]
const TYPE = [
  ['display', 'Display', 28, 34, 'bold', 'textTheme.headlineMedium'],
  ['headline', 'Headline', 22, 28, 'semibold', 'textTheme.titleLarge'],
  ['title', 'Title', 18, 24, 'semibold', 'textTheme.titleMedium'],
  ['subtitle', 'Subtitle', 16, 22, 'semibold', 'textTheme.titleSmall (fontSize 16)'],
  ['body', 'Body', 14, 20, 'regular', 'textTheme.bodyMedium'],
  ['label', 'Label', 14, 20, 'medium', 'textTheme.labelLarge'],
  ['caption', 'Caption', 12, 16, 'regular', 'textTheme.bodySmall'],
];

const ELEVATIONS = [
  ['elevation-1', 'Elevation/1', 'Pressed card, app bar when content scrolls under it'],
  ['elevation-2', 'Elevation/2', 'Bottom action bar, snackbar'],
  ['elevation-3', 'Elevation/3', 'Dialogs and loading overlay'],
];

// Material Symbols (Apache 2.0) paths, 24×24 viewBox.
const ICONS = {
  'arrow-back': 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  'close': 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  'check': 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  'done-all': 'M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z',
  'check-circle': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  'error': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  'warning': 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  'info': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  'lock': 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  'person': 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  'person-add': 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  'group': 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  'home': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  'search': 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  'notifications': 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  'refresh': 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  'mail': 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  'schedule': 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  'hourglass': 'M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z',
  'star': 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  'add': 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  'more-vert': 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  'chevron-right': 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  'radio-unchecked': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  'radio-checked': 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  'cloud-off': 'M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z',
  'inbox': 'M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z',
  'signal': 'M2 22h20V2z',
  'wifi': 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z',
  'battery': 'M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z',
};

/* ------------------------------------------------------------------------------------------
 * RUNTIME REGISTRIES
 * ---------------------------------------------------------------------------------------- */
const T = {};      // raw number tokens by name
const CR = {};     // raw colors by name {r,g,b,a}
const V = {};      // Figma variables by name
const TS = {};     // text styles by key
const ES = {};     // effect styles by key
const FONT = {};   // weight key -> FontName
const ICON = {};   // icon components by name
const C = {};      // component sets / components by name

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
function lum(c) {
  const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function contrast(a, b) {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function grade(r, isUi) {
  if (r >= 7) return 'AAA';
  if (r >= 4.5) return 'AA';
  if (r >= 3) return isUi ? 'AA (UI ≥ 3:1)' : 'AA large only';
  return 'decorative only';
}
for (const c of COLORS) CR[c[0]] = Object.assign(hexToRgb(c[1]), { a: c[2] });
for (const n of NUMBERS) T[n[1]] = n[2];
for (const t of TYPE) { T['font-size-' + t[0]] = t[2]; T['line-height-' + t[0]] = t[3]; }

/* ------------------------------------------------------------------------------------------
 * LOW-LEVEL HELPERS
 * ---------------------------------------------------------------------------------------- */
function solid(name) {
  const c = CR[name];
  if (!c) { warn('unknown color ' + name); return { type: 'SOLID', color: { r: 1, g: 0, b: 1 } }; }
  const raw = { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a };
  if (!V[name]) return raw;
  try {
    const bound = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: 1 }, 'color', V[name]);
    return bound;
  } catch (e) {
    warn('paint ' + name + ': ' + e.message);
    return raw;
  }
}

function tokenValue(x) { return typeof x === 'string' ? T[x] : x; }

function setRaw(node, field, value) {
  if (field === 'width') node.resize(value, Math.max(node.height, 0.01));
  else if (field === 'height') node.resize(Math.max(node.width, 0.01), value);
  else node[field] = value;
}

function bind(node, field, token) {
  if (token === null || token === undefined) return;
  const value = tokenValue(token);
  if (value === undefined) { warn('unknown token ' + token); return; }
  try { setRaw(node, field, value); } catch (e) { warn('set ' + field + ' on ' + node.name + ': ' + e.message); }
  if (typeof token !== 'string' || !V[token]) return;
  try { node.setBoundVariable(field, V[token]); } catch (e) { warn('bind ' + field + '→' + token + ' on ' + node.name + ': ' + e.message); }
}

function pad(node, p) {
  let t, r, b, l;
  if (!Array.isArray(p)) { t = r = b = l = p; }
  else if (p.length === 2) { t = b = p[0]; r = l = p[1]; }
  else { t = p[0]; r = p[1]; b = p[2]; l = p[3]; }
  const sides = [['paddingTop', t], ['paddingRight', r], ['paddingBottom', b], ['paddingLeft', l]];
  for (const s of sides) {
    if (s[1] === 0 || s[1] === null || s[1] === undefined) node[s[0]] = 0;
    else bind(node, s[0], s[1]);
  }
}

function radius(node, token) {
  for (const f of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) bind(node, f, token);
}

function stroke(node, color, weightToken) {
  node.strokes = [solid(color)];
  node.strokeAlign = 'INSIDE';
  bind(node, 'strokeWeight', weightToken || 'size-stroke');
}

function fixW(node, w) {
  if (node.layoutMode === 'HORIZONTAL') node.primaryAxisSizingMode = 'FIXED';
  else if (node.layoutMode === 'VERTICAL') node.counterAxisSizingMode = 'FIXED';
  bind(node, 'width', w);
}
function fixH(node, h) {
  if (node.layoutMode === 'VERTICAL') node.primaryAxisSizingMode = 'FIXED';
  else if (node.layoutMode === 'HORIZONTAL') node.counterAxisSizingMode = 'FIXED';
  bind(node, 'height', h);
}

// Configure an existing frame/component as an Auto Layout container.
function al(n, o) {
  o = o || {};
  n.layoutMode = o.dir === 'h' ? 'HORIZONTAL' : 'VERTICAL';
  n.primaryAxisSizingMode = 'AUTO';
  n.counterAxisSizingMode = 'AUTO';
  n.itemSpacing = 0;
  n.paddingLeft = 0; n.paddingRight = 0; n.paddingTop = 0; n.paddingBottom = 0;
  n.fills = o.fill ? [solid(o.fill)] : [];
  n.strokes = [];
  n.clipsContent = !!o.clip;
  if (o.gap) bind(n, 'itemSpacing', o.gap);
  if (o.pad) pad(n, o.pad);
  if (o.align) n.counterAxisAlignItems = o.align;
  if (o.justify) n.primaryAxisAlignItems = o.justify;
  if (o.stroke) stroke(n, o.stroke, o.strokeW);
  if (o.dash) n.dashPattern = [6, 4];
  if (o.radius) radius(n, o.radius);
  if (o.w !== undefined) fixW(n, o.w);
  if (o.h !== undefined) fixH(n, o.h);
  return n;
}
function frame(name, o) { const f = figma.createFrame(); f.name = name; return al(f, o); }
function comp(name, o) { const c = figma.createComponent(); c.name = name; return al(c, o); }

function put(parent, child, w, h) {
  parent.appendChild(child);
  if (w) child.layoutSizingHorizontal = w;
  if (h) child.layoutSizingVertical = h;
  return child;
}

async function text(chars, style, color, o) {
  o = o || {};
  const spec = TYPE.find((t) => t[0] === style);
  const t = figma.createText();
  t.fontName = FONT[spec[4]];
  t.characters = chars;
  t.fontSize = spec[2];
  t.lineHeight = { value: spec[3], unit: 'PIXELS' };
  if (TS[style]) {
    try { await t.setTextStyleIdAsync(TS[style].id); } catch (e) { warn('text style ' + style + ': ' + e.message); }
  }
  t.fills = [solid(color || 'on-surface')];
  t.name = o.name || chars.slice(0, 32);
  if (o.center) t.textAlignHorizontal = 'CENTER';
  return t;
}
function truncate(t) {
  try { t.textTruncation = 'ENDING'; t.maxLines = 1; } catch (e) { warn('truncate: ' + e.message); }
}

async function applyEffect(node, key) {
  if (!ES[key]) return;
  try { await node.setEffectStyleIdAsync(ES[key].id); } catch (e) { warn('effect ' + key + ': ' + e.message); }
}

function paintVectors(node, color) {
  const kinds = ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON'];
  const list = node.findAll((n) => kinds.indexOf(n.type) >= 0);
  for (const v of list) v.fills = [solid(color)];
}

function icon(name, color, size) {
  if (!ICON[name]) { warn('icon missing ' + name); name = 'info'; }
  const i = ICON[name].createInstance();
  i.name = 'Icon';
  if (size && size !== 24) i.resize(size, size);
  if (color) paintVectors(i, color);
  return i;
}

function spinner(size, color) {
  const e = figma.createEllipse();
  e.name = 'Spinner';
  e.resize(size, size);
  e.arcData = { startingAngle: -Math.PI / 2, endingAngle: Math.PI, innerRadius: 0.8 };
  e.fills = [solid(color)];
  return e;
}

function rect(name, w, h, color, rad) {
  const r = figma.createRectangle();
  r.name = name;
  r.resize(w, h);
  r.fills = color ? [solid(color)] : [];
  if (rad) radius(r, rad);
  return r;
}

function tag(node, stage) { node.setSharedPluginData(NS, KEY, stage); return node; }

/* ---------------------------- components: create / instance -------------------------------- */
function variantOf(set, vp) {
  const found = set.children.find((ch) => {
    const v = ch.variantProperties || {};
    return Object.keys(vp).every((k) => v[k] === vp[k]);
  });
  if (!found) throw new Error('Variant not found: ' + set.name + ' ' + JSON.stringify(vp));
  return found;
}

function setProps(inst, props) {
  const defs = inst.componentProperties;
  const out = {};
  let iconOverride = null;
  for (const k of Object.keys(props)) {
    const full = Object.keys(defs).find((d) => d === k || d.split('#')[0] === k);
    if (!full && k === 'Icon' && ICON[props[k]]) { iconOverride = ICON[props[k]]; continue; }
    if (!full) { warn('property "' + k + '" not on ' + inst.name); continue; }
    let val = props[k];
    if (defs[full].type === 'INSTANCE_SWAP' && typeof val === 'string' && ICON[val]) val = ICON[val].id;
    out[full] = val;
  }
  if (Object.keys(out).length) inst.setProperties(out);
  if (iconOverride) {
    // Sets with a per-variant icon have no Icon property: override the nested icon instead,
    // after any variant switch (switching variant resets the icon to that variant's default).
    const layer = inst.findOne((n) => n.type === 'INSTANCE' && n.name === 'Icon' && !insideNestedInstance(n, inst));
    if (layer) layer.swapComponent(iconOverride); else warn('no Icon layer on ' + inst.name);
  }
  return inst;
}

function use(name, vp, props, layerName) {
  const s = C[name];
  if (!s) throw new Error('Component "' + name + '" not found – run step 2 first.');
  const main = s.type === 'COMPONENT_SET' ? variantOf(s, vp || {}) : s;
  const i = main.createInstance();
  i.name = layerName || name;
  if (props) setProps(i, props);
  return i;
}

function nested(inst, name) {
  return inst.findOne((n) => n.type === 'INSTANCE' && n.name === name);
}

const GRID_COLS = {}; // set id -> columns, so the grid can be recomputed once properties hide layers

function combine(list, name, cols) {
  const set = figma.combineAsVariants(list, figma.currentPage);
  set.name = name;
  set.fills = [];
  GRID_COLS[set.id] = cols || list.length;
  gridLayout(set, GRID_COLS[set.id]);
  return set;
}

function gridLayout(set, cols) {
  const kids = set.children.slice();
  const gap = 24, padding = 24;
  const colW = [], rowH = [];
  kids.forEach((k, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    colW[c] = Math.max(colW[c] || 0, k.width);
    rowH[r] = Math.max(rowH[r] || 0, k.height);
  });
  kids.forEach((k, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    let x = padding, y = padding;
    for (let j = 0; j < c; j++) x += colW[j] + gap;
    for (let j = 0; j < r; j++) y += rowH[j] + gap;
    k.x = x; k.y = y;
  });
  const w = colW.reduce((a, b) => a + b, 0) + gap * (colW.length - 1) + padding * 2;
  const h = rowH.reduce((a, b) => a + b, 0) + gap * (rowH.length - 1) + padding * 2;
  set.resizeWithoutConstraints(w, h);
}

function insideNestedInstance(node, top) {
  for (let p = node.parent; p && p !== top; p = p.parent) if (p.type === 'INSTANCE') return true;
  return false;
}

// Add a component property to a set and wire it to every matching layer in every variant.
// An instance-swap property has one default for the whole set, so it is only used on sets whose
// variants share an icon; Badge, Banner and Dialog keep a per-variant icon instead.
async function wire(owner, propName, type, def, layerName, field) {
  const key = owner.addComponentProperty(propName, type, def);
  const variants = owner.type === 'COMPONENT_SET' ? owner.children : [owner];
  for (const v of variants) {
    const layers = v.findAll((n) => n.name === layerName && !insideNestedInstance(n, v));
    for (const l of layers) {
      const refs = Object.assign({}, l.componentPropertyReferences || {});
      refs[field] = key;
      try { l.componentPropertyReferences = refs; } catch (e) { warn('wire ' + propName + ' on ' + v.name + ': ' + e.message); }
    }
  }
  return key;
}

/* ------------------------------------------------------------------------------------------
 * PAGES
 * ---------------------------------------------------------------------------------------- */
async function ensurePages() {
  for (let i = 0; i < PAGES.length; i++) {
    const want = PAGES[i];
    const prefix = want.slice(0, 2) + ' ';
    let page = figma.root.children.find((p) => p.name.trim().toLowerCase() === want.toLowerCase())
      || figma.root.children.find((p) => p.name.trim().indexOf(prefix) === 0);
    if (!page) {
      const blank = figma.root.children.find((p) => /^Page \d+$/.test(p.name));
      if (blank) {
        await blank.loadAsync();
        if (blank.children.length === 0) { blank.name = want; page = blank; }
      }
    }
    if (!page) { page = figma.createPage(); page.name = want; }
    figma.root.insertChild(i, page);
  }
}

async function gotoPage(name) {
  const prefix = name.slice(0, 2) + ' ';
  const page = figma.root.children.find((p) => p.name.trim() === name)
    || figma.root.children.find((p) => p.name.trim().indexOf(prefix) === 0);
  await figma.setCurrentPageAsync(page);
  return page;
}

function clearGenerated(page, stage) {
  for (const n of page.children.slice()) if (n.getSharedPluginData(NS, KEY) === stage) n.remove();
}

function rightEdge(page, stage) {
  let max = null;
  for (const n of page.children) {
    if (n.getSharedPluginData(NS, KEY) === stage) continue;
    max = Math.max(max === null ? -Infinity : max, n.x + n.width);
  }
  return max === null ? 0 : max + 400;
}

/* ------------------------------------------------------------------------------------------
 * STEP 0: fonts, variables, styles (idempotent – updates values in place)
 * ---------------------------------------------------------------------------------------- */
async function loadFonts() {
  for (const k of Object.keys(WEIGHTS)) {
    const fn = { family: FAMILY, style: WEIGHTS[k] };
    try { await figma.loadFontAsync(fn); } catch (e) { throw new Error('Cannot load font "' + FAMILY + ' ' + WEIGHTS[k] + '": ' + e.message); }
    FONT[k] = fn;
  }
}

async function ensureTokens() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();

  function collection(name, modeName) {
    let c = cols.find((x) => x.name === name);
    if (!c) { c = figma.variables.createVariableCollection(name); cols.push(c); }
    if (modeName && c.modes[0].name !== modeName) c.renameMode(c.modes[0].modeId, modeName);
    return c;
  }
  function variable(col, name, type, value, scopes, desc) {
    let v = vars.find((x) => x.name === name && x.variableCollectionId === col.id);
    if (v && v.resolvedType !== type) { warn('variable ' + name + ' has another type – skipped'); return; }
    if (!v) { v = figma.variables.createVariable(name, col, type); vars.push(v); }
    v.setValueForMode(col.modes[0].modeId, value);
    try { v.scopes = scopes; } catch (e) { warn('scopes ' + name + ': ' + e.message); }
    if (desc) v.description = desc;
    V[name] = v;
  }

  const color = collection('Color', 'Light');
  for (const c of COLORS) {
    const scopes = c[0] === 'shadow' ? ['EFFECT_COLOR'] : c[0] === 'scrim' ? ['FRAME_FILL', 'SHAPE_FILL'] : ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR'];
    variable(color, c[0], 'COLOR', CR[c[0]], scopes, c[3] + ' · Flutter: ' + c[4]);
  }
  for (const n of NUMBERS) variable(collection(n[0], 'Default'), n[1], 'FLOAT', n[2], n[3], n[4]);

  const typo = collection('Typography', 'Default');
  variable(typo, 'font-family', 'STRING', FAMILY, ['FONT_FAMILY'], 'Inter (Roboto fallback on Android) · ThemeData.fontFamily');
  for (const k of Object.keys(WEIGHTS)) variable(typo, 'font-weight-' + k, 'STRING', WEIGHTS[k], ['FONT_STYLE'], 'Font style ' + WEIGHTS[k]);
  for (const t of TYPE) {
    variable(typo, 'font-size-' + t[0], 'FLOAT', t[2], ['FONT_SIZE'], t[1] + ' size · ' + t[5]);
    variable(typo, 'line-height-' + t[0], 'FLOAT', t[3], ['LINE_HEIGHT'], t[1] + ' line height');
  }

  // Text styles bound to the typography variables.
  const textStyles = await figma.getLocalTextStylesAsync();
  for (const t of TYPE) {
    const name = 'CapstoneMatch/' + t[1];
    let s = textStyles.find((x) => x.name === name);
    if (!s) { s = figma.createTextStyle(); s.name = name; }
    s.fontName = FONT[t[4]];
    s.fontSize = t[2];
    s.lineHeight = { value: t[3], unit: 'PIXELS' };
    s.letterSpacing = { value: 0, unit: 'PIXELS' };
    s.description = t[2] + '/' + t[3] + ' ' + WEIGHTS[t[4]] + ' · Flutter ' + t[5];
    const binds = [['fontFamily', 'font-family'], ['fontStyle', 'font-weight-' + t[4]], ['fontSize', 'font-size-' + t[0]], ['lineHeight', 'line-height-' + t[0]]];
    for (const b of binds) {
      try { s.setBoundVariable(b[0], V[b[1]]); } catch (e) { warn('text style ' + name + ' ' + b[0] + ': ' + e.message); }
    }
    TS[t[0]] = s;
  }

  // Effect styles bound to the elevation variables.
  const effectStyles = await figma.getLocalEffectStylesAsync();
  ELEVATIONS.forEach((el, idx) => {
    const lvl = idx + 1;
    let s = effectStyles.find((x) => x.name === el[1]);
    if (!s) { s = figma.createEffectStyle(); s.name = el[1]; }
    let fx = {
      type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: CR.shadow.a }, offset: { x: 0, y: T['elevation-' + lvl + '-y'] },
      radius: T['elevation-' + lvl + '-blur'], spread: 0, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false,
    };
    try {
      fx = figma.variables.setBoundVariableForEffect(fx, 'color', V.shadow);
      fx = figma.variables.setBoundVariableForEffect(fx, 'offsetY', V['elevation-' + lvl + '-y']);
      fx = figma.variables.setBoundVariableForEffect(fx, 'radius', V['elevation-' + lvl + '-blur']);
    } catch (e) { warn('effect binding ' + el[1] + ': ' + e.message); }
    s.effects = [fx];
    s.description = el[2];
    ES[el[0]] = s;
  });
}

/* ------------------------------------------------------------------------------------------
 * STEP 1: page 04 – documentation board
 * ---------------------------------------------------------------------------------------- */
async function docSection(title, desc, width) {
  const s = frame(title, { dir: 'v', gap: 'space-24', pad: 'space-32', fill: 'surface', radius: 'radius-lg', stroke: 'outline-variant' });
  put(s, await text(title, 'display', 'on-surface'));
  if (desc) {
    const d = put(s, await text(desc, 'body', 'on-surface-variant', { name: 'Description' }));
    d.textAutoResize = 'HEIGHT';
    d.resize(width || 1100, d.height);
  }
  return s;
}

async function buildDesignSystemPage() {
  const page = await gotoPage('04 Design System');
  clearGenerated(page, 'ds');
  const root = tag(frame('Design System · CapstoneMatch', { dir: 'v', gap: 'space-32' }), 'ds');

  put(root, await docSection('04 Design System',
    'Every value below is a Figma Variable (collections: Color, Spacing, Radius, Size, Typography, Elevation). Text styles and effect styles are bound to those variables, and every component on page 05 binds its fills, strokes, padding, gaps, radii and sizes to them. Light theme; 360 × 800 dp baseline.'));

  // Colors
  const colors = await docSection('Color · Light mode', 'Corrected palette. The ratio under each swatch is measured for the pair it is actually used in (foreground on background).');
  const grid = frame('Swatches', { dir: 'h', gap: 'space-16' });
  put(colors, grid);
  for (const c of COLORS) {
    const card = frame(c[0], { dir: 'v', fill: 'surface', stroke: 'outline-variant', radius: 'radius-md', clip: true, w: 200 });
    put(grid, card);
    const sw = rect('Swatch', 200, 72, c[0]);
    put(card, sw, 'FILL');
    const info = frame('Info', { dir: 'v', gap: 'space-4', pad: 'space-12' });
    put(card, info, 'FILL');
    put(info, await text(c[0], 'label', 'on-surface'), 'FILL');
    put(info, await text(c[1] + (c[2] < 1 ? ' @ ' + Math.round(c[2] * 100) + '%' : ''), 'caption', 'on-surface-variant'), 'FILL');
    put(info, await text(c[3], 'caption', 'on-surface-variant'), 'FILL');
    put(info, await text(c[4], 'caption', 'on-surface-variant'), 'FILL');
    if (c[5]) {
      const ratio = contrast(CR[c[5][0]], CR[c[5][1]]);
      const isUi = c[0] === 'outline';
      put(info, await text(c[5][0] + ' on ' + c[5][1] + ': ' + ratio.toFixed(2) + ':1 · ' + grade(ratio, isUi), 'caption', 'on-surface'), 'FILL');
    }
  }
  fixW(grid, 1100);
  grid.layoutWrap = 'WRAP';
  bind(grid, 'counterAxisSpacing', 'space-16');
  put(root, colors);

  // Contrast fixes
  const fixes = await docSection('Contrast fixes (màu đã sửa)', 'Measured with the WCAG 2.1 relative-luminance formula. Left swatch is the original DESIGN.md value, right swatch is the variable now used everywhere.');
  const table = frame('Table', { dir: 'v', gap: 'space-8' });
  put(fixes, table);
  const header = frame('Header', { dir: 'h', gap: 'space-16', pad: ['space-8', 'space-12'], fill: 'surface-variant', radius: 'radius-sm' });
  put(table, header);
  const colW = [220, 130, 130, 220, 400];
  const heads = ['Token', 'Before', 'After', 'Ratio', 'Why'];
  for (let i = 0; i < heads.length; i++) {
    const h = put(header, await text(heads[i], 'label', 'on-surface'));
    h.textAutoResize = 'HEIGHT'; h.resize(colW[i], h.height);
  }
  for (const f of CONTRAST_FIXES) {
    const row = frame(f[0], { dir: 'h', gap: 'space-16', pad: ['space-8', 'space-12'], align: 'CENTER' });
    row.strokes = [solid('outline-variant')]; row.strokeBottomWeight = 1; row.strokeTopWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0;
    put(table, row);
    const t0 = put(row, await text(f[0], 'label', 'on-surface')); t0.textAutoResize = 'HEIGHT'; t0.resize(colW[0], t0.height);
    for (const pair of [[f[1], 1], [f[2], 2]]) {
      const chip = frame('Chip', { dir: 'h', gap: 'space-8', align: 'CENTER', w: colW[pair[1]] });
      const sw = figma.createRectangle(); sw.name = 'Swatch'; sw.resize(24, 24);
      const rgb = hexToRgb(pair[0]);
      if (pair[1] === 2) {
        const tokenName = COLORS.find((c) => c[1] === pair[0] && ['primary', 'warning', 'success', 'outline', 'on-disabled'].indexOf(c[0]) >= 0);
        sw.fills = [tokenName ? solid(tokenName[0]) : { type: 'SOLID', color: rgb }];
      } else {
        sw.fills = [{ type: 'SOLID', color: rgb }]; // historic value, documentation only
      }
      radius(sw, 'radius-sm');
      put(chip, sw);
      put(chip, await text(pair[0], 'body', 'on-surface'));
      put(row, chip);
    }
    const t3 = put(row, await text(f[3], 'body', 'on-surface')); t3.textAutoResize = 'HEIGHT'; t3.resize(colW[3], t3.height);
    const t4 = put(row, await text(f[4], 'body', 'on-surface-variant')); t4.textAutoResize = 'HEIGHT'; t4.resize(colW[4], t4.height);
  }
  put(root, fixes);

  // Typography
  const typo = await docSection('Typography', 'Inter, 7 text styles bound to Typography variables. Body text is never below 14 sp; 12 sp Caption is only for timestamps and metadata.');
  for (const t of TYPE) {
    const row = frame(t[1], { dir: 'h', gap: 'space-24', align: 'CENTER' });
    put(typo, row);
    const meta = frame('Meta', { dir: 'v', gap: 'space-4', w: 320 });
    put(row, meta);
    put(meta, await text('CapstoneMatch/' + t[1], 'label', 'on-surface'), 'FILL');
    put(meta, await text(t[2] + ' / ' + t[3] + ' · ' + WEIGHTS[t[4]] + ' · ' + t[5], 'caption', 'on-surface-variant'), 'FILL');
    put(row, await text(t[0] === 'caption' ? 'Submitted 2 h ago' : t[0] === 'body' ? 'The elected leader is the only member who can lock the roster.' : 'Elect Team Leader', t[0], 'on-surface'));
  }
  put(root, typo);

  // Spacing
  const spacing = await docSection('Spacing · 8-point grid', 'Bound to Auto Layout padding and gap (scope: Gap). Bars below are sized by the variables themselves.');
  for (const n of NUMBERS.filter((x) => x[0] === 'Spacing')) {
    const row = frame(n[1], { dir: 'h', gap: 'space-16', align: 'CENTER' });
    put(spacing, row);
    const l = put(row, await text(n[1] + ' = ' + n[2], 'label', 'on-surface')); l.textAutoResize = 'HEIGHT'; l.resize(160, l.height);
    const bar = rect('Bar', n[2], 16, 'primary', 'radius-sm');
    put(row, bar);
    bind(bar, 'width', n[1]);
    put(row, await text(n[4], 'caption', 'on-surface-variant'));
  }
  put(root, spacing);

  // Radius
  const radii = await docSection('Corner radius', null);
  const rrow = frame('Samples', { dir: 'h', gap: 'space-24' });
  put(radii, rrow);
  for (const n of NUMBERS.filter((x) => x[0] === 'Radius')) {
    const cell = frame(n[1], { dir: 'v', gap: 'space-8', w: 200 });
    put(rrow, cell);
    const sq = rect('Sample', 96, 96, 'primary-container', n[1]);
    sq.strokes = [solid('primary')]; sq.strokeWeight = 2;
    put(cell, sq);
    put(cell, await text(n[1] + ' = ' + n[2], 'label', 'on-surface'), 'FILL');
    put(cell, await text(n[4], 'caption', 'on-surface-variant'), 'FILL');
  }
  put(root, radii);

  // Elevation
  const elev = await docSection('Elevation', 'Effect styles whose offset, blur and color are bound to the Elevation variables and the shadow color variable.');
  const erow = frame('Samples', { dir: 'h', gap: 'space-32', pad: 'space-16', fill: 'background', radius: 'radius-md' });
  put(elev, erow);
  const level0 = frame('Elevation/0', { dir: 'v', gap: 'space-4', pad: 'space-16', fill: 'surface', radius: 'radius-md', stroke: 'outline-variant', w: 200 });
  put(erow, level0);
  put(level0, await text('Elevation/0', 'label', 'on-surface'), 'FILL');
  put(level0, await text('Cards at rest: border only, no shadow', 'caption', 'on-surface-variant'), 'FILL');
  for (const el of ELEVATIONS) {
    const card = frame(el[1], { dir: 'v', gap: 'space-4', pad: 'space-16', fill: 'surface', radius: 'radius-md', w: 200 });
    put(erow, card);
    await applyEffect(card, el[0]);
    put(card, await text(el[1], 'label', 'on-surface'), 'FILL');
    put(card, await text(el[2], 'caption', 'on-surface-variant'), 'FILL');
  }
  put(root, elev);

  // Sizes
  const sizes = await docSection('Size & touch targets', 'Every tappable element is at least size-touch (48 × 48 dp). Icon buttons are 48 dp even though the glyph is 24 dp.');
  const target = frame('Touch target demo', { dir: 'h', justify: 'CENTER', align: 'CENTER', stroke: 'primary', dash: true, radius: 'radius-full', w: 'size-touch', h: 'size-touch' });
  const glyph = rect('24 dp glyph', 24, 24, 'primary-container', 'radius-sm');
  bind(glyph, 'width', 'size-icon'); bind(glyph, 'height', 'size-icon');
  put(target, glyph);
  put(sizes, target);
  for (const n of NUMBERS.filter((x) => x[0] === 'Size')) {
    put(sizes, await text(n[1] + ' = ' + n[2] + '  ·  ' + n[4], 'body', 'on-surface'));
  }
  put(root, sizes);

  root.x = 0; root.y = 0;
  figma.viewport.scrollAndZoomIntoView([root]);
}

/* ------------------------------------------------------------------------------------------
 * STEP 2: page 05 – components
 * ---------------------------------------------------------------------------------------- */
async function buildIcons() {
  const board = frame('Icon set', { dir: 'h', gap: 'space-16' });
  for (const name of Object.keys(ICONS)) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="' + ICONS[name] + '" fill="#1A1D1E"/></svg>';
    const tmp = figma.createNodeFromSvg(svg);
    const c = figma.createComponent();
    c.name = 'Icon/' + name;
    c.resize(24, 24);
    c.fills = [];
    for (const ch of tmp.children.slice()) {
      c.appendChild(ch);
      try { ch.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; } catch (e) { /* ignore */ }
    }
    tmp.remove();
    paintVectors(c, 'on-surface');
    ICON[name] = c;
    const cell = frame(name, { dir: 'v', gap: 'space-8', align: 'CENTER', pad: 'space-8', w: 104 });
    put(cell, c);
    put(cell, await text(name, 'caption', 'on-surface-variant', { center: true }), 'FILL');
    put(board, cell);
  }
  fixW(board, 1100);
  board.layoutWrap = 'WRAP';
  bind(board, 'counterAxisSpacing', 'space-16');
  return board;
}

async function buildIconButton() {
  const list = [];
  for (const st of ['Default', 'Pressed']) {
    const c = comp('State=' + st, { dir: 'h', justify: 'CENTER', align: 'CENTER', radius: 'radius-full', fill: st === 'Pressed' ? 'surface-variant' : null, w: 'size-touch', h: 'size-touch' });
    put(c, icon('arrow-back', 'on-surface'));
    list.push(c);
  }
  const set = combine(list, 'Icon Button');
  await wire(set, 'Icon', 'INSTANCE_SWAP', ICON['arrow-back'].id, 'Icon', 'mainComponent');
  C['Icon Button'] = set;
  return set;
}

async function buildAvatar() {
  const a = comp('Type=Initials', { dir: 'h', justify: 'CENTER', align: 'CENTER', radius: 'radius-full', fill: 'primary-container', w: 'size-avatar', h: 'size-avatar' });
  put(a, await text('NM', 'label', 'on-primary-container', { name: 'Initials' }));
  const b = comp('Type=Open slot', { dir: 'h', justify: 'CENTER', align: 'CENTER', radius: 'radius-full', stroke: 'outline', dash: true, w: 'size-avatar', h: 'size-avatar' });
  put(b, icon('add', 'on-surface-variant', 20));
  const set = combine([a, b], 'Avatar');
  await wire(set, 'Initials', 'TEXT', 'NM', 'Initials', 'characters');
  C.Avatar = set;
  return set;
}

const TONES = {
  Neutral: ['tag-container', 'on-tag', 'info'],
  Primary: ['primary-container', 'on-primary-container', 'star'],
  Success: ['success-container', 'success', 'check-circle'],
  Warning: ['warning-container', 'warning', 'schedule'],
  Error: ['error-container', 'error', 'error'],
  Info: ['info-container', 'info', 'info'],
};

async function buildBadge() {
  const list = [];
  for (const tone of Object.keys(TONES)) {
    const t = TONES[tone];
    const c = comp('Tone=' + tone, { dir: 'h', gap: 'space-4', pad: ['space-4', 'space-8'], align: 'CENTER', radius: 'radius-full', fill: t[0] });
    put(c, icon(t[2], t[1], 16));
    put(c, await text(tone, 'label', t[1], { name: 'Label' }));
    list.push(c);
  }
  const set = combine(list, 'Badge', 3);
  await wire(set, 'Label', 'TEXT', 'Badge', 'Label', 'characters');
  await wire(set, 'Show icon', 'BOOLEAN', true, 'Icon', 'visible');
  C.Badge = set;
  return set;
}

const BUTTONS = {
  Primary: { Default: ['primary', 'on-primary'], Pressed: ['primary-pressed', 'on-primary'], Disabled: ['disabled-container', 'on-disabled'], Loading: ['primary', 'on-primary'] },
  Secondary: { Default: ['surface', 'primary', 'outline'], Pressed: ['primary-container', 'primary', 'outline'], Disabled: ['surface', 'on-disabled', 'outline-variant'], Loading: ['surface', 'primary', 'outline'] },
  Destructive: { Default: ['error', 'on-error'], Pressed: ['error-pressed', 'on-error'], Disabled: ['disabled-container', 'on-disabled'], Loading: ['error', 'on-error'] },
  Text: { Default: [null, 'primary'], Pressed: ['primary-container', 'primary'], Disabled: [null, 'on-disabled'], Loading: [null, 'primary'] },
};

async function buildButton() {
  const list = [];
  for (const type of Object.keys(BUTTONS)) {
    for (const st of ['Default', 'Pressed', 'Disabled', 'Loading']) {
      const spec = BUTTONS[type][st];
      const c = comp('Type=' + type + ', State=' + st, {
        dir: 'h', gap: 'space-8', pad: [0, type === 'Text' ? 'space-12' : 'space-24'], justify: 'CENTER', align: 'CENTER',
        radius: 'radius-sm', fill: spec[0], stroke: spec[2], h: 'size-button',
      });
      if (st === 'Loading') put(c, spinner(20, spec[1]));
      else put(c, icon('add', spec[1], 20));
      put(c, await text('Button', 'label', spec[1], { name: 'Label' }));
      list.push(c);
    }
  }
  const set = combine(list, 'Button', 4);
  await wire(set, 'Label', 'TEXT', 'Button', 'Label', 'characters');
  await wire(set, 'Show icon', 'BOOLEAN', false, 'Icon', 'visible');
  await wire(set, 'Icon', 'INSTANCE_SWAP', ICON.add.id, 'Icon', 'mainComponent');
  C.Button = set;
  return set;
}

async function buildTextField() {
  const S = {
    Default: { border: 'outline', w: 'size-stroke', value: 'e.g. SE182044', valueColor: 'on-surface-variant', helper: 'Your 8-character FPT student code', helperColor: 'on-surface-variant', fill: 'surface', label: 'on-surface' },
    Focused: { border: 'primary', w: 'size-stroke-strong', value: 'SE18', valueColor: 'on-surface', helper: 'Your 8-character FPT student code', helperColor: 'on-surface-variant', fill: 'surface', label: 'primary', caret: true },
    Filled: { border: 'outline', w: 'size-stroke', value: 'SE182044', valueColor: 'on-surface', helper: 'Your 8-character FPT student code', helperColor: 'on-surface-variant', fill: 'surface', label: 'on-surface' },
    Error: { border: 'error', w: 'size-stroke-strong', value: 'SE1820', valueColor: 'on-surface', helper: 'Student code must have 8 characters, e.g. SE182044', helperColor: 'error', fill: 'surface', label: 'error', error: true },
    Disabled: { border: 'outline-variant', w: 'size-stroke', value: 'SE182044', valueColor: 'on-disabled', helper: 'Locked after the roster is submitted', helperColor: 'on-disabled', fill: 'surface-variant', label: 'on-disabled' },
  };
  const list = [];
  for (const st of Object.keys(S)) {
    const s = S[st];
    const c = comp('State=' + st, { dir: 'v', gap: 'space-4', w: 328 });
    put(c, await text('Student code', 'label', s.label, { name: 'Label' }), 'FILL');
    const box = frame('Field', { dir: 'h', gap: 'space-8', pad: [0, 'space-16'], align: 'CENTER', radius: 'radius-sm', fill: s.fill, stroke: s.border, strokeW: s.w, h: 'size-field' });
    put(c, box, 'FILL');
    const lead = put(box, icon('search', 'on-surface-variant'));
    lead.name = 'Leading icon';
    const valueRow = frame('Value row', { dir: 'h', align: 'CENTER' });
    put(box, valueRow, 'FILL');
    put(valueRow, await text(s.value, 'body', s.valueColor, { name: 'Value' }));
    if (s.caret) { const caret = rect('Caret', 2, 20, 'primary'); put(valueRow, caret); }
    if (s.error) put(box, icon('error', 'error'));
    const help = frame('Helper row', { dir: 'h', gap: 'space-4', align: 'CENTER' });
    put(c, help, 'FILL');
    if (s.error) put(help, icon('error', 'error', 16));
    put(help, await text(s.helper, 'body', s.helperColor, { name: 'Helper' }), 'FILL');
    list.push(c);
  }
  const set = combine(list, 'Text Field', 5);
  await wire(set, 'Label', 'TEXT', 'Student code', 'Label', 'characters');
  await wire(set, 'Show leading icon', 'BOOLEAN', false, 'Leading icon', 'visible');
  await wire(set, 'Leading icon', 'INSTANCE_SWAP', ICON.search.id, 'Leading icon', 'mainComponent');
  C['Text Field'] = set;
  return set;
}

async function buildCard() {
  const list = [];
  const selectable = { Default: ['surface', 'outline-variant', 'size-stroke', 'radio-unchecked', 'outline'], Pressed: ['surface-variant', 'outline-variant', 'size-stroke', 'radio-unchecked', 'outline'], Selected: ['primary-container', 'primary', 'size-stroke-strong', 'radio-checked', 'primary'] };
  for (const st of Object.keys(selectable)) {
    const s = selectable[st];
    const c = comp('Type=Selectable, State=' + st, { dir: 'h', gap: 'space-12', pad: ['space-12', 'space-16'], align: 'CENTER', radius: 'radius-md', fill: s[0], stroke: s[1], strokeW: s[2], w: 328 });
    const av = put(c, use('Avatar', { Type: 'Initials' }, null, 'Avatar')); av.isExposedInstance = true;
    const col = frame('Text', { dir: 'v', gap: 'space-4' });
    put(c, col, 'FILL');
    const title = put(col, await text('Nguyen Van Minh', 'subtitle', 'on-surface', { name: 'Title' }), 'FILL'); truncate(title);
    const sub = put(col, await text('Backend · Spring Boot', 'body', 'on-surface-variant', { name: 'Subtitle' }), 'FILL'); truncate(sub);
    put(c, await text('1 vote', 'label', 'on-surface-variant', { name: 'Meta' }));
    const radio = put(c, icon(s[3], s[4])); radio.name = 'Radio';
    try { c.minHeight = 72; } catch (e) { /* older API */ }
    list.push(c);
  }
  {
    const c = comp('Type=Member, State=Default', { dir: 'h', gap: 'space-12', pad: ['space-12', 'space-16'], align: 'CENTER', radius: 'radius-md', fill: 'surface', stroke: 'outline-variant', w: 328 });
    const av = put(c, use('Avatar', { Type: 'Initials' }, null, 'Avatar')); av.isExposedInstance = true;
    const col = frame('Text', { dir: 'v', gap: 'space-4' });
    put(c, col, 'FILL');
    const title = put(col, await text('Nguyen Van Minh', 'subtitle', 'on-surface', { name: 'Title' }), 'FILL'); truncate(title);
    const sub = put(col, await text('SE182044 · Backend', 'body', 'on-surface-variant', { name: 'Subtitle' }), 'FILL'); truncate(sub);
    // Badge sits under the text so long names and roles keep the full width on 360 dp.
    const badge = put(col, use('Badge', { Tone: 'Success' }, { Label: 'Confirmed', Icon: 'check-circle' }, 'Badge')); badge.isExposedInstance = true;
    try { c.minHeight = 72; } catch (e) { /* older API */ }
    list.push(c);
  }
  {
    const c = comp('Type=Open slot, State=Default', { dir: 'h', gap: 'space-12', pad: ['space-12', 'space-16'], align: 'CENTER', radius: 'radius-md', stroke: 'outline', dash: true, w: 328 });
    put(c, use('Avatar', { Type: 'Open slot' }, null, 'Avatar'));
    const col = frame('Text', { dir: 'v', gap: 'space-4' });
    put(c, col, 'FILL');
    put(col, await text('Open slot', 'subtitle', 'on-surface-variant', { name: 'Title' }), 'FILL');
    put(col, await text('Looking for: Backend / DevOps', 'body', 'on-surface-variant', { name: 'Subtitle' }), 'FILL');
    try { c.minHeight = 72; } catch (e) { /* older API */ }
    list.push(c);
  }
  const notif = { Default: 'surface', Unread: 'primary-container', Pressed: 'surface-variant' };
  for (const st of Object.keys(notif)) {
    const c = comp('Type=Notification, State=' + st, { dir: 'v', gap: 'space-12', pad: 'space-16', radius: 'radius-md', fill: notif[st], stroke: st === 'Unread' ? 'primary' : 'outline-variant', w: 328 });
    const row = frame('Row', { dir: 'h', gap: 'space-12' });
    put(c, row, 'FILL');
    const lead = frame('Leading', { dir: 'h', justify: 'CENTER', align: 'CENTER', radius: 'radius-full', fill: 'info-container', w: 'size-avatar', h: 'size-avatar' });
    put(row, lead);
    const leadIcon = put(lead, icon('mail', 'info')); leadIcon.name = 'Leading icon';
    const col = frame('Text', { dir: 'v', gap: 'space-4' });
    put(row, col, 'FILL');
    const head = frame('Head', { dir: 'h', gap: 'space-8', align: 'CENTER' });
    put(col, head, 'FILL');
    put(head, await text('Team WEB-11 invited you', 'label', 'on-surface', { name: 'Title' }), 'FILL');
    if (st === 'Unread') put(head, use('Badge', { Tone: 'Primary' }, { Label: 'New', 'Show icon': false }, 'New badge'));
    put(col, await text('Join as Backend developer · 3/5 members', 'body', 'on-surface-variant', { name: 'Body' }), 'FILL');
    put(col, await text('5 min ago', 'caption', 'on-surface-variant', { name: 'Time' }), 'FILL');
    const actions = frame('Actions', { dir: 'h', gap: 'space-8' });
    put(c, actions, 'FILL');
    const decline = put(actions, use('Button', { Type: 'Secondary', State: 'Default' }, { Label: 'Decline' }, 'Decline'), 'FILL'); decline.isExposedInstance = true;
    const accept = put(actions, use('Button', { Type: 'Primary', State: 'Default' }, { Label: 'Accept' }, 'Accept'), 'FILL'); accept.isExposedInstance = true;
    list.push(c);
  }
  for (const st of ['Default', 'Pressed']) {
    const c = comp('Type=Info, State=' + st, { dir: 'h', gap: 'space-12', pad: 'space-16', radius: 'radius-md', fill: st === 'Pressed' ? 'surface-variant' : 'surface', stroke: 'outline-variant', w: 328 });
    const ic = put(c, icon('person-add', 'primary')); ic.name = 'Leading icon';
    const col = frame('Text', { dir: 'v', gap: 'space-8' });
    put(c, col, 'FILL');
    put(col, await text('Need 1 more member?', 'subtitle', 'on-surface', { name: 'Title' }), 'FILL');
    put(col, await text('Invite unassigned students from the Waiting Pool.', 'body', 'on-surface-variant', { name: 'Body' }), 'FILL');
    const action = put(col, use('Button', { Type: 'Secondary', State: 'Default' }, { Label: 'Invite from Waiting Pool' }, 'Action'), 'FILL'); action.isExposedInstance = true;
    list.push(c);
  }
  // Group card for SCR_03 Browse: capacity badge + 5 visual slots (filled vs dashed) + tech tags.
  for (const st of ['Default', 'Pressed']) {
    const c = comp('Type=Group, State=' + st, { dir: 'v', gap: 'space-12', pad: 'space-16', radius: 'radius-md', fill: st === 'Pressed' ? 'surface-variant' : 'surface', stroke: 'outline-variant', w: 328 });
    const head = frame('Head', { dir: 'h', gap: 'space-8', align: 'CENTER' });
    put(c, head, 'FILL');
    const title = put(head, await text('Team AI-04', 'subtitle', 'on-surface', { name: 'Title' }), 'FILL'); truncate(title);
    const badge = put(head, use('Badge', { Tone: 'Success' }, { Label: '2 open slots' }, 'Badge')); badge.isExposedInstance = true;
    put(c, await text('AI Healthcare Diagnostic Assistant', 'body', 'on-surface-variant', { name: 'Body' }), 'FILL');
    const slots = frame('Slots', { dir: 'h', gap: 'space-8' });
    put(c, slots, 'FILL');
    ['TH', 'LB', 'PH', null, null].forEach((ini, k) => {
      const a = use('Avatar', { Type: ini ? 'Initials' : 'Open slot' }, ini ? { Initials: ini } : null, 'Slot ' + (k + 1));
      put(slots, a);
    });
    const tags = frame('Tags', { dir: 'h', gap: 'space-8' });
    put(c, tags, 'FILL');
    ['Python', 'FastAPI', 'Flutter'].forEach((t, k) => put(tags, use('Badge', { Tone: 'Neutral' }, { Label: t, 'Show icon': false }, 'Tag ' + (k + 1))));
    const action = put(c, use('Button', { Type: 'Secondary', State: 'Default' }, { Label: 'View Details' }, 'Action'), 'FILL'); action.isExposedInstance = true;
    list.push(c);
  }
  const set = combine(list, 'Card', 3);
  await wire(set, 'Title', 'TEXT', 'Nguyen Van Minh', 'Title', 'characters');
  await wire(set, 'Subtitle', 'TEXT', 'Backend · Spring Boot', 'Subtitle', 'characters');
  await wire(set, 'Body', 'TEXT', 'Supporting text', 'Body', 'characters');
  await wire(set, 'Meta', 'TEXT', '1 vote', 'Meta', 'characters');
  await wire(set, 'Time', 'TEXT', '5 min ago', 'Time', 'characters');
  await wire(set, 'Show meta', 'BOOLEAN', true, 'Meta', 'visible');
  await wire(set, 'Show badge', 'BOOLEAN', true, 'Badge', 'visible');
  await wire(set, 'Show actions', 'BOOLEAN', false, 'Actions', 'visible');
  await wire(set, 'Show action', 'BOOLEAN', true, 'Action', 'visible');
  await wire(set, 'Icon', 'INSTANCE_SWAP', ICON['person-add'].id, 'Leading icon', 'mainComponent');
  C.Card = set;
  return set;
}

async function buildBanner() {
  const list = [];
  const tones = { Info: ['info-container', 'info', 'info'], Success: ['success-container', 'success', 'check-circle'], Warning: ['warning-container', 'warning', 'warning'], Error: ['error-container', 'error', 'error'] };
  for (const tone of Object.keys(tones)) {
    const t = tones[tone];
    const c = comp('Tone=' + tone, { dir: 'h', gap: 'space-12', pad: ['space-12', 'space-16'], radius: 'radius-sm', fill: t[0], stroke: t[1], w: 328 });
    put(c, icon(t[2], t[1]));
    const col = frame('Text', { dir: 'v', gap: 'space-4' });
    put(c, col, 'FILL');
    put(col, await text(tone + ' title', 'label', t[1], { name: 'Title' }), 'FILL');
    put(col, await text('Supporting message in plain language.', 'body', 'on-surface', { name: 'Body' }), 'FILL');
    list.push(c);
  }
  const set = combine(list, 'Banner', 2);
  await wire(set, 'Title', 'TEXT', 'Title', 'Title', 'characters');
  await wire(set, 'Body', 'TEXT', 'Supporting message in plain language.', 'Body', 'characters');
  await wire(set, 'Show body', 'BOOLEAN', true, 'Body', 'visible');
  C.Banner = set;
  return set;
}

const NAV = [['Home', 'home'], ['Browse', 'search'], ['My Group', 'group'], ['Alerts', 'notifications']];

async function buildNavigation() {
  const items = [];
  for (const st of ['Selected', 'Unselected']) {
    const sel = st === 'Selected';
    const c = comp('State=' + st, { dir: 'v', gap: 'space-4', pad: ['space-12', 0, 'space-16', 0], align: 'CENTER', w: 90, h: 'size-nav-bar' });
    const ind = frame('Indicator', { dir: 'h', justify: 'CENTER', align: 'CENTER', radius: 'radius-full', fill: sel ? 'primary-container' : null, w: 64, h: 32 });
    put(c, ind);
    put(ind, icon('home', sel ? 'on-primary-container' : 'on-surface-variant'));
    put(c, await text('Home', 'label', sel ? 'on-surface' : 'on-surface-variant', { name: 'Label', center: true }));
    items.push(c);
  }
  const itemSet = combine(items, 'Nav Item');
  await wire(itemSet, 'Label', 'TEXT', 'Home', 'Label', 'characters');
  await wire(itemSet, 'Icon', 'INSTANCE_SWAP', ICON.home.id, 'Icon', 'mainComponent');
  C['Nav Item'] = itemSet;

  const bars = [];
  for (const dest of NAV) {
    const c = comp('Selected=' + dest[0], { dir: 'h', fill: 'surface', w: 'size-screen', h: 'size-nav-bar' });
    c.strokes = [solid('outline-variant')]; c.strokeAlign = 'INSIDE';
    c.strokeTopWeight = 1; c.strokeBottomWeight = 0; c.strokeLeftWeight = 0; c.strokeRightWeight = 0;
    for (const d of NAV) {
      const it = use('Nav Item', { State: d[0] === dest[0] ? 'Selected' : 'Unselected' }, { Label: d[0], Icon: d[1] }, d[0]);
      put(c, it, 'FILL', 'FILL');
      paintVectors(it, d[0] === dest[0] ? 'on-primary-container' : 'on-surface-variant');
    }
    bars.push(c);
  }
  const set = combine(bars, 'Bottom Nav', 1);
  C['Bottom Nav'] = set;
  return [itemSet, set];
}

async function buildAppBar() {
  const list = [];
  for (const type of ['Default', 'Back', 'Actions']) {
    const c = comp('Type=' + type, { dir: 'h', gap: 'space-4', pad: [0, 'space-4', 0, type === 'Back' ? 'space-4' : 'space-16'], align: 'CENTER', fill: 'surface', w: 'size-screen', h: 'size-app-bar' });
    if (type === 'Back') { const b = put(c, use('Icon Button', { State: 'Default' }, { Icon: 'arrow-back' }, 'Back')); b.isExposedInstance = true; }
    const t = put(c, await text('Screen title', 'headline', 'on-surface', { name: 'Title' }), 'FILL'); truncate(t);
    if (type === 'Actions') {
      const a1 = put(c, use('Icon Button', { State: 'Default' }, { Icon: 'done-all' }, 'Action 1')); a1.isExposedInstance = true;
      const a2 = put(c, use('Icon Button', { State: 'Default' }, { Icon: 'more-vert' }, 'Action 2')); a2.isExposedInstance = true;
    }
    list.push(c);
  }
  const set = combine(list, 'App Bar', 1);
  await wire(set, 'Title', 'TEXT', 'Screen title', 'Title', 'characters');
  C['App Bar'] = set;
  return set;
}

async function buildDialog() {
  const list = [];
  const types = { Confirmation: ['info', 'primary', 'Primary', 'Confirm'], Destructive: ['warning', 'error', 'Destructive', 'Delete'] };
  for (const type of Object.keys(types)) {
    const t = types[type];
    const c = comp('Type=' + type, { dir: 'v', gap: 'space-16', pad: 'space-24', radius: 'radius-lg', fill: 'surface', w: 'size-dialog' });
    await applyEffect(c, 'elevation-3');
    put(c, icon(t[0], t[1]));
    put(c, await text('Dialog title', 'headline', 'on-surface', { name: 'Title' }), 'FILL');
    put(c, await text('Explain what will happen in plain language.', 'body', 'on-surface-variant', { name: 'Body' }), 'FILL');
    const actions = frame('Actions', { dir: 'v', gap: 'space-8' });
    put(c, actions, 'FILL');
    const confirm = put(actions, use('Button', { Type: t[2], State: 'Default' }, { Label: t[3] }, 'Confirm'), 'FILL'); confirm.isExposedInstance = true;
    const cancel = put(actions, use('Button', { Type: 'Secondary', State: 'Default' }, { Label: 'Cancel' }, 'Cancel'), 'FILL'); cancel.isExposedInstance = true;
    list.push(c);
  }
  const set = combine(list, 'Dialog');
  await wire(set, 'Title', 'TEXT', 'Dialog title', 'Title', 'characters');
  await wire(set, 'Body', 'TEXT', 'Explain what will happen in plain language.', 'Body', 'characters');
  C.Dialog = set;
  return set;
}

async function buildLoading() {
  const list = [];
  {
    const c = comp('Type=Skeleton', { dir: 'v', gap: 'space-12', w: 328 });
    for (let i = 0; i < 3; i++) {
      const row = frame('Skeleton row', { dir: 'h', gap: 'space-12', pad: 'space-16', align: 'CENTER', fill: 'surface', radius: 'radius-md' });
      put(c, row, 'FILL');
      const dot = figma.createEllipse(); dot.name = 'Avatar'; dot.resize(40, 40); dot.fills = [solid('skeleton')];
      bind(dot, 'width', 'size-avatar'); bind(dot, 'height', 'size-avatar');
      put(row, dot);
      const col = frame('Lines', { dir: 'v', gap: 'space-8' });
      put(row, col, 'FILL');
      const l1 = rect('Line 1', 180, 12, 'skeleton', 'radius-full'); put(col, l1, 'FILL'); bind(l1, 'height', 'space-12');
      const l2 = rect('Line 2', 120, 12, 'skeleton', 'radius-full'); put(col, l2); bind(l2, 'height', 'space-12');
    }
    list.push(c);
  }
  {
    const c = comp('Type=Spinner', { dir: 'v', gap: 'space-16', pad: 'space-24', align: 'CENTER', w: 328 });
    put(c, spinner(48, 'primary'));
    put(c, await text('Loading…', 'body', 'on-surface-variant', { name: 'Message', center: true }), 'FILL');
    list.push(c);
  }
  {
    const c = comp('Type=Overlay', { dir: 'v', gap: 'space-16', pad: 'space-24', align: 'CENTER', fill: 'surface', radius: 'radius-lg', w: 240 });
    await applyEffect(c, 'elevation-3');
    put(c, spinner(40, 'primary'));
    put(c, await text('Loading…', 'body', 'on-surface', { name: 'Message', center: true }), 'FILL');
    list.push(c);
  }
  const set = combine(list, 'Loading');
  await wire(set, 'Message', 'TEXT', 'Loading…', 'Message', 'characters');
  C.Loading = set;
  return set;
}

async function buildEmpty() {
  const list = [];
  {
    const c = comp('Layout=Screen', { dir: 'v', gap: 'space-16', pad: ['space-32', 'space-16'], align: 'CENTER', w: 328 });
    const circle = frame('Illustration', { dir: 'h', justify: 'CENTER', align: 'CENTER', radius: 'radius-full', fill: 'primary-container', w: 'size-illustration', h: 'size-illustration' });
    put(c, circle);
    put(circle, icon('inbox', 'primary', 48));
    put(c, await text('Nothing here yet', 'title', 'on-surface', { name: 'Title', center: true }), 'FILL');
    put(c, await text('Explain why it is empty and what to do next.', 'body', 'on-surface-variant', { name: 'Message', center: true }), 'FILL');
    const b = put(c, use('Button', { Type: 'Primary', State: 'Default' }, { Label: 'Take action' }, 'Action'), 'FILL'); b.isExposedInstance = true;
    list.push(c);
  }
  {
    const c = comp('Layout=Compact', { dir: 'h', gap: 'space-12', pad: 'space-16', align: 'CENTER', fill: 'surface', radius: 'radius-md', stroke: 'outline-variant', w: 328 });
    put(c, icon('inbox', 'on-surface-variant'));
    const col = frame('Text', { dir: 'v', gap: 'space-4' });
    put(c, col, 'FILL');
    put(col, await text('Nothing here yet', 'label', 'on-surface', { name: 'Title' }), 'FILL');
    put(col, await text('Explain why it is empty and what to do next.', 'body', 'on-surface-variant', { name: 'Message' }), 'FILL');
    const b = put(c, use('Button', { Type: 'Text', State: 'Default' }, { Label: 'Action' }, 'Action')); b.isExposedInstance = true;
    list.push(c);
  }
  const set = combine(list, 'Empty State');
  await wire(set, 'Title', 'TEXT', 'Nothing here yet', 'Title', 'characters');
  await wire(set, 'Message', 'TEXT', 'Explain why it is empty and what to do next.', 'Message', 'characters');
  await wire(set, 'Show action', 'BOOLEAN', true, 'Action', 'visible');
  await wire(set, 'Icon', 'INSTANCE_SWAP', ICON.inbox.id, 'Icon', 'mainComponent');
  C['Empty State'] = set;
  return set;
}

async function buildError() {
  const list = [];
  {
    const c = comp('Layout=Screen', { dir: 'v', gap: 'space-16', pad: ['space-32', 'space-16'], align: 'CENTER', w: 328 });
    const circle = frame('Illustration', { dir: 'h', justify: 'CENTER', align: 'CENTER', radius: 'radius-full', fill: 'error-container', w: 'size-illustration', h: 'size-illustration' });
    put(c, circle);
    put(circle, icon('cloud-off', 'error', 48));
    put(c, await text('Something went wrong', 'title', 'on-surface', { name: 'Title', center: true }), 'FILL');
    put(c, await text('Say what failed and why, in plain language.', 'body', 'on-surface-variant', { name: 'Cause', center: true }), 'FILL');
    const b = put(c, use('Button', { Type: 'Primary', State: 'Default' }, { Label: 'Try Again', 'Show icon': true, Icon: 'refresh' }, 'Retry'), 'FILL'); b.isExposedInstance = true;
    list.push(c);
  }
  {
    const c = comp('Layout=Inline', { dir: 'h', gap: 'space-12', pad: ['space-12', 'space-16'], align: 'CENTER', fill: 'error-container', radius: 'radius-sm', stroke: 'error', w: 328 });
    put(c, icon('error', 'error'));
    const col = frame('Text', { dir: 'v', gap: 'space-4' });
    put(c, col, 'FILL');
    put(col, await text('Something went wrong', 'label', 'error', { name: 'Title' }), 'FILL');
    put(col, await text('Say what failed and why, in plain language.', 'body', 'on-surface', { name: 'Cause' }), 'FILL');
    const b = put(c, use('Button', { Type: 'Text', State: 'Default' }, { Label: 'Retry' }, 'Retry')); b.isExposedInstance = true;
    list.push(c);
  }
  const set = combine(list, 'Error State');
  await wire(set, 'Title', 'TEXT', 'Something went wrong', 'Title', 'characters');
  await wire(set, 'Cause', 'TEXT', 'Say what failed and why, in plain language.', 'Cause', 'characters');
  C['Error State'] = set;
  return set;
}

async function buildTabs() {
  const labels = ['All', 'Invites', 'System'];
  const list = [];
  for (const selected of labels) {
    const c = comp('Selected=' + selected, { dir: 'h', radius: 'radius-full', stroke: 'outline', clip: true, w: 328, h: 'size-touch' });
    for (let i = 0; i < labels.length; i++) {
      const on = labels[i] === selected;
      const seg = frame(labels[i], { dir: 'h', gap: 'space-8', justify: 'CENTER', align: 'CENTER', fill: on ? 'primary-container' : null });
      if (i > 0) {
        seg.strokes = [solid('outline')]; seg.strokeAlign = 'INSIDE';
        seg.strokeLeftWeight = 1; seg.strokeTopWeight = 0; seg.strokeRightWeight = 0; seg.strokeBottomWeight = 0;
      }
      put(c, seg, 'FILL', 'FILL');
      if (on) put(seg, icon('check', 'on-primary-container', 18));
      put(seg, await text(labels[i], 'label', on ? 'on-primary-container' : 'on-surface', { name: 'Label' }));
    }
    list.push(c);
  }
  const set = combine(list, 'Segmented Tabs', 1);
  C['Segmented Tabs'] = set;
  return set;
}

async function buildSnackbar() {
  const list = [];
  for (const type of ['Default', 'With action']) {
    const c = comp('Type=' + type, { dir: 'h', gap: 'space-8', pad: [0, type === 'Default' ? 'space-16' : 'space-4', 0, 'space-16'], align: 'CENTER', fill: 'inverse-surface', radius: 'radius-sm', w: 328, h: 'size-touch' });
    await applyEffect(c, 'elevation-2');
    put(c, await text('Invite declined', 'body', 'inverse-on-surface', { name: 'Message' }), 'FILL');
    if (type === 'With action') {
      const a = frame('Action', { dir: 'h', justify: 'CENTER', align: 'CENTER', pad: [0, 'space-12'], radius: 'radius-sm', h: 'size-touch' });
      put(c, a);
      put(a, await text('Undo', 'label', 'inverse-primary', { name: 'Action label' }));
    }
    list.push(c);
  }
  const set = combine(list, 'Snackbar', 1);
  await wire(set, 'Message', 'TEXT', 'Invite declined', 'Message', 'characters');
  await wire(set, 'Action', 'TEXT', 'Undo', 'Action label', 'characters');
  C.Snackbar = set;
  return set;
}

async function buildStatusBar() {
  const c = comp('Status Bar', { dir: 'h', pad: [0, 'space-16'], justify: 'SPACE_BETWEEN', align: 'CENTER', w: 'size-screen', h: 'size-status-bar' });
  put(c, await text('9:41', 'label', 'on-surface', { name: 'Time' }));
  const right = frame('System icons', { dir: 'h', gap: 'space-4', align: 'CENTER' });
  put(c, right);
  for (const n of ['signal', 'wifi', 'battery']) put(right, icon(n, 'on-surface', 16));
  C['Status Bar'] = c;
  return c;
}

async function buildChip() {
  const list = [];
  for (const st of ['Selected', 'Unselected']) {
    const on = st === 'Selected';
    // Outer frame keeps the 48 dp touch target; the visible pill is size-chip (32).
    const c = comp('State=' + st, { dir: 'h', align: 'CENTER', h: 'size-touch' });
    const pill = frame('Pill', { dir: 'h', gap: 'space-4', pad: [0, 'space-12'], align: 'CENTER', radius: 'radius-full', fill: on ? 'primary-container' : 'surface', stroke: on ? 'primary' : 'outline', h: 'size-chip' });
    put(c, pill);
    if (on) put(pill, icon('check', 'on-primary-container', 18));
    put(pill, await text('Filter', 'label', on ? 'on-primary-container' : 'on-surface', { name: 'Label' }));
    list.push(c);
  }
  const set = combine(list, 'Chip');
  await wire(set, 'Label', 'TEXT', 'Filter', 'Label', 'characters');
  C.Chip = set;
  return set;
}

async function buildProgress() {
  const list = [];
  for (const tone of ['Warning', 'Success']) {
    const c = comp('Tone=' + tone, { dir: 'h', radius: 'radius-full', fill: 'skeleton', clip: true, w: 328, h: 'size-progress' });
    const bar = rect('Bar', 197, T['size-progress'], tone === 'Warning' ? 'warning' : 'success', 'radius-full');
    put(c, bar);
    bind(bar, 'height', 'size-progress');
    list.push(c);
  }
  const set = combine(list, 'Progress');
  C.Progress = set;
  return set;
}

const COMPONENT_DOCS = [
  ['Icons', 'Material Symbols as components (Icon/…). Vectors are filled with Color variables; instances recolor per context. Used through Instance Swap properties.', 'Icon(Icons.…, size: 24)'],
  ['Icon Button', 'State: Default, Pressed. 48 × 48 dp touch target around a 24 dp glyph. Property: Icon (swap).', 'IconButton'],
  ['Avatar', 'Type: Initials, Open slot (dashed, "+"). Property: Initials.', 'CircleAvatar'],
  ['Badge', 'Tone: Neutral, Primary, Success, Warning, Error, Info. Always icon + text, never color alone (WCAG 1.4.1). Properties: Label, Show icon. Icon follows Tone (swap the nested Icon layer to override).', 'Chip / custom StatusBadge'],
  ['Button', '① Type: Primary, Secondary (outlined), Destructive, Text × State: Default, Pressed, Disabled, Loading. Height = size-button (48). Properties: Label, Show icon, Icon.', 'FilledButton / OutlinedButton / FilledButton(error) / TextButton'],
  ['Text Field', '② State: Default, Focused, Filled, Error, Disabled. Error shows icon + message, not only a red border. Properties: Label, Show leading icon, Leading icon.', 'TextFormField + InputDecoration(OutlineInputBorder)'],
  ['Card', '③ Type: Selectable (Default, Pressed, Selected), Member, Open slot, Notification (Default, Unread, Pressed), Info (Default, Pressed), Group (Default, Pressed: capacity badge, 5 visual slots, tags). Min height 72. Properties: Title, Subtitle, Body, Meta, Time, Show meta/badge/actions/action, Icon.', 'Card + InkWell / ListTile'],
  ['Banner', 'Tone: Info, Success, Warning, Error. Inline status message above content. Properties: Title, Body, Show body. Icon follows Tone.', 'MaterialBanner-style Container'],
  ['Navigation', '④ Nav Item (State: Selected, Unselected) and Bottom Nav (Selected: Home, Browse, My Group, Alerts). Selected = indicator pill + dark label, not color only.', 'NavigationBar + NavigationDestination'],
  ['App Bar', '⑤ Type: Default, Back, Actions (two icon actions). Height 64. Property: Title.', 'AppBar(toolbarHeight: 64)'],
  ['Dialog', '⑥ Type: Confirmation, Destructive. Buttons stacked full width (confirm on top) so long labels never truncate on 360 dp. Properties: Title, Body. Icon follows Type (info / warning).', 'AlertDialog'],
  ['Loading', '⑦ Type: Skeleton (list), Spinner (inline), Overlay (blocking action). Property: Message.', 'Shimmer skeleton / CircularProgressIndicator'],
  ['Empty State', '⑧ Layout: Screen, Compact. Illustration icon + message + one action. Properties: Title, Message, Show action, Icon.', 'Column(Icon, Text, FilledButton)'],
  ['Error State', '⑨ Layout: Screen, Inline. Message, cause in plain language, retry action. Properties: Title, Cause.', 'Column(Icon, Text, FilledButton.icon)'],
  ['Segmented Tabs', 'Selected: All, Invites, System. Check icon marks the selected segment.', 'SegmentedButton<NotificationFilter>'],
  ['Snackbar', 'Type: Default, With action (Undo). Properties: Message, Action.', 'SnackBar(action: SnackBarAction)'],
  ['Status Bar', 'Device chrome for mock-ups only.', '— (system UI)'],
  ['Chip', 'State: Selected, Unselected. Visible pill is size-chip (32) inside a 48 dp touch area; selected adds a check icon. Property: Label.', 'FilterChip'],
  ['Progress', 'Tone: Warning (< 4 members), Success (4–5 members). Paired with an "N of 5 members" label, never color alone.', 'LinearProgressIndicator'],
];

async function buildComponentsPage() {
  const page = await gotoPage('05 Components');
  await page.loadAsync();
  if (page.children.some((n) => n.getSharedPluginData(NS, KEY) === 'components')) {
    await loadComponents();
    figma.notify('Page 05 already has the components – kept them (delete the board to rebuild).');
    return false;
  }
  const root = tag(frame('Components · CapstoneMatch', { dir: 'v', gap: 'space-32' }), 'components');
  root.x = 0; root.y = 0;

  async function section(docIndex, nodes) {
    const d = COMPONENT_DOCS[docIndex];
    const s = await docSection(d[0], d[1] + '\nFlutter: ' + d[2], 1100);
    for (const n of [].concat(nodes)) {
      if (n.type === 'COMPONENT_SET') gridLayout(n, GRID_COLS[n.id]);
      put(s, n);
    }
    put(root, s);
  }

  await section(0, await buildIcons());
  await section(1, await buildIconButton());
  await section(2, await buildAvatar());
  await section(3, await buildBadge());
  await section(4, await buildButton());
  await section(5, await buildTextField());
  await section(6, await buildCard());
  await section(7, await buildBanner());
  await section(8, await buildNavigation());
  await section(9, await buildAppBar());
  await section(10, await buildDialog());
  await section(11, await buildLoading());
  await section(12, await buildEmpty());
  await section(13, await buildError());
  await section(14, await buildTabs());
  await section(15, await buildSnackbar());
  await section(16, await buildStatusBar());
  await section(17, await buildChip());
  await section(18, await buildProgress());

  const ids = { icons: {}, components: {} };
  for (const k of Object.keys(ICON)) ids.icons[k] = ICON[k].id;
  for (const k of Object.keys(C)) ids.components[k] = C[k].id;
  figma.root.setSharedPluginData(NS, 'ids', JSON.stringify(ids));
  figma.viewport.scrollAndZoomIntoView([root]);
  return true;
}

async function loadComponents() {
  if (Object.keys(C).length) return;
  const raw = figma.root.getSharedPluginData(NS, 'ids');
  if (!raw) throw new Error('No components yet – run "2 · Components" first.');
  const ids = JSON.parse(raw);
  for (const k of Object.keys(ids.icons)) {
    const n = await figma.getNodeByIdAsync(ids.icons[k]);
    if (n) ICON[k] = n;
  }
  for (const k of Object.keys(ids.components)) {
    const n = await figma.getNodeByIdAsync(ids.components[k]);
    if (!n) throw new Error('Component "' + k + '" was deleted – restore it or rebuild page 05.');
    C[k] = n;
  }
}

/* ------------------------------------------------------------------------------------------
 * STEP 3: page 03 – SCR_06 → SCR_09 final UI with state variants
 * ---------------------------------------------------------------------------------------- */
const MEMBERS = [
  { i: 'NM', name: 'Nguyen Van Minh', id: 'SE182044', role: 'Backend · Spring Boot' },
  { i: 'TH', name: 'Tran Thu Ha', id: 'SE182117', role: 'Mobile · Flutter' },
  { i: 'LB', name: 'Le Quoc Bao', id: 'SE182356', role: 'AI / ML · Python' },
  { i: 'PH', name: 'Pham Gia Huy', id: 'SE182401', role: 'DevOps · Cloud' },
];

async function screenFrame(title, state, o) {
  const f = frame(title + ' / ' + state, { dir: 'v', fill: 'background', clip: true, w: 360, h: 800 });
  put(f, use('Status Bar'), 'FILL');
  const bar = o.bar === 'none' ? null : put(f, use('App Bar', { Type: o.bar || 'Back' }, { Title: o.barTitle }, 'App Bar'), 'FILL');
  const body = frame('Content', { dir: 'v', gap: 'space-16', pad: ['space-16', 'space-16', 'space-24', 'space-16'], clip: true });
  put(f, body, 'FILL', 'FILL');
  try { body.overflowDirection = 'VERTICAL'; } catch (e) { /* ignore */ }
  return { f: f, body: body, bar: bar };
}

async function actionBar(f) {
  const b = frame('Bottom Action Bar', { dir: 'v', gap: 'space-8', pad: 'space-16', fill: 'surface' });
  put(f, b, 'FILL');
  await applyEffect(b, 'elevation-2');
  return b;
}

function banner(tone, title, body, iconName) {
  const props = { Title: title, Body: body || '', 'Show body': !!body };
  if (iconName) props.Icon = iconName;
  const b = use('Banner', { Tone: tone }, props, 'Banner · ' + tone);
  if (iconName) paintVectors(b, { Info: 'info', Success: 'success', Warning: 'warning', Error: 'error' }[tone]);
  return b;
}

function button(type, state, label, iconName) {
  const props = { Label: label };
  if (iconName) { props['Show icon'] = true; props.Icon = iconName; }
  const b = use('Button', { Type: type, State: state }, props, 'Button · ' + label);
  if (iconName) {
    const fg = BUTTONS[type][state][1];
    const ic = b.findOne((n) => n.type === 'INSTANCE' && n.name === 'Icon');
    if (ic) paintVectors(ic, fg);
  }
  return b;
}

function setNestedButton(host, layer, props) {
  const n = nested(host, layer);
  if (n) setProps(n, props); else warn('nested ' + layer + ' not found in ' + host.name);
}

function candidate(m, state, meta) {
  const c = use('Card', { Type: 'Selectable', State: state }, { Title: m.name, Subtitle: m.role, Meta: meta || '', 'Show meta': !!meta }, 'Candidate · ' + m.name);
  setNestedButton(c, 'Avatar', { Initials: m.i });
  return c;
}

function member(m, badgeTone, badgeLabel, badgeIcon) {
  const c = use('Card', { Type: 'Member', State: 'Default' }, { Title: m.name, Subtitle: m.id + ' · ' + m.role, 'Show badge': !!badgeLabel }, 'Member · ' + m.name);
  setNestedButton(c, 'Avatar', { Initials: m.i });
  if (badgeLabel) {
    const b = nested(c, 'Badge');
    if (b) {
      setProps(b, { Tone: badgeTone, Label: badgeLabel, Icon: badgeIcon });
      paintVectors(b, TONES[badgeTone][1]);
    }
  }
  return c;
}

function openSlot(subtitle) {
  return use('Card', { Type: 'Open slot', State: 'Default' }, { Title: 'Open slot', Subtitle: subtitle }, 'Open slot');
}

function infoCard(title, body, iconName, action) {
  const c = use('Card', { Type: 'Info', State: 'Default' }, { Title: title, Body: body, Icon: iconName, 'Show action': !!action }, 'Info · ' + title);
  paintVectors(nested(c, 'Leading icon') || c, 'primary');
  if (action) setNestedButton(c, 'Action', { Label: action });
  return c;
}

function notification(state, o) {
  const c = use('Card', { Type: 'Notification', State: state }, { Title: o.title, Body: o.body, Time: o.time, Icon: o.icon, 'Show actions': !!o.actions }, 'Notification · ' + o.title);
  const tone = { invite: ['primary-container', 'primary'], success: ['success-container', 'success'], warning: ['warning-container', 'warning'], info: ['info-container', 'info'] }[o.tone || 'info'];
  const lead = c.findOne((n) => n.name === 'Leading');
  if (lead) { lead.fills = [solid(tone[0])]; paintVectors(lead, tone[1]); }
  return c;
}

async function sectionTitle(body, label, extra) {
  const row = frame('Section · ' + label, { dir: 'h', gap: 'space-8', align: 'CENTER' });
  put(body, row, 'FILL');
  put(row, await text(label, 'title', 'on-surface', { name: 'Section title' }), 'FILL');
  if (extra) put(row, await text(extra, 'body', 'on-surface-variant', { name: 'Section meta' }));
  return row;
}

function overlay(f, content) {
  const s = frame('Scrim', { dir: 'v', justify: 'CENTER', align: 'CENTER', pad: 'space-24', fill: 'scrim' });
  f.appendChild(s);
  s.layoutPositioning = 'ABSOLUTE';
  s.primaryAxisSizingMode = 'FIXED';
  s.counterAxisSizingMode = 'FIXED';
  s.resize(f.width, f.height);
  s.x = 0; s.y = 0;
  s.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  s.appendChild(content);
  return s;
}

function floatSnackbar(f, message, action) {
  const sb = use('Snackbar', { Type: action ? 'With action' : 'Default' }, action ? { Message: message, Action: action } : { Message: message }, 'Snackbar');
  f.appendChild(sb);
  sb.layoutPositioning = 'ABSOLUTE';
  sb.x = 16;
  // Sit 16 dp above whatever is pinned at the bottom (action bar and/or bottom nav).
  const pinned = f.children.filter((n) => n.name === 'Bottom Action Bar' || n.name === 'Bottom Nav');
  const top = pinned.length ? Math.min.apply(null, pinned.map((n) => n.y)) : f.height;
  sb.y = top - sb.height - 16;
  sb.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
  return sb;
}

function dialog(type, title, body, confirm, cancel, iconName) {
  const props = { Title: title, Body: body };
  if (iconName) props.Icon = iconName;
  const d = use('Dialog', { Type: type }, props, 'Dialog · ' + title);
  if (iconName) paintVectors(d.findOne((n) => n.type === 'INSTANCE' && n.name === 'Icon') || d, type === 'Destructive' ? 'error' : 'primary');
  setNestedButton(d, 'Confirm', { Label: confirm });
  setNestedButton(d, 'Cancel', { Label: cancel });
  return d;
}

function setText(host, layer, chars) {
  const t = host.findOne((n) => n.type === 'TEXT' && n.name === layer);
  if (t) t.characters = chars; else warn('text layer ' + layer + ' not found in ' + host.name);
}

function chip(label, selected) {
  return use('Chip', { State: selected ? 'Selected' : 'Unselected' }, { Label: label }, 'Chip · ' + label);
}

function progress(tone, fraction) {
  const p = use('Progress', { Tone: tone }, null, 'Progress');
  const bar = p.findOne((n) => n.name === 'Bar');
  if (bar) bar.resize(Math.round(328 * fraction), bar.height);
  return p;
}

const GROUPS = [
  { code: 'AI-04', topic: 'AI Healthcare Diagnostic Assistant', slots: ['TH', 'LB', 'PH'], tags: ['Python', 'FastAPI', 'Flutter'], open: 2 },
  { code: 'WEB-11', topic: 'Smart Campus Parking', slots: ['LT', 'NQ', 'VA'], tags: ['React', 'Spring Boot', 'MySQL'], open: 2 },
  { code: 'MOB-07', topic: 'Canteen Pre-order App', slots: ['HD', 'TK', 'MP', 'QA', 'BN'], tags: ['Flutter', 'Firebase', 'Node.js'], open: 0 },
];

function groupCard(g) {
  const full = g.open === 0;
  const c = use('Card', { Type: 'Group', State: 'Default' }, { Title: 'Team ' + g.code, Body: g.topic }, 'Group · ' + g.code);
  const b = nested(c, 'Badge');
  if (b) {
    setProps(b, full ? { Tone: 'Neutral', Label: 'Full · 5/5', Icon: 'lock' } : { Tone: 'Success', Label: g.open + ' open slots', Icon: 'check-circle' });
    paintVectors(b, full ? 'on-tag' : 'success');
  }
  for (let k = 0; k < 5; k++) {
    const slot = nested(c, 'Slot ' + (k + 1));
    if (!slot) continue;
    if (g.slots[k]) setProps(slot, { Type: 'Initials', Initials: g.slots[k] });
    else setProps(slot, { Type: 'Open slot' });
  }
  g.tags.forEach((t, k) => { const tagNode = nested(c, 'Tag ' + (k + 1)); if (tagNode) setProps(tagNode, { Label: t }); });
  const action = nested(c, 'Action');
  if (action) setProps(action, full ? { State: 'Disabled', Label: 'Team is full' } : { Label: 'View Details' });
  return c;
}

async function teamHeader(body, badgeTone, badgeLabel, badgeIcon, count, tone) {
  const card = frame('Team header', { dir: 'v', gap: 'space-8', pad: 'space-16', fill: 'surface', radius: 'radius-md', stroke: 'outline-variant' });
  put(body, card, 'FILL');
  const head = frame('Head', { dir: 'h', gap: 'space-8', align: 'CENTER' });
  put(card, head, 'FILL');
  put(head, await text('Team AI-04', 'title', 'on-surface', { name: 'Team name' }), 'FILL');
  const b = put(head, use('Badge', { Tone: badgeTone }, { Label: badgeLabel, Icon: badgeIcon }, 'Status badge'));
  paintVectors(b, TONES[badgeTone][1]);
  put(card, await text('AI Healthcare Diagnostic Assistant', 'body', 'on-surface-variant', { name: 'Topic' }), 'FILL');
  put(card, progress(tone, count / 5), 'FILL');
  put(card, await text(count + ' of 5 members · FPT rule: 4–5', 'body', 'on-surface', { name: 'Capacity' }), 'FILL');
  return card;
}

/* ----- SCR_01 Sign In ----- */
async function scr01(state) {
  const s = await screenFrame('SCR_01 Sign In', state, { bar: 'none' });
  const body = s.body;
  body.primaryAxisAlignItems = 'CENTER';
  body.counterAxisAlignItems = 'CENTER';
  const logo = frame('Logo', { dir: 'h', justify: 'CENTER', align: 'CENTER', radius: 'radius-lg', fill: 'primary', w: 'size-logo', h: 'size-logo' });
  put(body, logo);
  put(logo, await text('CM', 'display', 'on-primary', { name: 'Logo mark' }));
  put(body, await text('CapstoneMatch', 'display', 'on-surface', { name: 'App name', center: true }), 'FILL');
  put(body, await text('Spring 2026 Capstone team registration. Find a 4–5 member team, elect a leader and lock your roster.', 'body', 'on-surface-variant', { name: 'Subtitle', center: true }), 'FILL');
  if (state === 'Error · wrong domain') {
    const e = put(body, use('Error State', { Layout: 'Inline' }, { Title: 'This is not an FPT account', Cause: 'You chose minh.nguyen@gmail.com. Sign in with your @fpt.edu.vn Google account.' }, 'Error State'), 'FILL');
    setNestedButton(e, 'Retry', { Label: 'Retry' });
  }
  const bar = await actionBar(s.f);
  if (state === 'Signing in') put(bar, button('Primary', 'Loading', 'Signing in…'), 'FILL');
  else put(bar, button('Primary', 'Default', state === 'Error · wrong domain' ? 'Use Another Google Account' : 'Continue with Google', 'mail'), 'FILL');
  put(bar, await text('Only @fpt.edu.vn accounts can sign in.', 'body', 'on-surface-variant', { name: 'Domain note', center: true }), 'FILL');
  return s.f;
}

/* ----- SCR_02 Dashboard ----- */
async function scr02(state) {
  // Critique C-03 (accepted): no bell/profile on Home; the Alerts tab is the single entry point.
  const s = await screenFrame('SCR_02 Dashboard', state, { bar: 'Default', barTitle: 'Home' });
  const body = s.body;
  if (state === 'Loading') {
    put(body, use('Loading', { Type: 'Skeleton' }, null, 'Loading · Skeleton'), 'FILL');
  } else if (state === 'Registration closed') {
    put(body, banner('Error', 'Registration closed on 15 Oct', 'You were not in a team at the deadline, so the system placed you in the Random Pool.', 'error'), 'FILL');
    put(body, infoCard('Automatic matching', 'The Academic Office matches Random Pool students by skills. Results arrive by 17 Oct, 17:00.', 'hourglass', null), 'FILL');
    put(body, button('Primary', 'Default', 'View Matching Status', 'chevron-right'), 'FILL');
  } else {
    put(body, banner('Warning', '2 days 14 hours left', 'Team registration closes 15 Oct, 17:00.', 'schedule'), 'FILL');
    await sectionTitle(body, 'My team', null);
    if (state === 'Not in a team') {
      const e = put(body, use('Empty State', { Layout: 'Compact' }, { Title: "You're not in a team yet", Message: 'Teams with open slots are waiting. Join one before the deadline.', Icon: 'group' }, 'Empty State'), 'FILL');
      paintVectors(nested(e, 'Icon') || e, 'on-surface-variant');
      setProps(e, { 'Show action': false });
      put(body, button('Primary', 'Default', 'Browse Available Teams', 'search'), 'FILL');
    } else {
      await teamHeader(body, 'Warning', 'Leader not elected', 'schedule', 4, 'Success');
      put(body, button('Primary', 'Default', 'Manage My Team', 'group'), 'FILL');
    }
    await sectionTitle(body, 'Checklist', null);
    put(body, infoCard('Before 15 Oct, 17:00', '1. Join a team of 4–5 members\n2. Elect a leader\n3. Leader locks the roster', 'check-circle', null), 'FILL');
  }
  put(s.f, use('Bottom Nav', { Selected: 'Home' }, null, 'Bottom Nav'), 'FILL');
  return s.f;
}

/* ----- SCR_03 Browse Groups ----- */
async function scr03(state) {
  const s = await screenFrame('SCR_03 Browse Groups', state, { bar: 'Default', barTitle: 'Browse Teams' });
  const body = s.body;
  const search = put(body, use('Text Field', { State: state === 'Empty' ? 'Filled' : 'Default' }, { Label: 'Search teams', 'Show leading icon': true }, 'Search'), 'FILL');
  setText(search, 'Value', state === 'Empty' ? 'blockchain' : 'Name, topic or skill');
  setText(search, 'Helper', state === 'Empty' ? '0 results' : '12 teams have open slots');
  const chips = frame('Filter chips', { dir: 'h', gap: 'space-8', clip: true });
  put(body, chips, 'FILL');
  // Critique C-02 (accepted): wrap the four chips instead of cutting "Web" off at the edge.
  chips.clipsContent = false;
  chips.layoutWrap = 'WRAP';
  bind(chips, 'counterAxisSpacing', 'space-8');
  put(chips, chip('Open slots', true));
  put(chips, chip('AI / ML', false));
  put(chips, chip('Mobile', false));
  put(chips, chip('Web', false));
  if (state === 'Loading') {
    put(body, use('Loading', { Type: 'Skeleton' }, null, 'Loading · Skeleton'), 'FILL');
  } else if (state === 'Empty') {
    const e = put(body, use('Empty State', { Layout: 'Screen' }, { Title: 'No teams match "blockchain"', Message: 'Try another keyword, or turn off a filter to see more teams.', Icon: 'search' }, 'Empty State'), 'FILL');
    paintVectors(nested(e, 'Icon') || e, 'primary');
    setNestedButton(e, 'Action', { Label: 'Reset Filters' });
  } else {
    for (const g of GROUPS) {
      const justFilled = state === 'Team just filled' && g.code === 'WEB-11';
      put(body, groupCard(justFilled ? Object.assign({}, g, { slots: g.slots.concat(['KN', 'DT']), open: 0 }) : g), 'FILL');
    }
  }
  put(s.f, use('Bottom Nav', { Selected: 'Browse' }, null, 'Bottom Nav'), 'FILL');
  if (state === 'Team just filled') floatSnackbar(s.f, 'Team WEB-11 just filled up (5/5). List refreshed.', null);
  return s.f;
}

/* ----- SCR_04 Group Detail ----- */
async function scr04(state) {
  const s = await screenFrame('SCR_04 Group Detail', state, { barTitle: 'Team AI-04' });
  const body = s.body;
  const full = state === 'Team full';
  if (full) put(body, banner('Error', 'This team is full (5/5)', 'Someone took the last slot a moment ago. Browse teams that still have open slots.', 'lock'), 'FILL');
  const topic = frame('Topic', { dir: 'v', gap: 'space-8', pad: 'space-16', fill: 'surface', radius: 'radius-md', stroke: 'outline-variant' });
  put(body, topic, 'FILL');
  put(topic, await text('AI Healthcare Diagnostic Assistant', 'title', 'on-surface', { name: 'Topic title' }), 'FILL');
  put(topic, await text('A mobile app that helps clinics triage patients with an image-based AI model.', 'body', 'on-surface-variant', { name: 'Topic description' }), 'FILL');
  const tags = frame('Tags', { dir: 'h', gap: 'space-8' });
  put(topic, tags, 'FILL');
  for (const t of ['Python', 'FastAPI', 'Flutter']) put(tags, use('Badge', { Tone: 'Neutral' }, { Label: t, 'Show icon': false }, 'Tag'));
  await sectionTitle(body, 'Roster', full ? '5/5' : '3/5');
  const list = frame('Roster', { dir: 'v', gap: 'space-12' });
  put(body, list, 'FILL');
  for (const m of MEMBERS.slice(1)) put(list, member(m, 'Success', 'Confirmed', 'check-circle'), 'FILL');
  if (full) {
    put(list, member({ i: 'KD', name: 'Khuat Duy', id: 'SE182990', role: 'Backend · Node.js' }, 'Success', 'Confirmed', 'check-circle'), 'FILL');
    put(list, member({ i: 'NA', name: 'Ngo An', id: 'SE183011', role: 'Frontend · React' }, 'Success', 'Confirmed', 'check-circle'), 'FILL');
  } else {
    put(list, openSlot('Looking for: Backend · Spring Boot'), 'FILL');
    put(list, openSlot('Optional 5th member'), 'FILL');
  }
  const bar = await actionBar(s.f);
  if (full) {
    put(bar, button('Primary', 'Disabled', 'Team is full', 'lock'), 'FILL');
    put(bar, button('Text', 'Default', 'Back to Browse'), 'FILL');
  } else {
    put(bar, button('Primary', 'Default', 'Request to Join Team', 'person-add'), 'FILL');
  }
  if (state === 'Join dialog') {
    overlay(s.f, dialog('Confirmation', 'Join Team AI-04?', "You'll become the 4th member. Joining withdraws you from other teams you applied to.", 'Confirm Join', 'Cancel', 'person-add'));
  }
  if (state === 'Joining') overlay(s.f, use('Loading', { Type: 'Overlay' }, { Message: 'Joining Team AI-04…' }, 'Loading · Overlay'));
  return s.f;
}

/* ----- SCR_05 My Group Hub ----- */
async function scr05(state) {
  const s = await screenFrame('SCR_05 My Group Hub', state, { bar: 'Default', barTitle: 'My Group' });
  const body = s.body;
  if (state === 'Loading') {
    put(body, use('Loading', { Type: 'Skeleton' }, null, 'Loading · Skeleton'), 'FILL');
    put(s.f, use('Bottom Nav', { Selected: 'My Group' }, null, 'Bottom Nav'), 'FILL');
    return s.f;
  }
  const elected = state === 'Leader elected (leader view)';
  const locked = state === 'Locked';
  if (locked) await teamHeader(body, 'Success', 'Locked', 'lock', 4, 'Success');
  else if (elected) await teamHeader(body, 'Success', 'Ready to lock', 'check-circle', 4, 'Success');
  else await teamHeader(body, 'Warning', 'Leader not elected', 'schedule', 4, 'Success');

  if (locked) put(body, banner('Success', 'Roster locked', 'Confirmation code CM-AI04-7F3K. Nothing else to do until the semester starts.', 'lock'), 'FILL');
  else if (elected) put(body, banner('Success', 'You are the team leader', '3 of 4 members voted for you. Review the roster and lock it before 15 Oct, 17:00.', 'star'), 'FILL');
  else put(body, banner('Warning', 'No leader yet', 'Only the elected leader can lock the roster. Vote now: 1 of 4 members has voted.', 'warning'), 'FILL');

  await sectionTitle(body, 'Members', '4');
  const list = frame('Members', { dir: 'v', gap: 'space-12' });
  put(body, list, 'FILL');
  const order = [MEMBERS[1], MEMBERS[0], MEMBERS[2], MEMBERS[3]];
  // The leader view is Tran Thu Ha's phone (only the leader can lock); other states are Minh's.
  for (const m of order) {
    if (m.i === 'TH' && elected) put(list, member(m, 'Primary', 'You · Leader', 'star'), 'FILL');
    else if (m.i === 'TH' && locked) put(list, member(m, 'Primary', 'Leader', 'star'), 'FILL');
    else if (m.i === 'NM' && !elected) put(list, member(m, 'Info', 'You', 'person'), 'FILL');
    else put(list, member(m, 'Success', locked ? 'Locked' : 'Confirmed', locked ? 'lock' : 'check-circle'), 'FILL');
  }
  if (!locked) {
    const bar = await actionBar(s.f);
    if (elected) put(bar, button('Primary', 'Default', 'Proceed to Lock Team', 'lock'), 'FILL');
    else put(bar, button('Primary', 'Default', 'Vote for Leader', 'star'), 'FILL');
    put(bar, button('Text', 'Default', 'Leave Group'), 'FILL');
  }
  put(s.f, use('Bottom Nav', { Selected: 'My Group' }, null, 'Bottom Nav'), 'FILL');
  if (state === 'Joined · no leader yet') floatSnackbar(s.f, 'You joined Team AI-04.', null);
  // Critique C-05 (modified): Leave Group stays visible but needs a destructive confirmation.
  if (state === 'Leave dialog') {
    overlay(s.f, dialog('Destructive', 'Leave Team AI-04?', 'The team drops to 3 of 5 members and can no longer lock. You would have to find a new team before 15 Oct, 17:00.', 'Leave Team', 'Stay in Team', 'warning'));
  }
  return s.f;
}

/* ----- SCR_06 Leader Voting ----- */
async function scr06(state) {
  const s = await screenFrame('SCR_06 Leader Voting', state, { barTitle: 'Elect Team Leader' });
  const body = s.body;
  if (state === 'Loading') {
    put(body, use('Loading', { Type: 'Skeleton' }, { Message: 'Loading candidates…' }, 'Loading · Skeleton'), 'FILL');
    const bar = await actionBar(s.f);
    put(bar, button('Primary', 'Disabled', 'Submit My Vote'), 'FILL');
    return s.f;
  }
  if (state === 'Error') {
    const e = put(body, use('Error State', { Layout: 'Screen' }, { Title: "Couldn't load candidates", Cause: 'No internet connection. Check Wi-Fi or mobile data, then try again. Your vote has not been sent.' }, 'Error State'), 'FILL');
    setNestedButton(e, 'Retry', { Label: 'Try Again' });
    return s.f;
  }
  const submitted = state === 'Submitted' || state === 'Change vote dialog';
  put(body, await text('The elected leader is the only member who can lock the team roster. You can change your vote until all 4 members have voted.', 'body', 'on-surface-variant', { name: 'Intro' }), 'FILL');
  if (submitted) put(body, banner('Success', 'Vote recorded for Tran Thu Ha', '3 of 4 members have voted. A leader is elected at 3 votes.', 'check-circle'), 'FILL');
  else put(body, banner('Info', 'Voting closes in 1 day 6 hours', '2 of 4 members have voted.', 'schedule'), 'FILL');
  await sectionTitle(body, 'Candidates', '4 members');
  const votes = submitted ? ['1 vote', '2 votes', '0 votes', '0 votes'] : ['1 vote', '1 vote', '0 votes', '0 votes'];
  const chosen = state === 'Default' ? -1 : state === 'Change vote dialog' ? 2 : 1;
  const list = frame('Candidates', { dir: 'v', gap: 'space-12' });
  put(body, list, 'FILL');
  MEMBERS.forEach((m, idx) => {
    // Critique C-01 (accepted): tallies stay hidden until you have voted, to avoid a bandwagon effect.
    const meta = submitted ? votes[idx] : '';
    put(list, candidate(m, idx === chosen ? 'Selected' : 'Default', meta), 'FILL');
  });
  const bar = await actionBar(s.f);
  if (state === 'Default') {
    put(bar, await text('Select one candidate to continue.', 'body', 'on-surface-variant', { name: 'Hint' }), 'FILL');
    put(bar, button('Primary', 'Disabled', 'Submit My Vote'), 'FILL');
  } else if (state === 'Selected') {
    put(bar, await text('You are voting for Tran Thu Ha.', 'body', 'on-surface-variant', { name: 'Hint' }), 'FILL');
    put(bar, button('Primary', 'Default', 'Submit My Vote'), 'FILL');
  } else if (state === 'Submitting') {
    put(bar, await text('Sending your vote…', 'body', 'on-surface-variant', { name: 'Hint' }), 'FILL');
    put(bar, button('Primary', 'Loading', 'Submitting…'), 'FILL');
  } else {
    put(bar, await text('Tap another candidate, then Change Vote.', 'body', 'on-surface-variant', { name: 'Hint' }), 'FILL');
    put(bar, button('Secondary', 'Default', 'Change Vote'), 'FILL');
  }
  if (state === 'Change vote dialog') {
    overlay(s.f, dialog('Confirmation', 'Change your vote?', 'Your vote moves from Tran Thu Ha to Le Quoc Bao. You can change it until all 4 members have voted.', 'Change Vote', 'Keep Current Vote', 'star'));
  }
  return s.f;
}

/* ----- SCR_07 Lock Review & Recovery ----- */
async function scr07(state) {
  const s = await screenFrame('SCR_07 Lock Team Roster', state, { barTitle: 'Lock Team Roster' });
  const body = s.body;
  const underfilled = state === 'Error · 3 of 5' || state === 'Recovery · invites sent';
  const locked = state === 'Locked';

  // Status first, then what to do about it, then the roster (which may scroll).
  if (underfilled) {
    put(body, banner('Error', "Can't lock yet: 3 of 5 members", 'FPT Capstone rules require at least 4 members. Add 1 more member to continue.', 'error'), 'FILL');
    if (state === 'Error · 3 of 5') {
      put(body, infoCard('Need 1 more member?', 'Invite unassigned students from the Waiting Pool whose skills match your open slot.', 'person-add', 'Invite from Waiting Pool'), 'FILL');
    } else {
      put(body, banner('Info', 'Invites sent to 5 students', "We'll notify you when someone accepts. Lock becomes available at 4 members.", 'mail'), 'FILL');
    }
  } else if (locked) {
    put(body, banner('Success', 'Roster locked', 'Confirmation code CM-AI04-7F3K · sent to the Academic Office on 12 Oct 2026, 14:32.', 'lock'), 'FILL');
  } else {
    put(body, banner('Success', 'Ready to lock: 4 of 5 members', 'Team AI-04 meets the FPT Capstone rule of 4–5 members.', 'check-circle'), 'FILL');
    put(body, infoCard('Locking is permanent', 'The roster is sent to the Academic Office. After that, no one can join, leave or be removed.', 'lock', null), 'FILL');
  }

  await sectionTitle(body, 'Final roster', 'Team AI-04');
  const list = frame('Roster', { dir: 'v', gap: 'space-12' });
  put(body, list, 'FILL');
  const count = underfilled ? 3 : 4;
  for (let i = 0; i < count; i++) {
    const m = MEMBERS[i];
    // Tran Thu Ha won the SCR_06 election, so she is the leader everywhere after it.
    if (m.i === 'TH') put(list, member(m, 'Primary', 'Leader', 'star'), 'FILL');
    else put(list, member(m, 'Success', locked ? 'Locked' : 'Confirmed', locked ? 'lock' : 'check-circle'), 'FILL');
  }
  if (underfilled) {
    put(list, openSlot(state === 'Recovery · invites sent' ? 'Invite pending · Waiting Pool' : 'Looking for: DevOps / Cloud'), 'FILL');
    put(list, openSlot('Optional 5th member'), 'FILL');
  }

  const bar = await actionBar(s.f);
  if (underfilled) {
    put(bar, await text('Available when your team has 4 members.', 'body', 'on-surface-variant', { name: 'Hint' }), 'FILL');
    put(bar, button('Primary', 'Disabled', 'Lock Team Roster', 'lock'), 'FILL');
  } else if (locked) {
    put(bar, button('Primary', 'Default', 'Back to My Group'), 'FILL');
  } else {
    // Critique C-06 (modified): name every member right above the irreversible action.
    put(bar, await text('Locking: Ha (leader), Minh, Bao, Huy', 'body', 'on-surface-variant', { name: 'Hint' }), 'FILL');
    put(bar, button('Primary', 'Default', 'Lock Team Roster', 'lock'), 'FILL');
  }

  if (state === 'Confirm dialog') {
    overlay(s.f, dialog('Destructive', 'Lock roster permanently?', 'Team AI-04 will be submitted with 4 members. After locking, no one can join, leave or be removed. This cannot be undone.', 'Yes, Lock Permanently', 'Cancel', 'warning'));
  }
  if (state === 'Locking') {
    overlay(s.f, use('Loading', { Type: 'Overlay' }, { Message: 'Locking roster…' }, 'Loading · Overlay'));
  }
  return s.f;
}

/* ----- SCR_08 Random Pool Status ----- */
async function scr08(state) {
  const s = await screenFrame('SCR_08 Random Pool Status', state, { barTitle: 'Matching Status' });
  const body = s.body;
  if (state === 'Error') {
    const e = put(body, use('Error State', { Layout: 'Screen' }, { Title: "Couldn't check your status", Cause: "The server didn't respond in time. Your place in the queue is safe, so nothing is lost." }, 'Error State'), 'FILL');
    setNestedButton(e, 'Retry', { Label: 'Try Again' });
    return s.f;
  }
  const hero = frame('Hero', { dir: 'v', gap: 'space-12', align: 'CENTER', pad: ['space-16', 0] });
  put(body, hero, 'FILL');
  const circle = frame('Illustration', { dir: 'h', justify: 'CENTER', align: 'CENTER', radius: 'radius-full', fill: 'primary-container', w: 'size-illustration', h: 'size-illustration' });
  put(hero, circle);
  put(circle, icon('hourglass', 'primary', 48));
  put(hero, await text('Matching in progress', 'headline', 'on-surface', { name: 'Title', center: true }), 'FILL');
  put(hero, await text("Registration closed on 15 Oct. You're in the Random Pool, and the system is placing you in a team with an open slot.", 'body', 'on-surface-variant', { name: 'Message', center: true }), 'FILL');
  const badge = put(hero, use('Badge', { Tone: 'Warning' }, { Label: 'Result by 17 Oct, 17:00', Icon: 'schedule' }, 'Badge · ETA'));
  paintVectors(badge, 'warning');

  const details = frame('Queue details', { dir: 'v', gap: 'space-12', pad: 'space-16', fill: 'surface', radius: 'radius-md', stroke: 'outline-variant' });
  put(body, details, 'FILL');
  put(details, await text('Your queue details', 'subtitle', 'on-surface'), 'FILL');
  const rows = [['Queue ID', 'RP-2026-0142'], ['Preferred roles', 'Backend · Mobile'], ['Skills', 'Java, Spring Boot, Flutter'], ['Last checked', state === 'Refreshing' ? 'Checking now…' : '2 min ago'], ['Auto-check', 'Every 30 seconds']];
  for (const r of rows) {
    const row = frame(r[0], { dir: 'h', gap: 'space-8', justify: 'SPACE_BETWEEN' });
    put(details, row, 'FILL');
    put(row, await text(r[0], 'body', 'on-surface-variant'));
    put(row, await text(r[1], 'label', 'on-surface'));
  }

  const bar = await actionBar(s.f);
  put(bar, button('Primary', state === 'Refreshing' ? 'Loading' : 'Default', state === 'Refreshing' ? 'Refreshing…' : 'Refresh Status', state === 'Refreshing' ? null : 'refresh'), 'FILL');
  put(bar, button('Secondary', 'Default', 'Email Academic Office', 'mail'), 'FILL');

  if (state === 'Matched dialog') {
    overlay(s.f, dialog('Confirmation', "You've been placed in a team", 'You joined Team WEB-11 (4/5 members) · Topic: Smart Campus Parking. Your teammates have been notified.', 'View My Team', 'Later', 'check-circle'));
  }
  return s.f;
}

/* ----- SCR_09 Notifications ----- */
const N_INVITE = { title: 'Team WEB-11 invited you', body: 'Le Van Tam invited you as Backend developer · 3/5 members', time: '5 min ago', icon: 'person-add', tone: 'invite', actions: true };
const N_INVITE2 = { title: 'Team MOB-03 invited you', body: 'Do Minh Anh invited you as Mobile developer · 4/5 members', time: '1 h ago', icon: 'person-add', tone: 'invite', actions: true };
const N_LEADER = { title: 'Leader elected: Tran Thu Ha', body: 'Team AI-04 elected its leader with 3 of 4 votes.', time: '2 h ago', icon: 'star', tone: 'success' };
const N_DEADLINE = { title: 'Deadline in 2 days', body: 'Lock your roster before 15 Oct, 17:00 to stay out of the Random Pool.', time: 'Yesterday', icon: 'schedule', tone: 'warning' };
const N_REQUEST = { title: 'Join request accepted', body: 'You are now a member of Team AI-04.', time: '10 Oct', icon: 'check-circle', tone: 'success' };

async function scr09(state) {
  const s = await screenFrame('SCR_09 Notifications', state, { bar: 'Actions', barTitle: 'Notifications' });
  const body = s.body;
  const invitesTab = state === 'Invites tab' || state === 'Declined · undo';
  put(body, use('Segmented Tabs', { Selected: invitesTab ? 'Invites' : 'All' }, null, 'Filter tabs'), 'FILL');

  if (state === 'Loading') {
    put(body, use('Loading', { Type: 'Skeleton' }, null, 'Loading · Skeleton'), 'FILL');
  } else if (state === 'Error') {
    const e = put(body, use('Error State', { Layout: 'Screen' }, { Title: "Couldn't load notifications", Cause: 'No internet connection. Invites you receive are kept for 48 hours, so none are lost.' }, 'Error State'), 'FILL');
    setNestedButton(e, 'Retry', { Label: 'Try Again' });
  } else if (state === 'Empty') {
    const e = put(body, use('Empty State', { Layout: 'Screen' }, { Title: "You're all caught up", Message: 'Invites, leader votes and roster updates will appear here.', Icon: 'notifications' }, 'Empty State'), 'FILL');
    paintVectors(nested(e, 'Icon') || e, 'primary');
    setNestedButton(e, 'Action', { Label: 'Browse Teams' });
  } else if (invitesTab) {
    await sectionTitle(body, 'Pending invites', state === 'Declined · undo' ? '1' : '2');
    if (state !== 'Declined · undo') put(body, notification('Unread', N_INVITE), 'FILL');
    put(body, notification('Unread', N_INVITE2), 'FILL');
  } else {
    await sectionTitle(body, 'Today', null);
    put(body, notification('Unread', N_INVITE), 'FILL');
    put(body, notification('Unread', N_LEADER), 'FILL');
    await sectionTitle(body, 'Earlier', null);
    put(body, notification('Default', N_DEADLINE), 'FILL');
    put(body, notification('Default', N_REQUEST), 'FILL');
  }

  put(s.f, use('Bottom Nav', { Selected: 'Alerts' }, null, 'Bottom Nav'), 'FILL');

  if (state === 'Declined · undo') floatSnackbar(s.f, 'Invite from Team WEB-11 declined', 'Undo');
  if (state === 'Accept dialog') {
    overlay(s.f, dialog('Confirmation', 'Join Team WEB-11?', "You'll join as Backend developer (4/5 members). Your other pending invites will be declined automatically.", 'Join Team', 'Cancel', 'person-add'));
  }
  return s.f;
}

const SCREENS = [
  ['SCR_01 Sign In', 'Entry point for every flow. FPT Google SSO only; wrong-domain error is recoverable.', scr01,
    ['Default', 'Signing in', 'Error · wrong domain']],
  ['SCR_02 Dashboard', 'Top-level tab (Home). Start of Flow 1; deadline countdown; route to SCR_08 after the deadline.', scr02,
    ['Not in a team', 'In a team', 'Registration closed', 'Loading']],
  ['SCR_03 Browse Groups', 'Top-level tab (Browse). Flow 1 · search, filter and pick a team with open slots.', scr03,
    ['Populated', 'Loading', 'Empty', 'Team just filled']],
  ['SCR_04 Group Detail', 'Flow 1 · inspect the roster and join. Back returns to SCR_03.', scr04,
    ['Default', 'Join dialog', 'Joining', 'Team full']],
  ['SCR_05 My Group Hub', 'Top-level tab (My Group). End of Flow 1, start/end of Flows 2 and 3.', scr05,
    ['Joined · no leader yet', 'Leader elected (leader view)', 'Leave dialog', 'Locked', 'Loading']],
  ['SCR_06 Leader Voting', 'Flow 2 · Vote for a leader. Nested under My Group; Back returns to SCR_05.', scr06,
    ['Default', 'Selected', 'Submitting', 'Submitted', 'Change vote dialog', 'Loading', 'Error']],
  ['SCR_07 Lock Team Roster', 'Flow 3 · Lock the roster, with the < 4 members error and its recovery path.', scr07,
    ['Ready (4 of 5)', 'Confirm dialog', 'Locking', 'Locked', 'Error · 3 of 5', 'Recovery · invites sent']],
  ['SCR_08 Random Pool Status', 'Post-deadline: student without a team waits for automatic matching.', scr08,
    ['In progress', 'Refreshing', 'Matched dialog', 'Error']],
  ['SCR_09 Notifications', 'Top-level tab (Alerts). Cross-flow feedback: invites, votes, roster events.', scr09,
    ['All', 'Invites tab', 'Accept dialog', 'Declined · undo', 'Empty', 'Loading', 'Error']],
];

async function buildScreens() {
  await loadComponents();
  const page = await gotoPage('03 Final UI');
  await page.loadAsync();
  clearGenerated(page, 'screens');
  const x0 = rightEdge(page, 'screens');

  const section = tag(figma.createSection(), 'screens');
  section.name = 'Final UI · SCR_01 – SCR_09';
  section.x = x0; section.y = 0;

  const GAP = 64, W = 360, H = 800;
  let y = 80, maxX = 0;
  const defaults = [];
  const screenIds = {};
  for (const sc of SCREENS) {
    const h = await text(sc[0], 'display', 'on-surface');
    section.appendChild(h); h.x = 80; h.y = y;
    const d = await text(sc[1], 'body', 'on-surface-variant');
    section.appendChild(d); d.x = 80; d.y = y + 44;
    y += 110;
    let x = 80;
    for (const st of sc[3]) {
      const cap = await text(st, 'label', 'on-surface-variant');
      section.appendChild(cap); cap.x = x; cap.y = y;
      const f = await sc[2](st);
      section.appendChild(f); f.x = x; f.y = y + 32;
      if (st === sc[3][0]) { defaults.push(f); screenIds[sc[0].slice(0, 6)] = f.id; }
      x += W + GAP;
    }
    maxX = Math.max(maxX, x);
    y += 32 + H + 120;
  }

  // Responsive check: default state of each screen at 412 × 915 dp.
  const h = await text('Width check · 412 dp', 'display', 'on-surface');
  section.appendChild(h); h.x = 80; h.y = y;
  const d = await text('Same frames resized to 412 × 915 dp. Content uses Fill container, so cards and buttons stretch; avatars, icons and touch targets keep their size.', 'body', 'on-surface-variant');
  section.appendChild(d); d.x = 80; d.y = y + 44;
  y += 110;
  let x = 80;
  for (const f of defaults) {
    const c = f.clone();
    section.appendChild(c);
    c.name = f.name.replace(/ \/ .*/, '') + ' / 412dp check';
    fixW(c, 412); fixH(c, 915);
    const cap = await text(c.name, 'label', 'on-surface-variant');
    section.appendChild(cap); cap.x = x; cap.y = y;
    c.x = x; c.y = y + 32;
    x += 412 + GAP;
  }
  y += 32 + 915 + 80;
  section.resizeWithoutConstraints(Math.max(maxX, x) + 16, y);
  figma.root.setSharedPluginData(NS, 'screens', JSON.stringify(screenIds));
  figma.viewport.scrollAndZoomIntoView([section]);
}

async function loadScreenIds() {
  const raw = figma.root.getSharedPluginData(NS, 'screens');
  if (!raw) throw new Error('No final screens yet – run "3 · Final UI" first.');
  return JSON.parse(raw);
}

/* ------------------------------------------------------------------------------------------
 * STEP 4: page 01 – user flows, every screen step hyperlinked to its frame on page 03
 * ---------------------------------------------------------------------------------------- */
const FLOWS = [
  {
    name: 'Flow 1 · Discover and join a team',
    meta: 'Start: SCR_02 Dashboard (not in a team) · Goal: join a compatible team with an open slot · End: SCR_05 My Group Hub',
    rows: [
      ['Happy path', [['SCR_01', 'Sign in with FPT Google'], ['SCR_02', 'Tap "Browse Available Teams"'], ['SCR_03', 'Filter "Open slots", tap Team AI-04'], ['SCR_04', 'Request to Join → Confirm'], ['SCR_05', 'Joined (snackbar)']]],
      ['Alternative', [['SCR_03', 'Search finds nothing'], ['SCR_03', 'Reset Filters'], ['SCR_04', 'Pick another team']]],
      ['Error / recovery', [['SCR_04', 'Team filled meanwhile: "Team is full"'], ['SCR_03', 'Back to Browse, list refreshed'], ['SCR_04', 'Join a team with a slot']]],
      ['Alternative entry', [['SCR_09', 'Accept an invite'], ['SCR_05', 'Joined']]],
    ],
  },
  {
    name: 'Flow 2 · Vote for a team leader',
    meta: 'Start: SCR_05 (no leader yet) · Goal: elect the member who may lock the roster · End: SCR_05 with a Leader badge',
    rows: [
      ['Happy path', [['SCR_05', 'Tap "Vote for Leader"'], ['SCR_06', 'Select a candidate'], ['SCR_06', 'Submit My Vote → loading'], ['SCR_06', 'Vote recorded'], ['SCR_05', 'Leader elected at 3 votes']]],
      ['Alternative', [['SCR_06', 'Tap "Change Vote"'], ['SCR_06', 'Dialog: change your vote?'], ['SCR_06', 'Vote moved']]],
      ['Error / recovery', [['SCR_06', 'No internet: "Couldn\'t load candidates"'], ['SCR_06', 'Try Again'], ['SCR_06', 'Candidates load']]],
    ],
  },
  {
    name: 'Flow 3 · Lock the team roster',
    meta: 'Start: SCR_05 (leader view) · Goal: submit a valid 4–5 member roster · End: SCR_05 Locked',
    rows: [
      ['Happy path', [['SCR_05', 'Tap "Proceed to Lock Team"'], ['SCR_07', 'Review: 4 of 5 members'], ['SCR_07', 'Destructive dialog → Yes'], ['SCR_07', 'Locking → Locked + code'], ['SCR_05', 'Team shows Locked']]],
      ['Error / recovery', [['SCR_07', 'Only 3 of 5: lock disabled'], ['SCR_07', 'Invite from Waiting Pool'], ['SCR_09', 'A student accepts'], ['SCR_07', '4 of 5: lock enabled']]],
      ['After deadline', [['SCR_02', 'Registration closed'], ['SCR_08', 'Matching status, refresh'], ['SCR_08', 'Placed in a team']]],
    ],
  },
];

async function buildFlowsPage() {
  await loadComponents();
  const ids = await loadScreenIds();
  const page = await gotoPage('01 User Flow');
  await page.loadAsync();
  clearGenerated(page, 'flows');
  const root = tag(frame('User Flows · CapstoneMatch', { dir: 'v', gap: 'space-32' }), 'flows');
  put(root, await docSection('01 User Flow', 'Three flows with a start, a goal and an end. Every step names the screen it uses; click the underlined screen code to jump to that screen on page 03 (Final UI). Flow 3 includes the error and recovery path (fewer than 4 members).'));

  for (const fl of FLOWS) {
    const sec = await docSection(fl.name, fl.meta);
    for (const row of fl.rows) {
      const line = frame(row[0], { dir: 'h', gap: 'space-8', align: 'CENTER' });
      put(sec, line);
      const lab = put(line, await text(row[0], 'label', row[0].indexOf('Error') === 0 ? 'error' : 'on-surface-variant', { name: 'Path' }));
      lab.textAutoResize = 'HEIGHT'; lab.resize(140, lab.height);
      for (let i = 0; i < row[1].length; i++) {
        const step = row[1][i];
        if (i > 0) put(line, icon('chevron-right', 'on-surface-variant'));
        const box = frame(step[0], { dir: 'v', gap: 'space-4', pad: 'space-12', radius: 'radius-sm', fill: row[0] === 'Happy path' ? 'primary-container' : 'surface', stroke: row[0].indexOf('Error') === 0 ? 'error' : 'outline-variant', w: 176 });
        put(line, box);
        const code = put(box, await text(step[0], 'label', 'primary', { name: 'Screen link' }), 'FILL');
        if (ids[step[0]]) {
          try {
            code.setRangeHyperlink(0, step[0].length, { type: 'NODE', value: ids[step[0]] });
            code.setRangeTextDecoration(0, step[0].length, 'UNDERLINE');
          } catch (e) { warn('hyperlink ' + step[0] + ': ' + e.message); }
        }
        put(box, await text(step[1], 'body', 'on-surface', { name: 'Step' }), 'FILL');
      }
    }
    put(root, sec);
  }

  const map = await docSection('Flow → screen map', null);
  const rows = [
    ['Flow', 'Start', 'Screens used', 'End', 'Alternative / error path'],
    ['1 · Join a team', 'SCR_02', 'SCR_01, 02, 03, 04, 05, 09', 'SCR_05', 'Empty search → reset; team filled → back to SCR_03; join from an invite in SCR_09'],
    ['2 · Vote leader', 'SCR_05', 'SCR_05, 06', 'SCR_05', 'Change vote dialog; load error → Try Again'],
    ['3 · Lock roster', 'SCR_05', 'SCR_05, 07, 09, 02, 08', 'SCR_05', 'Fewer than 4 members → invite from Waiting Pool; after the deadline → SCR_08'],
  ];
  const widths = [150, 90, 250, 90, 520];
  for (let r = 0; r < rows.length; r++) {
    const line = frame('Row ' + r, { dir: 'h', gap: 'space-16', pad: ['space-8', 'space-12'], fill: r === 0 ? 'surface-variant' : null, radius: 'radius-sm' });
    put(map, line);
    for (let c = 0; c < rows[r].length; c++) {
      const t = put(line, await text(rows[r][c], r === 0 ? 'label' : 'body', 'on-surface'));
      t.textAutoResize = 'HEIGHT'; t.resize(widths[c], t.height);
    }
  }
  put(root, map);
  root.x = 0; root.y = 0;
  figma.viewport.scrollAndZoomIntoView([root]);
}

/* ------------------------------------------------------------------------------------------
 * STEP 5: page 02 – low-fidelity wireframes (greyscale copies of each screen's default state)
 * ---------------------------------------------------------------------------------------- */
function wireGrey(p, isText, isStroke) {
  if (!p || p.type !== 'SOLID') return p;
  const L = lum(p.color);
  let hex;
  if (isStroke) hex = '#BDBDBD';
  else if (isText) hex = L > 0.8 ? '#FFFFFF' : '#4A4A4A';
  else hex = L > 0.95 ? '#FFFFFF' : L > 0.85 ? '#F0F0F0' : L > 0.5 ? '#D6D6D6' : '#9E9E9E';
  return { type: 'SOLID', color: hexToRgb(hex), opacity: p.opacity === undefined ? 1 : p.opacity };
}

async function wireframize(root) {
  let inst;
  while ((inst = root.findOne((n) => n.type === 'INSTANCE'))) inst.detachInstance();
  for (const n of [root].concat(root.findAll())) {
    if ('effectStyleId' in n && n.effectStyleId) { try { await n.setEffectStyleIdAsync(''); } catch (e) { /* ignore */ } }
    if ('effects' in n && n.effects.length) n.effects = [];
    if ('fills' in n && Array.isArray(n.fills)) n.fills = n.fills.map((p) => wireGrey(p, n.type === 'TEXT', false));
    if ('strokes' in n && Array.isArray(n.strokes)) n.strokes = n.strokes.map((p) => wireGrey(p, false, true));
  }
}

async function buildWireframesPage() {
  const ids = await loadScreenIds();
  const page = await gotoPage('02 Wireframe');
  await page.loadAsync();
  clearGenerated(page, 'wireframes');
  const section = tag(figma.createSection(), 'wireframes');
  section.name = 'Wireframes · SCR_01 – SCR_09';
  const h = await text('02 Wireframe', 'display', 'on-surface');
  section.appendChild(h); h.x = 80; h.y = 80;
  const d = await text('Low-fidelity layout of all nine screens: greyscale, no brand color, no imagery. Same structure and spacing as the final UI so the handoff stays consistent.', 'body', 'on-surface-variant');
  section.appendChild(d); d.x = 80; d.y = 124;
  const codes = Object.keys(ids).sort();
  let x = 80, y = 200, col = 0;
  for (const code of codes) {
    const src = await figma.getNodeByIdAsync(ids[code]);
    if (!src) { warn('wireframe source missing ' + code); continue; }
    const wf = src.clone();
    section.appendChild(wf);
    wf.name = 'WF · ' + src.name.replace(/ \/ .*/, '');
    await wireframize(wf);
    const cap = await text(wf.name, 'label', 'on-surface-variant');
    section.appendChild(cap); cap.x = x; cap.y = y;
    wf.x = x; wf.y = y + 32;
    col++;
    if (col === 5) { col = 0; x = 80; y += 32 + 800 + 80; } else x += 360 + 64;
  }
  if (col !== 0) y += 32 + 800 + 80;
  section.resizeWithoutConstraints(80 + 5 * 424 + 16, y);
  section.x = 0; section.y = 0;
  figma.viewport.scrollAndZoomIntoView([section]);
}

/* ------------------------------------------------------------------------------------------
 * STEP 6: page 06 – clickable prototype for the three flows (+ the error/recovery path)
 * ---------------------------------------------------------------------------------------- */
const TAP = { type: 'ON_CLICK' };
function goTo(dest) { return { type: 'NODE', destinationId: dest.id, navigation: 'NAVIGATE', transition: { type: 'SMART_ANIMATE', easing: { type: 'EASE_OUT' }, duration: 0.3 }, preserveScrollPosition: false }; }
function openOverlay(dest) { return { type: 'NODE', destinationId: dest.id, navigation: 'OVERLAY', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.2 }, preserveScrollPosition: false }; }
const BACK = { type: 'BACK' };
const CLOSE = { type: 'CLOSE' };
function after(ms) { return { type: 'AFTER_TIMEOUT', timeout: ms / 1000 }; }

async function react(node, trigger, action, what) {
  if (!node) { warn('prototype: missing ' + what); return; }
  try { await node.setReactionsAsync([{ trigger: trigger, actions: [action] }]); } catch (e) { warn('reaction ' + what + ': ' + e.message); }
}
function btnIn(f, label) { return f.findOne((n) => n.type === 'INSTANCE' && n.name === 'Button · ' + label); }
function backIn(f) { const ab = f.findOne((n) => n.name === 'App Bar'); return ab ? ab.findOne((n) => n.name === 'Back') : null; }
function navIn(f, dest) { const bn = f.findOne((n) => n.name === 'Bottom Nav'); return bn ? bn.findOne((n) => n.name === dest) : null; }
function named(f, name) { return f.findOne((n) => n.name === name); }

function overlayFrame(name, content) {
  const f = frame('Overlay / ' + name, { dir: 'v' });
  put(f, content);
  try {
    f.overlayPositionType = 'CENTER';
    f.overlayBackground = { type: 'SOLID_COLOR', color: Object.assign({}, CR.scrim) };
    f.overlayBackgroundInteraction = 'CLOSE_ON_CLICK_OUTSIDE';
  } catch (e) { /* overlay settings are read-only in some API versions; Figma then uses its defaults */ }
  return f;
}

async function buildPrototypePage() {
  await loadComponents();
  const page = await gotoPage('06 Prototype');
  await page.loadAsync();
  clearGenerated(page, 'prototype');
  const section = tag(figma.createSection(), 'prototype');
  section.name = 'Prototype · 3 flows';

  let y = 80;
  async function row(title, desc, frames) {
    const h = await text(title, 'display', 'on-surface');
    section.appendChild(h); h.x = 80; h.y = y;
    const d = await text(desc, 'body', 'on-surface-variant');
    section.appendChild(d); d.x = 80; d.y = y + 44;
    let x = 80;
    for (const f of frames) {
      section.appendChild(f);
      f.x = x; f.y = y + 110;
      x += (f.name.indexOf('Overlay') === 0 ? 312 : 360) + 64;
    }
    y += 110 + 800 + 120;
    return x;
  }

  // Flow 1
  const a1 = await scr02('Not in a team'), a2 = await scr03('Populated'), a3 = await scr04('Default');
  const o1 = overlayFrame('Join team', dialog('Confirmation', 'Join Team AI-04?', "You'll become the 4th member. Joining withdraws you from other teams you applied to.", 'Confirm Join', 'Cancel', 'person-add'));
  const a4 = await scr04('Joining'), a5 = await scr05('Joined · no leader yet');
  // Flow 2
  const b1 = await scr05('Joined · no leader yet'), b2 = await scr06('Default'), b3 = await scr06('Selected'), b4 = await scr06('Submitting'), b5 = await scr06('Submitted');
  const o2 = overlayFrame('Change vote', dialog('Confirmation', 'Change your vote?', 'Your vote moves from Tran Thu Ha to Le Quoc Bao. You can change it until all 4 members have voted.', 'Change Vote', 'Keep Current Vote', 'star'));
  const b6 = await scr05('Leader elected (leader view)');
  // Flow 3 (+ error and recovery)
  const c1 = await scr05('Leader elected (leader view)'), c2 = await scr07('Ready (4 of 5)');
  const o3 = overlayFrame('Lock roster', dialog('Destructive', 'Lock roster permanently?', 'Team AI-04 will be submitted with 4 members. After locking, no one can join, leave or be removed. This cannot be undone.', 'Yes, Lock Permanently', 'Cancel', 'warning'));
  const c3 = await scr07('Locking'), c4 = await scr07('Locked'), c5 = await scr05('Locked');
  const e1 = await scr07('Error · 3 of 5'), e2 = await scr07('Recovery · invites sent');

  let maxX = 0;
  maxX = Math.max(maxX, await row('Flow 1 · Discover and join a team', 'Start: Dashboard → Browse → Team AI-04 → Join dialog (overlay) → Joining (auto-advances after 1.5 s) → My Group. Back arrows return to the previous screen.', [a1, a2, a3, o1, a4, a5]));
  maxX = Math.max(maxX, await row('Flow 2 · Vote for a team leader', 'Start: My Group → Vote → select Tran Thu Ha → Submit → Submitting (1.5 s) → Vote recorded → Back → My Group with a leader. "Change Vote" opens an overlay dialog.', [b1, b2, b3, b4, b5, o2, b6]));
  maxX = Math.max(maxX, await row('Flow 3 · Lock the roster', 'Start: My Group (leader) → Review → destructive dialog (overlay) → Locking (1.5 s) → Locked → My Group (Locked).', [c1, c2, o3, c3, c4, c5]));
  maxX = Math.max(maxX, await row('Flow 3b · Error and recovery (fewer than 4 members)', 'Start: Lock review with 3 of 5 → Invite from Waiting Pool → invites sent → a student accepts (auto-advances after 2.5 s) → Lock review with 4 of 5.', [e1, e2]));

  // Flow 1
  await react(btnIn(a1, 'Browse Available Teams'), TAP, goTo(a2), 'a1 browse');
  await react(navIn(a1, 'Browse'), TAP, goTo(a2), 'a1 nav browse');
  await react(named(a2, 'Group · AI-04'), TAP, goTo(a3), 'a2 group card');
  await react(navIn(a2, 'Home'), TAP, goTo(a1), 'a2 nav home');
  await react(backIn(a3), TAP, BACK, 'a3 back');
  await react(btnIn(a3, 'Request to Join Team'), TAP, openOverlay(o1), 'a3 join');
  await react(named(o1, 'Confirm'), TAP, goTo(a4), 'o1 confirm');
  await react(named(o1, 'Cancel'), TAP, CLOSE, 'o1 cancel');
  await react(a4, after(1500), goTo(a5), 'a4 timeout');
  await react(navIn(a5, 'Home'), TAP, goTo(a1), 'a5 nav home');
  // Flow 2
  await react(btnIn(b1, 'Vote for Leader'), TAP, goTo(b2), 'b1 vote');
  await react(named(b2, 'Candidate · Tran Thu Ha'), TAP, goTo(b3), 'b2 candidate');
  await react(backIn(b2), TAP, BACK, 'b2 back');
  await react(btnIn(b3, 'Submit My Vote'), TAP, goTo(b4), 'b3 submit');
  await react(backIn(b3), TAP, BACK, 'b3 back');
  await react(b4, after(1500), goTo(b5), 'b4 timeout');
  await react(btnIn(b5, 'Change Vote'), TAP, openOverlay(o2), 'b5 change');
  await react(backIn(b5), TAP, goTo(b6), 'b5 back');
  await react(named(o2, 'Confirm'), TAP, goTo(b4), 'o2 confirm');
  await react(named(o2, 'Cancel'), TAP, CLOSE, 'o2 cancel');
  await react(btnIn(b6, 'Proceed to Lock Team'), TAP, goTo(c2), 'b6 proceed');
  // Flow 3
  await react(btnIn(c1, 'Proceed to Lock Team'), TAP, goTo(c2), 'c1 proceed');
  await react(backIn(c2), TAP, BACK, 'c2 back');
  await react(btnIn(c2, 'Lock Team Roster'), TAP, openOverlay(o3), 'c2 lock');
  await react(named(o3, 'Confirm'), TAP, goTo(c3), 'o3 confirm');
  await react(named(o3, 'Cancel'), TAP, CLOSE, 'o3 cancel');
  await react(c3, after(1500), goTo(c4), 'c3 timeout');
  await react(btnIn(c4, 'Back to My Group'), TAP, goTo(c5), 'c4 back to group');
  await react(backIn(c4), TAP, goTo(c5), 'c4 back');
  await react(navIn(c5, 'Home'), TAP, goTo(a1), 'c5 nav home');
  // Flow 3b
  const infoAction = named(e1, 'Info · Need 1 more member?');
  await react(infoAction ? named(infoAction, 'Action') : null, TAP, goTo(e2), 'e1 invite');
  await react(backIn(e1), TAP, BACK, 'e1 back');
  await react(e2, after(2500), goTo(c2), 'e2 timeout');
  await react(backIn(e2), TAP, BACK, 'e2 back');

  try {
    page.flowStartingPoints = [
      { nodeId: a1.id, name: 'Flow 1 · Discover and join a team' },
      { nodeId: b1.id, name: 'Flow 2 · Vote for a team leader' },
      { nodeId: c1.id, name: 'Flow 3 · Lock the roster' },
      { nodeId: e1.id, name: 'Flow 3b · Error and recovery' },
    ];
  } catch (e) { warn('flow starting points: ' + e.message); }

  section.resizeWithoutConstraints(maxX + 16, y);
  section.x = 0; section.y = 0;
  figma.viewport.scrollAndZoomIntoView([section]);
}

/* ------------------------------------------------------------------------------------------
 * ENTRY
 * ---------------------------------------------------------------------------------------- */
async function run() {
  const cmd = figma.command || 'all';
  await loadFonts();
  await ensurePages();
  await ensureTokens();
  const done = [];
  if (cmd === 'tokens' || cmd === 'all') { await buildDesignSystemPage(); done.push('04 Design System'); }
  if (cmd === 'components' || cmd === 'all') { const built = await buildComponentsPage(); done.push(built ? '05 Components' : '05 (kept)'); }
  if (cmd === 'screens' || cmd === 'all') { await buildScreens(); done.push('03 Final UI'); }
  if (cmd === 'flows' || cmd === 'all') { await buildFlowsPage(); done.push('01 User Flow'); }
  if (cmd === 'wireframes' || cmd === 'all') { await buildWireframesPage(); done.push('02 Wireframe'); }
  if (cmd === 'prototype' || cmd === 'all') { await buildPrototypePage(); done.push('06 Prototype'); }
  const tail = warnings.length ? ' · ' + warnings.length + ' warnings (see console)' : '';
  figma.closePlugin('✅ ' + done.join(', ') + tail);
}

run().catch((e) => {
  console.error(e);
  figma.closePlugin('❌ ' + (e && e.message ? e.message : String(e)));
});
