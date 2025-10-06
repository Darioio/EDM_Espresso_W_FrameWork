/**
 * Footer templates for the EDM Expresso. A footer template defines
 * the markup for the bottom section of the email. Footers often
 * include category menus, promotional imagery, social icons and
 * legal links. Templates can be customised via the UI and stored
 * in localStorage. This default template was generated from the
 * provided footer.html file and retains its inline styles.
 */

export interface FooterTemplate {
  /** Unique identifier for the template */
  id: string;
  /** Friendly name displayed in the UI */
  name: string;
  /** Raw HTML for the footer section */
  html: string;
}

/**
 * Default footer templates bundled with the application. Additional
 * templates can be added by the user at runtime. The HTML is
 * wrapped in a template literal for convenient formatting.
 */
export const defaultFooterTemplates: FooterTemplate[] = [
  {
    id: 'default-footer',
    name: 'Default Footer',
    html: `<!-- === BEGIN: Belle & Bloom Footer + Menu Module (Inline Styles Only) === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">
  <tr>
    <td align="center" style="margin:0;padding:0;">

      <!-- Hidden preheader -->
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;line-height:1px;font-size:1px;color:#ffffff;">
        Fast local shipping on $99+ and easy returns (AU, US &amp; CA).
      </div>

      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;">

        <!-- ===== CATEGORY MENU ===== -->
        <tr>
          <td align="center" style="background:#FFFFFF;padding:0;margin:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="width:100%;margin:0 auto 0 auto;background:#FFFFFF;">
              <tr>
                <td style="background:#FFFFFF;padding:0;margin:0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0;padding:0;">
                    <tr>
                      <td style="padding-left:24px;padding-right:24px;margin:0;">

                        <!-- Item: NEW ARRIVALS -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                          <tr>
                            <td align="center" valign="middle" style="padding-top:12px;padding-bottom:12px;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;line-height:20px;">
                              <a href="https://www.belleandbloom.com/collections/new" target="_blank" style="display:block;color:#000000;text-decoration:none;">
                                NEW ARRIVALS &gt;
                              </a>
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" aria-hidden="true" style="width:100%;">
                          <tr><td style="border-top:1px solid #999999;height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
                        </table>

                        <!-- Item: BLAZERS, JACKETS & COATS -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                          <tr>
                            <td align="center" valign="middle" style="padding-top:12px;padding-bottom:12px;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;line-height:20px;">
                              <a href="https://www.belleandbloom.com/collections/womens-coats" target="_blank" style="display:block;color:#000000;text-decoration:none;">
                                BLAZERS, JACKETS &amp; COATS &gt;
                              </a>
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" aria-hidden="true" style="width:100%;">
                          <tr><td style="border-top:1px solid #999999;height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
                        </table>

                        <!-- Item: DRESSES -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                          <tr>
                            <td align="center" valign="middle" style="padding-top:12px;padding-bottom:12px;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;line-height:20px;">
                              <a href="https://www.belleandbloom.com/collections/all-dresses" target="_blank" style="display:block;color:#000000;text-decoration:none;">
                                DRESSES &gt;
                              </a>
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" aria-hidden="true" style="width:100%;">
                          <tr><td style="border-top:1px solid #999999;height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
                        </table>

                        <!-- Item: BAGS & ACCESSORIES -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                          <tr>
                            <td align="center" valign="middle" style="padding-top:12px;padding-bottom:12px;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;line-height:20px;">
                              <a href="https://www.belleandbloom.com/collections/bags-accessories" target="_blank" style="display:block;color:#000000;text-decoration:none;">
                                BAGS &amp; ACCESSORIES &gt;
                              </a>
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" aria-hidden="true" style="width:100%;">
                          <tr><td style="border-top:1px solid #999999;height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
                        </table>

                        <!-- Item: SHOES -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                          <tr>
                            <td align="center" valign="middle" style="padding-top:12px;padding-bottom:12px;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;line-height:20px;">
                              <a href="https://www.belleandbloom.com/collections/shoes" target="_blank" style="display:block;color:#000000;text-decoration:none;">
                                SHOES &gt;
                              </a>
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" aria-hidden="true" style="width:100%;">
                          <tr><td style="border-top:1px solid #999999;height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
                        </table>

                        <!-- Item: SALE -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                          <tr>
                            <td align="center" valign="middle" style="padding-top:12px;padding-bottom:12px;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;line-height:20px;">
                              <a href="https://www.belleandbloom.com/collections/sale" target="_blank" style="display:block;color:#000000;text-decoration:none;">
                                SALE &gt;
                              </a>
                            </td>
                          </tr>
                        </table>

                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ===== 4-IMAGE ROW ===== -->
        <tr>
          <td align="center" style="background:#FFFFFF;padding-top:16px;padding-bottom:16px;padding-left:24px;padding-right:24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0;padding:0;">
              <tr>
                <td align="center" style="padding:0;margin:0;font-size:0;">
                  
  

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;vertical-align:top;width:25%;max-width:150px;">
                    <tr>
                      <td align="center" style="padding-left:6px;padding-right:6px;">
                        <img src="https://d3k81ch9hvuctc.cloudfront.net/company/Wu2wqB/images/1f3a26d0-9a18-4cbf-8043-a9814b06c75d.jpeg" width="150" alt="Footer image 1" style="display:block;width:100%;max-width:150px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;vertical-align:top;width:25%;max-width:150px;">
                    <tr>
                      <td align="center" style="padding-left:6px;padding-right:6px;">
                        <img src="https://d3k81ch9hvuctc.cloudfront.net/company/Wu2wqB/images/5826e529-cfa2-4c07-8418-b8d1dd703391.jpeg" width="150" alt="Footer image 2" style="display:block;width:100%;max-width:150px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;vertical-align:top;width:25%;max-width:150px;">
                    <tr>
                      <td align="center" style="padding-left:6px;padding-right:6px;">
                        <img src="https://d3k81ch9hvuctc.cloudfront.net/company/Wu2wqB/images/3929f73d-a329-44c6-a3da-f898aa9c80ab.jpeg" width="150" alt="Footer image 3" style="display:block;width:100%;max-width:150px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;vertical-align:top;width:25%;max-width:150px;">
                    <tr>
                      <td align="center" style="padding-left:6px;padding-right:6px;">
                        <img src="https://d3k81ch9hvuctc.cloudfront.net/company/Wu2wqB/images/ee153f13-a66b-4672-9f00-41829a6218d3.jpeg" width="150" alt="Footer image 4" style="display:block;width:100%;max-width:150px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- ===== END 4-IMAGE ROW ===== -->

        <!-- ===== MONOGRAM + SOCIAL + ADDRESS ===== -->
        <tr>
          <td align="center" style="background:#FFFFFF;padding:0;margin:0;">
            <!-- Monogram -->
            <img src="https://d3k81ch9hvuctc.cloudfront.net/company/Wu2wqB/images/8b460d10-1a28-4c2d-9395-d4bab5e1622d.jpeg" alt="Belle &amp; Bloom mark" style="width:100%;height:auto;margin:0 auto 12px auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display:block;">

            <!-- Social icons -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px auto;">
              <tr>
                <td style="padding-left:12px;padding-right:12px;">
                  <a href="https://www.facebook.com/BelleandBloom" target="_blank" aria-label="Facebook" style="text-decoration:none;">
                    <img src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/black/facebook_96.png" width="32" height="32" alt="Facebook" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                  </a>
                </td>
                <td style="padding-left:12px;padding-right:12px;">
                  <a href="https://www.instagram.com/belleandbloomofficial/" target="_blank" aria-label="Instagram" style="text-decoration:none;">
                    <img src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/black/instagram_96.png" width="32" height="32" alt="Instagram" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                  </a>
                </td>
                <td style="padding-left:12px;padding-right:12px;">
                  <a href="https://www.tiktok.com/@belleandbloomofficial?_t=8atlV2GLXgA&_r=1" target="_blank" aria-label="TikTok" style="text-decoration:none;">
                    <img src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/black/tiktok_96.png" width="32" height="32" alt="TikTok" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                  </a>
                </td>
                <td style="padding-left:12px;padding-right:12px;">
                  <a href="https://www.pinterest.com.au/belleandbloom_/" target="_blank" aria-label="Pinterest" style="text-decoration:none;">
                    <img src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/black/pinterest_96.png" width="32" height="32" alt="Pinterest" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                  </a>
                </td>
              </tr>
            </table>

            <!-- Address + legal -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0;padding:0;padding-bottom:25px">
              <tr>
                <td align="center" style="padding-left:24px;padding-right:24px;">
                  <p style="margin:0 0 6px 0;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;color:#1D1D1D;">
                    Our mailing address is <a href="mailto:info@belleandbloom.com" style="color:inherit;text-decoration:underline;">info@belleandbloom.com</a>
                  </p>
                  <p style="margin:0 0 6px 0;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:12px;line-height:18px;color:#666666;">
                    17 Chuter St, McMahon's Point, NSW 2060 Australia
                  </p>
                  <p style="margin:0 0 10px 0;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:12px;line-height:18px;color:#666666;">
                    © All rights reserved &nbsp;|&nbsp; <a href="https://www.belleandbloom.com/pages/privacy-policy" target="_blank" style="color:inherit;text-decoration:underline;">Privacy</a> &nbsp;|&nbsp; Copyright © 2025 belle &amp; bloom
                  </p>
                  <p style="margin:0 0 12px 0;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:12px;line-height:18px;color:#666666;">
                    You received this email from belle &amp; bloom.
                  </p>

                  <!-- Unsubscribe (Klaviyo) -->
                  <p style="margin:0;font-family:Montserrat,Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:12px;line-height:18px;text-decoration:underline;color:#666666;">
                    {% unsubscribe %}
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
        <!-- ===== END MONOGRAM + SOCIAL + ADDRESS ===== -->

      </table>
      <!--[if mso]></td></tr></table><![endif]-->

    </td>
  </tr>
</table>
<!-- === END: Belle & Bloom Footer + Menu Module === -->`
  }
];
