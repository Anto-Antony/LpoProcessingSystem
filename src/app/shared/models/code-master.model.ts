export interface CodeMasterModel {
  cM_CODE: string;
  cM_TYPE: string;
  cM_DESC: string;
  cM_VALUE: string | null;
  cM_CR_BY: string | null;
  cM_CR_DT: string | null;
  cM_UP_BY: string | null;
  cM_UP_DT: string | null;
  cM_ACTIVE_YN: string;
}

export interface CodeMasterResponse {
  success: boolean;
  statusCode: number;
  errorCode: string | null;
  data: CodeMasterModel[] | null;
}
