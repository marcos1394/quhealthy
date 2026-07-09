export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'COST';
export type AccountNature = 'DEBIT' | 'CREDIT';

export interface AccountDTO {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    nature: AccountNature;
    active: boolean;
    level: number;
    parentAccountId?: string;
}

export interface CostCenterDTO {
    id: string;
    code: string;
    name: string;
    description: string;
    associatedAreaType: string;
    associatedAreaId: string;
    active: boolean;
    parentId?: string | null;
    children?: CostCenterDTO[];
}
