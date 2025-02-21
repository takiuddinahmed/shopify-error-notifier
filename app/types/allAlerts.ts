import { AlertType, AlertStatus } from "@prisma/client";

export { AlertType, AlertStatus };

export interface AlertMessage {
  id: string;
  shopId: string;
  alertType: AlertType;
  message: string;
  createdAt: string;
  status: AlertStatus;
  errorMessage?: string;
}
