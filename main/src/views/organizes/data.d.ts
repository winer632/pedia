import { PaginationConfig } from '@/components/ScreenTable/data.d'

export type Category = 'id' | 'name' | 'alias'

export interface CategoryItem {
  id: number;
  name: string;
  alias: string;
  keywords: string;
  description: string;
  pid: number;
}

export interface DataItemParam {
  name: string;
  alias: string;
  keywords: string;
  description: string;
  pid: number;
}

export interface TableListQueryParams {
  page: number;
  perPage: number;
  keywords?: string;
  categoryId?: string;
  startTime?: string;
  endTime?: string;
  tags?: string;
  sort?: number;
  order?: number;
  refresh?: string | number;
}

export interface TableListItem {
  id: number;
  name: string;
  category: string;
  datetime: string;
  tag: string;
  hit: string | number;
  tags?: string[];
}

export interface TableDataType {
  loading: boolean;
  list: TableListItem[];
  pagination: PaginationConfig;
}
