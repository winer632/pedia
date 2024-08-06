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
  roleId: number | string;
  roleName: string;
  roleKey: string;
  status: string;
  remark: string;
  createTime: string;
  createBy: string;
  updateTime: string;
  updateBy: string;
}

export interface TableDataType {
  loading: boolean;
  list: TableListItem[];
  pagination: PaginationConfig;
}
