export interface ProjectHeader {
  ID: string;
  NAME: string;
  ADDR: string;
  N_UNITS: number;
}

export interface Project {
  ID: string;
  NAME: string;
  ADDR: string;

  PRJ_ID: string;
  PRJ_TYPE: string;
  PRJ_STAT: string;
  PRJ_OPEN: string;
  PRJ_CLOSE: string;
  N_UNITS: number;
  DEV_NAME: string;
  DEV_ORG: string;
  DT_APP_SUBMITTED: string;
  DT_APP_ACCEPTED: string;
  DT_PLAN_CHECK: string;
  DT_PROJ_DESC_STABLE: string;
  DT_FIN_HEAR: string;
  PRJ_DESC: string;
  PRJ_CLASS: string;

  EEA_ID: string;
  EEA_STAT: string;
  EEA_OPEN: string;
  EEA_CLOSE: string;
  EEA_TYPE: string;

  ENV_ID: string;
  ENV_STAT: string;
  ENV_OPEN: string;
  ENV_CLOSE: string;
  ENV_TYPE: string;

  EEC_ID: string;
  EEC_STAT: string;
  EEC_OPEN: string;
  EEC_CLOSE: string;
  EEC_TYPE: string;

  CUA_ID: string;
  CUA_STAT: string;
  CUA_OPEN: string;
  CUA_CLOSE: string;
  CUA_TYPE: string;
}
