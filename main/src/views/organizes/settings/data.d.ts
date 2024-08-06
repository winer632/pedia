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
  id: number;
  configName: string;
  configKey: string;
  configValue: string;
  remark: string;
  createTime: string;
  updateTime: string;
  createBy: string;
  updateBy: string;
  userId: number;
}

export interface TableDataType {
  loading: boolean;
  list: TableListItem[];
  pagination: PaginationConfig;
}
