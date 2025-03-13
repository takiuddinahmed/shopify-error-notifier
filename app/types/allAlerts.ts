import type { AlertStatus } from "@prisma/client";

export const AlertTypes = {
  PRODUCTS_CREATE: "PRODUCTS_CREATE",
  PRODUCTS_UPDATE: "PRODUCTS_UPDATE",
  PRODUCTS_DELETE: "PRODUCTS_DELETE",
  CHECK_OUT: "CHECK_OUT",
  SYSTEM_ISSUE: "SYSTEM_ISSUE",
  SIGN_IN: "SIGN_IN",
  SIGN_UP: "SIGN_UP",
} as const;

export type AlertType = (typeof AlertTypes)[keyof typeof AlertTypes];
export interface AlertMessage {
  id: string;
  shopId: string;
  alertType: AlertType;
  message: string;
  createdAt: string;
  status: AlertStatus;
  errorMessage?: string;
}
