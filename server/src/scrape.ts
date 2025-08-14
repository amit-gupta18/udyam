// scrape.ts
import puppeteer, { Browser } from "puppeteer";

interface ValidationRule {
    required: boolean;
    pattern?: string;
    errorMessage?: string;
}

interface Field {
    id: string | null;
    name: string | null;
    label: string;
    type: string;
    placeholder: string | null;
    validation: ValidationRule;
}

interface Button {
    id: string | null;
    label: string;
    type: string;
    action: string;
}

interface AccessibilityOption {
    id: string;
    label: string;
}

interface UISchema {
    step: number;
    title: string;
    fields: Field[];
    buttons: Button[];
    accessibilityOptions: AccessibilityOption[];
}

export async function scrapeStep1Form(): Promise<UISchema> {
    const browser: Browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://udyamregistration.gov.in/UdyamRegistration.aspx", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
    });

    const uiData: UISchema = await page.evaluate(() => {
        const patterns = {
            aadhaar: "^[2-9]{1}[0-9]{11}$",
            pan: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
        };

        const fieldEls = Array.from(
            document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
                "input, select, textarea"
            )
        ).filter(
            (el) =>
                !["hidden", "submit", "button"].includes(el.type) &&
                !(el.name && el.name.startsWith("__"))
        );

        const fields = fieldEls.map((el) => {
            let labelEl: HTMLLabelElement | null = null;
            if (el.id) {
                labelEl = document.querySelector<HTMLLabelElement>(`label[for="${el.id}"]`);
            }

            const validation: any = { required: el.hasAttribute("required") };

            if (el.id?.includes("txtadharno")) {
                validation.pattern = patterns.aadhaar;
                validation.errorMessage = "Enter a valid 12-digit Aadhaar number";
                validation.required = true;
            } else if (el.id?.includes("txtownername")) {
                validation.errorMessage = "Enter your name exactly as per Aadhaar";
                validation.required = true;
            }

            const getPlaceholder = (element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string | null => {
                if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                    return element.placeholder || null;
                }
                return null; // HTMLSelectElement has no placeholder
            };

            return {
                id: el.id || null,
                name: el.name || null,
                label: labelEl ? labelEl.innerText.trim() : getPlaceholder(el) || "",
                type: el.type || "text",
                placeholder: getPlaceholder(el),
                validation,
            };
        });

        const buttons = Array.from(
            document.querySelectorAll<HTMLInputElement | HTMLButtonElement>(
                'input[type="submit"], button[type="submit"]'
            )
        ).map((btn) => ({
            id: btn.id || null,
            label: btn.innerText.trim() || (btn as HTMLInputElement).value || "",
            type: "submit",
            action:
                btn.getAttribute("name") ||
                (btn.id?.includes("ValidateAadhaar") ? "validateAadhaar" : ""),
        }));

        const accessibilityOptions = Array.from(
            document.querySelectorAll<HTMLButtonElement>("button")
        )
            .filter((btn) => btn.id && !btn.id.includes("ValidateAadhaar"))
            .map((btn) => ({
                id: btn.id,
                label: btn.innerText.trim(),
            }));

        return {
            step: 1,
            title: "Aadhaar Verification",
            fields,
            buttons,
            accessibilityOptions,
        };
    });

    await browser.close();
    return uiData;
}

// // If you run `ts-node scrape.ts` directly, it will print the JSON
// if (require.main === module) {
//   scrapeStep1Form()
//     .then((data) => {
//       console.log(JSON.stringify(data, null, 2));
//     })
//     .catch((err) => {
//       console.error("Error scraping:", err);
//     });
// }
