/**
 * Base email template - provides common HTML structure for all emails
 */

export interface BaseEmailStyles {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

/**
 * Common CSS styles used across all email templates
 */
export const baseStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
  .content { padding: 30px; }
  .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  .button { display: inline-block; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 5px; }
  .field { margin-bottom: 15px; }
  .label { font-weight: bold; color: #0047AB; }
  .value { color: #555; }
`;

/**
 * Wraps email content in a standard HTML structure
 */
export function wrapEmailTemplate(params: {
  headerTitle: string;
  headerIcon?: string;
  headerColor?: string;
  content: string;
  footerText?: string;
  customStyles?: string;
}): string {
  const {
    headerTitle,
    headerIcon = '📧',
    headerColor = '#0047AB',
    content,
    footerText = 'You\'re receiving this email from Bellevue Collision Services.',
    customStyles = '',
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${baseStyles}
    .header { background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); color: #fff; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header-icon { font-size: 48px; }
    ${customStyles}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">${headerIcon}</div>
      <h1>${headerTitle}</h1>
    </div>

    <div class="content">
      ${content}
    </div>

    <div class="footer">
      <p>${footerText}</p>
      <p>Bellevue Collision Services<br>13434 SE 27th Pl, Bellevue WA 98005<br>Phone: (425) 373-0308</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text version from basic parameters
 */
export function generatePlainText(params: {
  greeting: string;
  body: string;
  footer?: string;
}): string {
  const { greeting, body, footer = 'Best regards,\nBellevue Collision Services Team\n13434 SE 27th Pl, Bellevue WA 98005\nPhone: (425) 373-0308' } = params;

  return `${greeting}\n\n${body}\n\n${footer}`;
}
