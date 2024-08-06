import { PaginationConfig } from '@/components/ScreenTable/data.d';

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
  status?: string;
  type?: string;
  roleName?: string;
  roleType?: string;
  roleStatus?: string;
  roleDescription?: string;
  refresh?: string;
}

export interface TableListItem {
  id: number;
  knowledgeName: string;
  knowledgeType: string;
  knowledgeId: string;
  createTime: string;
  status: string;
  type: string;
  roleName: string;
  roleType: string;
  roleStatus: string;
  roleDescription: string;
  userId: number;
}

export interface TableDataType {
  loading: boolean;
  list: TableListItem[];
  pagination: PaginationConfig;
}
