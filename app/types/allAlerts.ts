// import { AlertType, AlertStatus } from "@prisma/client";

import type { AlertStatus } from "@prisma/client";

// export { AlertType, AlertStatus };

export const AlertTypes = {
  PRODUCTS_CREATE: "PRODUCTS_CREATE",
  PRODUCTS_UPDATE: "PRODUCTS_UPDATE",
  PRODUCTS_DELETE: "PRODUCTS_DELETE",
  ORDERS_PAID: "ORDERS_PAID",
  CUSTOMERS_CREATE: "CUSTOMERS_CREATE",
  SYSTEM_ISSUE: "SYSTEM_ISSUE",
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
