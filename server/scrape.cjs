const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://udyamregistration.gov.in/UdyamRegistration.aspx', { waitUntil: 'domcontentloaded' });

  const uiData = await page.evaluate(() => {
    // Helper: Validation regex patterns
    const patterns = {
      aadhaar: '^[2-9]{1}[0-9]{11}$',
      pan: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
    };

    // Grab relevant fields, skip ASP.NET hidden fields
    const fieldEls = Array.from(document.querySelectorAll('input, select, textarea')).filter(el =>
      !['hidden', 'submit', 'button'].includes(el.type) &&
      !el.name?.startsWith('__')
    );

    const fields = fieldEls.map(el => {
      let labelEl = null;
      if (el.id) labelEl = document.querySelector(`label[for="${el.id}"]`);

      // Map known validation patterns
      let validation = { required: el.hasAttribute('required') };
      if (el.id?.includes('txtadharno')) {
        validation.pattern = patterns.aadhaar;
        validation.errorMessage = 'Enter a valid 12-digit Aadhaar number';
        validation.required = true;
      } else if (el.id?.includes('txtownername')) {
        validation.errorMessage = 'Enter your name exactly as per Aadhaar';
        validation.required = true;
      }

      return {
        id: el.id || null,
        name: el.name || null,
        label: labelEl ? labelEl.innerText.trim() : (el.placeholder || ''),
        type: el.type || (el.tagName.toLowerCase() === 'select' ? 'select' : 'text'),
        placeholder: el.placeholder || null,
        validation
      };
    });

    // Buttons (form actions)
    const buttons = Array.from(document.querySelectorAll('input[type="submit"], button[type="submit"]')).map(btn => ({
      id: btn.id || null,
      label: btn.innerText.trim() || btn.value || '',
      type: 'submit',
      action: btn.name || (btn.id?.includes('ValidateAadhaar') ? 'validateAadhaar' : '')
    }));

    // Accessibility / UI toggles
    const accessibilityOptions = Array.from(document.querySelectorAll('button')).filter(btn =>
      btn.id && !btn.id.includes('ValidateAadhaar')
    ).map(btn => ({
      id: btn.id,
      label: btn.innerText.trim()
    }));

    return {
      step: 1,
      title: 'Aadhaar Verification',
      fields,
      buttons,
      accessibilityOptions
    };
  });

  console.log(JSON.stringify(uiData, null, 2));

  await browser.close();
})();
