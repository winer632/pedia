export interface QAParamsType {
  id?: number;
  name?: string;
  params?: Array<string>;
  remark?: string;
  sort?: string;
  scope?: number;
}

export interface QANormalParamsType {
  id?: number;
  content?: string;
}

export interface QAListParamsType {
  createBy?: string;
  createTime?: string;
  id?: number;
  name?: string;
  params?: Array<string>;
  remark?: string;
  searchValue?: string;
  sort?: string;
  updateBy?: string;
  updateTime?: string;
}
