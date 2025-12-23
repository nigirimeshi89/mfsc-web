// src/utils/memberHelper.ts

// 学年を計算する
export const getSchoolYear = (enrollmentYear: number) => {
    if (!enrollmentYear || isNaN(enrollmentYear)) return 0;
    const now = new Date();
    const currentFiscalYear =
        now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
    return currentFiscalYear - enrollmentYear + 1;
};

// パート名を統一する
export const normalizePart = (p: string): string => {
    const lower = p.toLowerCase();
    if (lower.includes("vo") || lower.includes("ボーカル")) return "Vo";
    if (lower.includes("gt") || lower.includes("guitar")) return "Gt";
    if (lower.includes("ba") || lower.includes("bass")) return "Ba";
    if (lower.includes("dr") || lower.includes("drum")) return "Dr";
    if (lower.includes("key") || lower.includes("keyboard")) return "Key";
    return p;
};