"use strict";(()=>{var t={};t.id=565,t.ids=[565],t.modules={20145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},99648:t=>{t.exports=import("axios")},20295:t=>{t.exports=import("cheerio")},35921:(t,e,a)=>{a.a(t,async(t,r)=>{try{a.r(e),a.d(e,{config:()=>p,default:()=>s,routeModule:()=>c});var i=a(71802),l=a(47153),n=a(56249),o=a(46702),d=t([o]);o=(d.then?(await d)():d)[0];let s=(0,n.l)(o,"default"),p=(0,n.l)(o,"config"),c=new i.PagesAPIRouteModule({definition:{kind:l.x.PAGES_API,page:"/api/generate",pathname:"/api/generate",bundlePath:"",filename:""},userland:o});r()}catch(t){r(t)}})},5874:(t,e,a)=>{a.d(e,{P:()=>r,S:()=>renderTemplate});let r=[{id:"product-image-left-copy-right",name:"Image left / Copy right",html:`<!-- === Start: Product Feature Module (Image Left / Copy Right) === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">
  <tr>
    <td align="center" style="margin:0;padding:0;">
      <!-- Wrapper -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        <tr>
          <td style="padding:25px">
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
                              <a href="{{cta}}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:14px;line-height:14px;color:{{ctaText}};text-decoration:none;">
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
</style>`},{id:"grid",name:"Grid",html:`<!-- === Start: Product Grid Module === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">
  <tr>
    <td align="center" style="margin:0;padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        <tr>
          <td style="padding:0px;">
            <!-- Product Images Grid -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0;padding:0;">
              <tr>
                {{#each images}}
                <td align="center" valign="top" style="padding:0px;">
                  <img src="{{.}}" alt="Product image" style="display:block;width:100%;height:auto;border:0;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic;">
                </td>
                {{/each}}
              </tr>
            </table>
            <!-- /Product Images Grid -->
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!-- === End: Product Grid Module === -->
<style>
@media only screen and (max-width: 600px) {
  .product-grid-img {
    width: 80px !important;
    padding: 4px !important;
  }
}
</style>`},{id:"product-copy-left-image-right",name:"Copy left / Image right",html:`<!-- === Start: Product Feature Module (Copy Left / Image Right) === -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">
  <tr>
    <td align="center" style="margin:0;padding:0;">
      <!-- Wrapper -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        <tr>
          <td style="padding:25px;">
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
                              <a href="{{cta}}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:14px;line-height:14px;color:{{ctaText}};text-decoration:none;">
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
</style>`}];function renderTemplate(t,e){let a=t.html;return(a=a.replace(/\{\{#each\s+([a-zA-Z0-9_]+)\}}([\s\S]*?)\{\{\/each\}}/g,(t,a,r)=>{let i=Array.isArray(e[a])?e[a]:[];return i.map(t=>r.replace(/\{\{\.\}\}/g,String(t))).join("")})).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,(t,a)=>{let r=e[a];return null!=r?String(r):""})}},46702:(t,e,a)=>{a.a(t,async(t,r)=>{try{a.r(e),a.d(e,{default:()=>handler});var i=a(90067),l=a(5874),n=t([i]);async function handler(t,e){try{let a;if("POST"!==t.method){e.setHeader("Allow",["POST"]),e.status(405).end(`Method ${t.method} Not Allowed`);return}try{a="string"==typeof t.body?JSON.parse(t.body):t.body}catch(t){e.status(400).json({error:"Invalid JSON body"});return}let r=Array.isArray(a?.urls)?a.urls:[],n=Array.from(new Set(r.map(t=>"string"==typeof t?t.trim():"").filter(t=>{try{let e=new URL(t);return"http:"===e.protocol||"https:"===e.protocol}catch{return!1}})));if(0===n.length){e.status(400).json({error:"No valid http(s) URLs provided"});return}let o=l.P.find(t=>t.id===a.templateId)||l.P[0];if(!o){console.error("No template available; defaultTemplates is empty"),e.status(500).json({error:"Server template configuration missing"});return}let d=[],s=[];for(let t of n)try{let e=await (0,i.c)(t),a=["pretitle","title","price","description","image","originalPrice","images"],r=a.some(t=>{let a=e[t];return Array.isArray(a)?a.length>0:!!a});if(!r){console.warn("Skipping URL with no product data:",t);continue}d.push(e);let n=(0,l.S)(o,e);s.push(n)}catch(e){console.error("Error generating module for url",t,e)}let p=s.join("\n\n");e.status(200).json({html:p,products:d})}catch(t){console.error("Unhandled error in /api/generate:",t),e.status(500).json({error:t?.message||"Internal Server Error"})}}i=(n.then?(await n)():n)[0],r()}catch(t){r(t)}})}};var e=require("../../webpack-api-runtime.js");e.C(t);var __webpack_exec__=t=>e(e.s=t),a=e.X(0,[222,67],()=>__webpack_exec__(35921));module.exports=a})();