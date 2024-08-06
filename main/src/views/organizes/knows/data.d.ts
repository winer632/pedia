import { PaginationConfig } from '@/components/ScreenTable/data.d'

export type Category = Pick<CategoryItem, 'id' | 'name' | 'alias'>

export interface CategoryItem {
  id: number
  name: string
}

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
  knowledgeName: string;
  knowledgeType: string;
  knowledgeId: string;
  createTime: string;
  updateTime: string;
  createBy: string;
  updateBy: string;
  documentCount: number;
  userId: number;
}

export interface TableDataType {
  loading: boolean;
  list: TableListItem[];
  pagination: PaginationConfig;
}
