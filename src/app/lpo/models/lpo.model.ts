export interface LpoModel {
  lpO_UID: number;
  lpO_CLM_UID: number;
  lpO_CLM_NO: string;
  lpO_NO: string | null;

  lpO_CHASSIS_NO: string | null;
  lpO_REGN_NO: string | null;
  lpO_ENGINE_NO: string | null;

  lpO_CURR: string;
  lpO_CURR_RATE: number;
  lpO_FC_AMT: number;
  lpO_LC_AMT: number;

  lpO_STATUS: string;
  lpO_APPR_STS: string;

  lpO_APPR_DT: string | null;
  lpO_APPR_BY: string | null;

  lpO_CR_BY: string | null;
  lpO_CR_DT: string | null;
  lpO_UP_BY: string | null;
  lpO_UP_DT: string | null;

  lpO_QUOT_NO: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  errorCode: string;
  data: T | null;
}