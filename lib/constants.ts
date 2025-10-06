// Shared design tokens & layout constants
// Padding values used across product sections and hero margins.

export const PRODUCT_SECTION_PADDING_DESKTOP = 25;
export const PRODUCT_SECTION_PADDING_MOBILE = 15;

export const HERO_MARGIN_PADDING_DESKTOP = 25;
export const HERO_MARGIN_PADDING_MOBILE = 15;

// Utility helpers (optional) for choosing responsive values
export const responsiveProductPadding = (isMobile: boolean) => (
  isMobile ? PRODUCT_SECTION_PADDING_MOBILE : PRODUCT_SECTION_PADDING_DESKTOP
);
export const responsiveHeroMarginPadding = (isCompact: boolean) => (
  isCompact ? HERO_MARGIN_PADDING_MOBILE : HERO_MARGIN_PADDING_DESKTOP
);
