// src/lib/microcms.ts
import { createClient } from "microcms-js-sdk";
import type { MicroCMSListResponse } from "microcms-js-sdk";

// APIクライアントを作成してエクスポート
export const client = createClient({
    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: import.meta.env.MICROCMS_API_KEY,
});

// 型定義もまとめてエクスポートしておくと便利
export type { MicroCMSListResponse };