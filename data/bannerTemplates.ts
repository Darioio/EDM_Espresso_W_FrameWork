/**
 * Banner templates for the EDM Expresso. A banner is a single image module
 * that typically appears above the footer. Templates use placeholders
 * `{{bannerImage}}`, `{{bannerAlt}}` and `{{bannerHref}}` which are replaced
 * at render time.
 */

export interface BannerTemplate {
  id: string; // Unique identifier
  name: string; // Display name
  html: string; // Template HTML
}

export const defaultBannerTemplates: BannerTemplate[] = [
  {
    id: 'banner-default',
    name: 'Default Banner',
    html: `<!-- === Start: Banner Section === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;background:#F7F7F7;">
  <tr>
    <td align="center" style="margin:0;padding:0;background:#F7F7F7;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        <tr>
          <td style="padding:0;">
            <a href="{{bannerHref}}" target="_blank" style="display:block;text-decoration:none;">
              <img src="{{bannerImage}}" alt="{{bannerAlt}}" style="display:block;width:100%;height:auto;border:0;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic;" />
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!-- === End: Banner Section === -->`
  }
];
