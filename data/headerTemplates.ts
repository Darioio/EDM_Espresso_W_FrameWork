/**
 * Header templates for the EDM Expresso. A header template defines
 * the markup for the top section of the email. Unlike product
 * modules the header does not contain any placeholders by default,
 * but templates can still be customised via the UI. Additional
 * templates can be added at runtime and persisted in localStorage.
 */

export interface HeaderTemplate {
  /** Unique identifier for the template */
  id: string;
  /** Friendly name displayed in the UI */
  name: string;
  /** Raw HTML to use for the header */
  html: string;
}

/**
 * Default header templates bundled with the application. The
 * following template was derived from the provided header.html file
 * and contains inline styles only. To prevent issues with React
 * template literals the content is wrapped in a backtick string.
 */
export const defaultHeaderTemplates: HeaderTemplate[] = [
  {
    id: 'default-header',
    name: 'Default Header',
    html: `<!-- === BEGIN: Belle & Bloom Header Module (Inline Styles Only) === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">
  <tr>
    <td align="center" style="margin:0;padding:0;">
      
      <!-- Preheader (hidden) -->
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;line-height:1px;font-size:1px;color:#ffffff;">
        Fast local shipping on $99+ and easy returns (AU, US &amp; CA).
      </div>

      <!-- Wrapper -->
      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        
        <!-- Announcement Bar -->
        <tr>
          <td align="center" bgcolor="#F0C3C7" style="background:#F0C3C7;padding-top:8px;padding-bottom:8px;padding-left:24px;padding-right:24px;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;line-height:20px;color:#000000;">
            *Fast Local Free Shipping on $99+ Orders and Easy Returns for AU, US &amp; CA
          </td>
        </tr>

        <!-- Brand Lockup -->
        <tr>
          <td align="left" style="background:#FFFFFF;padding-top:16px;padding-bottom:16px;padding-left:24px;padding-right:24px;">
            <a href="https://www.belleandbloom.com/" target="_blank" aria-label="Belle &amp; Bloom" style="text-decoration:none;">
              <img src="https://d3k81ch9hvuctc.cloudfront.net/company/Wu2wqB/images/7a47a18a-d0a8-41cf-a82a-feaba5de5d77.gif" width="440" alt="belle &amp; bloom | b+b studio" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;width:80%;max-width:80%;height:auto;margin:auto;">
            </a>
          </td>
        </tr>

      </table>
      <!--[if mso]></td></tr></table><![endif]-->

    </td>
  </tr>
</table>
<!-- === END: Belle & Bloom Header Module === -->`
  }
];
