/** Payload posted by the 退去受付 form (see components/moveOut/MoveOutForm.tsx)
 * to /api/move-out-request, which emails it to the management desk. */
export interface MoveOutRequestPayload {
  locale: "ja" | "zh";
  propertyName: string;
  roomNumber: string;
  contractorName: string;
  phone: string;
  email: string;
  cancelReason: string;
  cancelReasonDetail: string;
  cancelDate: string;
  attendanceDate: string;
  attendanceTime: string;
  newAddress: string;
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountHolderKana: string;
  attendanceNoticesAgree: boolean;
  leftoverItemsAgree: boolean;
  utilitiesAgree: boolean;
  otherMessage: string;
}

export const MOVE_OUT_REQUEST_ENDPOINT = "/api/move-out-request";
