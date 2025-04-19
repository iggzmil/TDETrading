# EmailJS Security Guide for TDE Trading

This document outlines the security measures implemented for the EmailJS integration on the TDE Trading website, along with recommendations for maintaining and improving security.

## Current Security Implementation

### 1. reCAPTCHA Integration
- Google reCAPTCHA v2 has been added to the contact form
- Prevents automated spam submissions
- Verification occurs client-side before sending emails

### 2. Client-Side Rate Limiting
- Limits users to 3 email submissions per hour
- Prevents abuse of the contact form
- Implemented using browser storage (resets if user clears browser data)

### 3. Credential Obfuscation
- EmailJS credentials are obfuscated in the frontend code
- Uses Base64 encoding and string concatenation
- Makes it harder for automated tools to extract credentials
- Note: This is not true security but adds a layer of protection

### 4. Input Validation
- Client-side validation for all form fields
- Prevents malformed data from being submitted
- Length restrictions on message field (2-1000 characters)

## Required Setup in EmailJS Dashboard

To maximize security with this client-side implementation, you must configure the following in your EmailJS dashboard:

1. **Domain Restriction**:
   - Log in to your EmailJS account
   - Go to "Settings" > "Security"
   - Add domain restriction: `tdetrading.com.au`
   - This prevents your EmailJS credentials from being used on other websites

2. **Email Templates**:
   - Use EmailJS templates instead of constructing emails in code
   - This reduces the risk of email injection attacks

3. **Usage Monitoring**:
   - Regularly check your EmailJS usage statistics
   - Look for unusual spikes in email sending
   - Set up email notifications for high usage

## reCAPTCHA Configuration

The implementation is using your reCAPTCHA site key:

```html
<div class="g-recaptcha" data-sitekey="6Lduax0rAAAAAFvGnDUUH_NNqwdOjlSTc39fsgjZ"></div>
```

Make sure your reCAPTCHA is configured with:
1. reCAPTCHA v2 "I'm not a robot" Checkbox
2. Your domains: `tdetrading.com.au` and `www.tdetrading.com.au` are added to the allowed domains
3. Keep your Secret Key secure for potential future server-side implementation

## Limitations of Client-Side Security

It's important to understand the limitations of this approach:

1. **Obfuscation is Not Encryption**:
   - The credentials are still technically visible in the source code
   - A determined attacker could still extract them

2. **Rate Limiting Bypass**:
   - Client-side rate limiting can be bypassed by clearing browser data
   - It only prevents casual abuse, not determined attacks

3. **No Server Validation**:
   - Without server-side validation, some security checks could be bypassed

## Recommendations for Enhanced Security

For stronger security, consider these future improvements:

1. **Server-Side Implementation**:
   - Move email sending logic to a server-side component
   - Store credentials securely on the server
   - Implement proper server-side validation and rate limiting

2. **Serverless Functions**:
   - Use Netlify Functions, Vercel Serverless Functions, or AWS Lambda
   - These provide server-side security without managing a traditional server

3. **CAPTCHA Strengthening**:
   - Consider upgrading to reCAPTCHA v3 for invisible protection
   - Implement score-based verification for more granular control

4. **Form Honeypots**:
   - Add invisible form fields to catch automated submissions
   - Reject submissions that fill these honeypot fields

## Maintenance and Monitoring

Regular maintenance tasks to ensure continued security:

1. **Check EmailJS Dashboard Weekly**:
   - Monitor email sending patterns
   - Look for unauthorized usage

2. **Update reCAPTCHA Periodically**:
   - Google occasionally updates reCAPTCHA
   - Stay current with the latest version

3. **Review Form Submissions**:
   - Check for patterns of spam that get through
   - Adjust validation rules as needed

4. **Rotate Credentials**:
   - Periodically generate new EmailJS credentials
   - Update the obfuscated credentials in the code
