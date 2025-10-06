/**
 * Module defining a simple hero template for the EDM Expresso.
 * A hero section is a single image banner that sits between
 * the header and the body modules. It uses placeholders for
 * the image URL, ALT text and an optional link. When the
 * template is rendered these placeholders are replaced with
 * the values supplied by the caller.
 */

export interface HeroTemplate {
  /** Unique identifier for the hero template */
  id: string;
  /** Human‑friendly name shown in the UI */
  name: string;
  /** Raw HTML of the hero. Use {{heroImage}}, {{heroAlt}} and {{heroHref}} */
  html: string;
}

/**
 * Default hero template. It renders a single image inside a
 * centred table. On mobile the image scales to 100% width. The
 * CTA link is optional – if {{heroHref}} is empty the anchor
 * wrapper still produces a valid link tag pointing to the home
 * page (or empty string). The style matches the product modules
 * with a light grey background and white card wrapper.
 */
export const defaultHeroTemplates: HeroTemplate[] = [
  {
    id: 'hero-default',
    name: 'Default Hero',
    html: `<!-- === Start: Hero Section === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">
  <tr>
    <td align="center" style="margin:0;padding:0;">
      <!-- Wrapper -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        <tr>
          <td style="padding:0;">
            <a href="{{heroHref}}" target="_blank" style="display:block;text-decoration:none;">
              <img src="{{heroImage}}" alt="{{heroAlt}}" style="display:block;width:100%;height:auto;border:0;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic;" />
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!-- === End: Hero Section === -->

<!-- Mobile Stacking for Hero -->
<style>
@media only screen and (max-width: 600px) {
  /* Ensure hero image stacks full width on mobile */
  .hero-image {
    width:100% !important;
    height:auto !important;
  }
}
</style>`
  },
  {
    id: 'hero-margins',
    name: 'Hero with Margins',
    html: `<!-- === Start: Hero Section === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0px;">
  <tr>
    <td align="center" style="margin:0;padding:0;">
      <!-- Wrapper -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;padding:25px;">
        <tr>
          <td style="padding:0;">
            <a href="{{heroHref}}" target="_blank" style="display:block;text-decoration:none;">
              <img src="{{heroImage}}" alt="{{heroAlt}}" style="display:block;width:100%;height:auto;border:0;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic;" />
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!-- === End: Hero Section === -->

<!-- Mobile Stacking for Hero -->
<style>
@media only screen and (max-width: 600px) {
  /* Ensure hero image stacks full width on mobile */
  .hero-image {
    width:100% !important;
    height:auto !important;
  }
}
</style>`
  }
];
