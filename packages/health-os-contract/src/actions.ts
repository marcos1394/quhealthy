export type ActionType =
  | 'navigate'
  | 'open'
  | 'reserve'
  | 'cancel'
  | 'reschedule'
  | 'pay'
  | 'upload'
  | 'share'
  | 'call'
  | 'join_video'
  | 'start_chat'
  | 'register_biometric'
  | 'generate_summary'
  | 'download'
  | 'confirm'
  | 'authenticate';

export interface BaseAction {
  type: ActionType;
  payload?: Record<string, any>;
}

export interface NavigateAction extends BaseAction {
  type: 'navigate';
  payload: {
    route: string;
    params?: Record<string, string>;
  };
}

export interface OpenAction extends BaseAction {
  type: 'open';
  payload: {
    url: string;
    target?: '_blank' | '_self';
  };
}

export interface ReserveAction extends BaseAction {
  type: 'reserve';
  payload: {
    entityId: string;
    entityType: 'appointment' | 'service';
    entityName?: string;
    scheduleTime?: string;
  };
}

export interface PayAction extends BaseAction {
  type: 'pay';
  payload: {
    amount: number;
    currency: string;
    referenceId: string;
  };
}

export interface UploadAction extends BaseAction {
  type: 'upload';
  payload: {
    documentType: string;
    maxSizeMb?: number;
  };
}

export interface ConfirmAction extends BaseAction {
  type: 'confirm';
  payload?: Record<string, any>;
}

export interface DownloadAction extends BaseAction {
  type: 'download';
  payload: {
    documentId: string;
  };
}

export type HealthOSAction = 
  | NavigateAction 
  | OpenAction 
  | ReserveAction 
  | PayAction 
  | UploadAction 
  | ConfirmAction
  | DownloadAction
  | BaseAction;
