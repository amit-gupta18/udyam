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
export declare function scrapeStep1Form(): Promise<UISchema>;
export {};
//# sourceMappingURL=scrape.d.ts.map