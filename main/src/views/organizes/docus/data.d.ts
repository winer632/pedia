import { PaginationConfig } from '@/components/ScreenTable/data.d'

export type Category = Pick<CategoryItem, 'id' | 'name' | 'alias'>;

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
  docName?: string;
  docLang?: string;
  docType?: string;
  docTags?: string;
  state?: string;
  tags?: string;
  sort?: number;
  order?: number;
  refresh?: string | number;
}

export interface TableListItem {
  id: number;
  docId: string;
  docName: string;
  lang: string;
  docLang: string;
  type: string;
  docType: string;
  docTags: string;
  tags: string[];
  state: number;
  userId: number;
  updateTime: string;
  updateBy: string;
  sourceFile: string;
  mdFile: string;
  parserState: number;
  parserDetail: string;
  translateState: number;
  knowledgeCount: number;
}

export interface TableDataType {
  loading: boolean;
  list: TableListItem[];
  pagination: PaginationConfig;
}
