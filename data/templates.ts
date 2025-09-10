/**
 * Module containing default HTML email templates and helper
 * functions for simple variable substitution. Templates are defined
 * with double curly braces, e.g. `{{title}}`, which will be
 * replaced with values from a ProductData object. Template
 * designers can add or remove placeholders as needed.
 */

export interface Template {
  /** Unique identifier for the template */
  id: string;
  /** Human‑friendly name shown in the UI */
  name: string;
  /** Raw HTML of the module. Use placeholders like {{title}} */
  html: string;
}

/**
 * Default templates included with the application. New templates
 * added via the UI can be appended at runtime (stored in
 * localStorage on the client). When adding a new template be sure to
 * assign a unique id.
 */
export const defaultTemplates: Template[] = [
  {
    id: 'product-image-left-copy-right',
    name: 'Image left / Copy right',
    // Updated HTML for the left-image / copy-right module. This version
    // matches the design provided in the archive: a light grey
    // background with a white card, no pretitle, a price block that
    // supports an original (compare-at) price via the {{priceHtml}}
    // placeholder, and right-aligned colour swatches. The CTA uses
    // the accent colour defined in globals.css.
    html: `<!-- === Start: Product Feature Module (Image Left / Copy Right) === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">
  <tr>
    <td align="center" style="margin:0;padding:0;">
      <!-- Wrapper -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        <tr>
          <td style="padding:24px 16px;">
            <!-- Two Columns -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0;padding:0;">
              <tr>
                <!-- Left: Image -->
                <td class="stack-cols" width="50%" valign="top" style="padding:0 8px;">
                  <a href="{{cta}}" target="_blank" style="text-decoration:none;">
                    <img src="{{image}}" alt="{{title}}" style="display:block;width:100%;height:auto;border:0;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic;">
                  </a>
                </td>

                <!-- Right: Copy -->
                <td class="stack-cols" width="50%" valign="top" style="padding:0 8px;">
                  <!-- Title -->
                  <h2 style="margin:0 0 10px 0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:26px;line-height:1.2;color:#111111;font-weight:300;">
                    {{title}}
                  </h2>

                  <!-- Price (supports original price via priceHtml) -->
                  <p style="margin:0 0 10px 0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:16px;line-height:1;color:#111111;font-weight:600;">
                    {{priceHtml}}
                  </p>

                  <!-- Description -->
                  <p style="margin:0 0 16px 0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#333333;">
                    {{description}}
                  </p>

                  <!-- CTA + Colours row -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;">
                    <tr>
                      <!-- CTA (left) -->
                      <td align="left" valign="middle" style="padding:0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;">
                          <tr>
                            <td align="center" bgcolor="{{ctaBg}}" style="background:{{ctaBg}};">
                              <a href="{{cta}}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:14px;line-height:14px;color:#ffffff;text-decoration:none;">
                                {{ctaLabel}}
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <!-- Spacer -->
                      <td width="12" style="font-size:0;line-height:0;">&nbsp;</td>
                      <!-- Colours (right aligned) -->
                      <td align="right" valign="middle" class="color-swatches" style="padding:0;">
                        {{coloursHtml}}
                      </td>
                    </tr>
                  </table>
                  <!-- /CTA + Colours row -->

                </td>
              </tr>
            </table>
            <!-- /Two Columns -->
          </td>
        </tr>
      </table>
      <!-- /Wrapper -->
    </td>
  </tr>
</table>
<!-- === End: Product Feature Module === -->

<!-- Mobile Stacking -->
<style>
@media only screen and (max-width: 600px) {
  .stack-cols {
    display:block !important;
    width:100% !important;
    padding:0 0 16px 0 !important;
  }
  .color-swatches {
    text-align:right !important;
  }
}
</style>`
  }
  , {
    id: 'product-copy-left-image-right',
    name: 'Copy left / Image right',
    // Swapped layout: copy appears on the left and image on the right. This
    // variant matches the new design and removes the pretitle. The
    // placeholder {{priceHtml}} should contain the formatted price with
    // any original price included.
    html: `<!-- === Start: Product Feature Module (Copy Left / Image Right) === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">
  <tr>
    <td align="center" style="margin:0;padding:0;">
      <!-- Wrapper -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        <tr>
          <td style="padding:24px 16px;">
            <!-- Two Columns -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0;padding:0;">
              <tr>
                <!-- Left: Copy -->
                <td class="stack-cols" width="50%" valign="top" style="padding:0 8px;">
                  <!-- Title -->
                  <h2 style="margin:0 0 10px 0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:26px;line-height:1.2;color:#111111;font-weight:300;">
                    {{title}}
                  </h2>

                  <!-- Price -->
                  <p style="margin:0 0 10px 0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:16px;line-height:1;color:#111111;font-weight:600;">
                    {{priceHtml}}
                  </p>

                  <!-- Description -->
                  <p style="margin:0 0 16px 0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#333333;">
                    {{description}}
                  </p>

                  <!-- CTA + Colours row -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;">
                    <tr>
                      <!-- CTA (left) -->
                      <td align="left" valign="middle" style="padding:0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;">
                          <tr>
                            <td align="center" bgcolor="{{ctaBg}}" style="background:{{ctaBg}};">
                              <a href="{{cta}}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:14px;line-height:14px;color:#ffffff;text-decoration:none;">
                                {{ctaLabel}}
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <!-- Spacer -->
                      <td width="12" style="font-size:0;line-height:0;">&nbsp;</td>
                      <!-- Colours (right aligned) -->
                      <td align="right" valign="middle" class="color-swatches" style="padding:0;">
                        {{coloursHtml}}
                      </td>
                    </tr>
                  </table>
                  <!-- /CTA + Colours row -->

                </td>

                <!-- Right: Image -->
                <td class="stack-cols" width="50%" valign="top" style="padding:0 8px;">
                  <a href="{{cta}}" target="_blank" style="text-decoration:none;">
                    <img src="{{image}}" alt="{{title}}" style="display:block;width:100%;height:auto;border:0;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic;">
                  </a>
                </td>
              </tr>
            </table>
            <!-- /Two Columns -->
          </td>
        </tr>
      </table>
      <!-- /Wrapper -->
    </td>
  </tr>
</table>
<!-- === End: Product Feature Module === -->

<!-- Mobile Stacking -->
<style>
@media only screen and (max-width: 600px) {
  .stack-cols {
    display:block !important;
    width:100% !important;
    padding:0 0 16px 0 !important;
  }
  .color-swatches {
    text-align:right !important;
  }
}
</style>`
  }
];

/**
 * Render a template into a concrete HTML string. Takes a template
 * definition and a product data object and substitutes each
 * placeholder. Supports arrays via the simple `{{#each colours}}` syntax.
 *
 * This is a minimal implementation deliberately kept simple. If more
 * powerful templating is required (e.g. conditionals, loops) a
 * dedicated template engine like Handlebars can be introduced. For
 * now only substitution and basic array iteration is supported.
 */
export function renderTemplate(template: Template, data: Record<string, any>): string {
  let result = template.html;
  // Handle array blocks: {{#each colors}}...{{/each}}
  const eachRegex = /\{\{#each\s+([a-zA-Z0-9_]+)\}}([\s\S]*?)\{\{\/each\}}/g;
  result = result.replace(eachRegex, (_match, key: string, inner: string) => {
    const arr = Array.isArray(data[key]) ? (data[key] as any[]) : [];
    return arr
      .map((item) => {
        // Replace {{.}} within the inner block with the item itself.
        return inner.replace(/\{\{\.\}\}/g, String(item));
      })
      .join('');
  });
  // Replace simple variables: {{title}}
  result = result.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key: string) => {
    const value = data[key];
    return value !== undefined && value !== null ? String(value) : '';
  });
  return result;
}
