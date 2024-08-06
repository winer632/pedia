import { PaginationConfig } from '@/components/ScreenTable/data.d'

export interface TableListQueryParams {
  page: number;
  perPage: number;
  knowledgeName?: string;
  knowledgeType?: string;
  documents?: string;
  datetime?: string;
  startTime?: string;
  endTime?: string;
  tags?: string;
  sort?: numebr;
  order?: number;
  refresh?: string | number;
}

export interface TableListItem {
  userId: number;
  realName: string;
  email: string;
  phone: string;
  status: string;
  remark: string;
  loginName: string;
  password: string;
  roleId: number;
  roleName?: string;
}

export interface TableDataType {
  loading: boolean;
  list: TableListItem[];
  pagination: PaginationConfig;
}
