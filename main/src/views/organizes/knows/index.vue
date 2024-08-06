<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.knows.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" @click="handleAdd">
          {{ t('page.organizes.knows.add') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="id" :data="tableData.list" :loading="tableData.loading" :pagination="tableData.pagination">
      <template #header>
        <el-row>
          <el-col :span="6">
            <span class="th-s-label">{{ t('page.organizes.knows.th-s-name') }}</span>
            <el-input class="th-s-input" v-model="searchInput.knowledgeName"
              :placeholder="t('page.organizes.knows.th-s-name-holder')" />
          </el-col>
          <el-col :span="6" class="text-align-right">
            <span class="th-s-label">{{ t('page.organizes.knows.th-s-type') }}</span>
            <el-select class="th-s-input w200" v-model="searchInput.knowledgeType">
              <el-option v-for="item in TypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="12" class="text-align-right">
            <div class="th-s">
              <el-button class="th-s-button color-huge" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.knows.th-s-reset') }}
              </el-button>
              <el-button type="primary" class="th-s-button" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.knows.th-s') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column fixed :label="t('page.organizes.knows.tb-label-name')" prop="knowledgeName" width="240">
      </el-table-column>
      <el-table-column :label="t('page.organizes.knows.tb-label-type')" width="100">
        <template #default="{ row }">
          {{ row.type }}
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.knows.tb-label-documentNum')" prop="documentCount" width="200">
      </el-table-column>
      <el-table-column :label="t('page.organizes.knows.tb-label-creator')" prop="createBy"
        width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.knows.tb-label-createTime')" prop="createTime" width="200">
      </el-table-column>
      <el-table-column :label="t('page.organizes.knows.tb-label-updateTime')" prop="updateTime" width="200">
      </el-table-column>
      <el-table-column :label="t('page.organizes.knows.tb-label-updater')" prop="updateBy"
        width="200"></el-table-column>
      <el-table-column fixed="right" :label="t('page.organizes.knows.tb-label-actions')" min-width="200">
        <template #default="{ row, $index }">
          <div class="actions">
            <el-button type="primary" text @click="handleKnowledge($index, row)">{{
          t('page.organizes.knows.actionDataset')
        }}</el-button>
            <el-button v-if="row.knowledgeType === 1" type="primary" @click="goKnowledge(row)" text>{{
          t('page.organizes.knows.actionKnowledge')
        }}</el-button>
            <el-popconfirm :title="t('page.organizes.docus.actionDelTitle')" @confirm="handleDelete($index, row)">
              <template #reference>
                <el-button type="info" text :loading="row.delLoading">{{
          t('page.organizes.knows.actionDelete')
        }}</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </screen-table>
  </div>
  <el-dialog v-model="knowledgeDialog" v-loading="loading" width="fit-content"
    :title="knowledgeForm.id ? t('page.organizes.knows.editTitle') : t('page.organizes.knows.addTitle')"
    :close-on="false" :close-on-click-modal="false">
    <el-form :model="knowledgeForm" :rules="knowledgeRules" ref="knowledgeFormRef">
      <el-form-item :label="t('page.organizes.knows.inforT')" class="weight">
      </el-form-item>
      <el-form-item :label="t('page.organizes.knows.tb-label-name')" class="form-input" prop="name">
        <el-input v-model="knowledgeForm.name" :placeholder="t('page.organizes.knows.inputHolder')" name="name" />
      </el-form-item>
      <el-form-item :label="t('page.organizes.knows.tb-label-type')" prop="type">
        <el-radio-group :disabled="knowledgeForm.id" v-model="knowledgeForm.type" name="type">
          <el-radio v-for="item in FormTypeOptions" :key="item.value" :value="item.value"
            :label="item.label"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('page.organizes.knows.dataT')" class="weight" prop="data">
      </el-form-item>
      <el-form-item>
        <el-transfer v-model="knowledgeForm.data" :props="{
          key: 'docId', label: 'docName'
        }" :data="filterDataset" filterable :filter-method="filterDatasetWithTags"
          :filter-placeholder="t('page.organizes.knows.filterHolder')" :titles="transferTitles">
          <template #left-footer>
            <div class="flex-right">
              <el-button type="default" @click="resetLeft">{{ t('page.organizes.knows.th-s-reset') }}</el-button>
              <el-select class="th-s-input w200" v-model="searchInput.docLang" placeholder="Language"
                @change="filterLeft">
                <el-option v-for="item in LangOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </template>
          <template #right-footer>
            <div class="flex-right" @click="resetRight">
              <el-button type="default">{{ t('page.organizes.knows.th-s-reset') }}</el-button>
            </div>
          </template>
        </el-transfer>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="default" @click="knowledgeDialog = false">{{ t('page.organizes.knows.buttonCancel')
          }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('page.organizes.knows.buttonSubmit')
          }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useI18n } from "vue-i18n";
import { ElMessageBox, ElMessage } from 'element-plus'
import IconSvg from "@/components/IconSvg";
import ScreenTable from '@/components/ScreenTable/index.vue'
import ALink from '@/components/ALink/index.vue'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import useQueryList from '@/composables/useQueryList'
import useState from '@/composables/useState'
import { trimComma } from '@/utils/trim'
import { ResponseData } from '@/utils/request'
import { replaceDate } from '@/utils/date'
import { queryList, documents, status, add, edit, remove } from './service'
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const { TYPES, TypeOptions, LangOptions } = useState()

const tableData = reactive<TableDataType>({
  loading: false,
  list: [],
  pagination: {
    total: 0,
    current: 1,
    pageSize: 0,
    sizeChange: () => { },
    onChange: () => { }
  }
})
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/knowledge', async (queryParams, pushQuery): Promise<any> => {
  tableData.loading = true
  const response: ResponseData = await queryList(queryParams)

  const { rows } = response
  const list: TableListItem[] = rows || []
  tableData.list = list.map(item => {
    item.type = TYPES[item.knowledgeType]
    return item
  })
  tableData.pagination = {
    total: response.total || 0,
    current: queryParams.page,
    pageSize: queryParams.perPage,
    sizeChange: (size) => search({ perPage: size, page: 1 }),
    onChange: (page) => search({ page })
  }
  tableData.loading = false
})

const loading = ref(false)
const knowledgeDialog = ref(false)
const knowledgeForm = reactive({
  id: 0,
  name: '',
  type: '',
  data: []
})
const knowledgeRules = reactive({
  name: [{ required: true, trigger: 'blur' }],
  type: [{ required: true, trigger: 'blur' }],
  data: [{ required: true, trigger: 'change' }],
})
const knowledgeFormRef = ref(null)
const transferTitles = ref<[string, string]>([t('page.organizes.knows.transferLeftTitle'), t('page.organizes.knows.transferRightTitle')])

const dataset = ref([])
const searchInput = reactive({
  name: '',
  type: 'ALL',
})
const FormTypeOptions = computed(() => {
  const options = TypeOptions.filter(item => item.value !== 'ALL')
  return options
})
const filterDataset = ref([])

const search = (op) => {
  const data = {
    knowledgeName: searchInput.knowledgeName,
    knowledgeType: searchInput.knowledgeType,
  }
  if (data.knowledgeType === 'ALL') {
    data.knowledgeType = ''
  }
  pushQuery({
    ...data,
    tags: '',
    page: tableData.pagination.current,
    perPage: tableData.pagination.pageSize,
    ...op,
    refresh: replaceDate(new Date()),
  })
}
const reset = () => {
  searchInput.knowledgeName = ''
  searchInput.knowledgeType = 'ALL'
  search({ page: 1 })
}

const filterLeft = () => {
  if (searchInput.docLang === 'ALL') {
    filterDataset.value = dataset.value[knowledgeForm.type]
  } else if (searchInput.docLang === 'zh-cn') {
    filterDataset.value = dataset.value[knowledgeForm.type].filter(item => item.docLang === 'zh-cn' || knowledgeForm.data.includes(item.docId))
  } else if (searchInput.docLang === 'zh-hk') {
    filterDataset.value = dataset.value[knowledgeForm.type].filter(item => item.docLang === 'zh-hk' || knowledgeForm.data.includes(item.docId))
  } else if (searchInput.docLang === 'en-us') {
    filterDataset.value = dataset.value[knowledgeForm.type].filter(item => item.docLang === 'en-us' || knowledgeForm.data.includes(item.docId))
  }
}

const resetLeft = () => {
  filterDataset.value = dataset.value[knowledgeForm.type]
  searchInput.docLang = ''
}

const resetRight = () => {
  knowledgeForm.data = []
}

watchEffect(() => {
  filterDataset.value = dataset.value[knowledgeForm.type]
})
watchEffect(() => {
  const category: number[] = []
  if (queryParams.value.categoryId) {
    queryParams.value.categoryId.split(',').map(item => {
      if (item) {
        category.push(Number(item))
      }
    })
  }
  const params = {
    keywords: queryParams.value.keywords || '',
    category,
    datetime: queryParams.value.startTime && queryParams.value.endTime ? [queryParams.value.startTime, queryParams.value.endTime] : [],
    tags: queryParams.value.tags ? queryParams.value.tags.split(',') : []
  }
})

const handleAdd = async () => {
  knowledgeDialog.value = true
  knowledgeForm.id = 0
  knowledgeForm.name = ''
  knowledgeForm.type = '1'
  knowledgeForm.data = []
}

const handleKnowledge = async (index: number, row: TableListItem) => {
  knowledgeDialog.value = true
  knowledgeForm.row = row
  knowledgeForm.id = row.knowledgeId
  knowledgeForm.knowledgeId = row.knowledgeId
  knowledgeForm.name = row.knowledgeName
  knowledgeForm.type = row.knowledgeType + ''
  knowledgeForm.data = []
  row.knowledgeDocuments.map(item => {
    knowledgeForm.data.push(item.documentId)
  })
}

const filterDatasetWithTags = (query: string, item: TableListItem) => {
  console.error(item)
  return item.docName.includes(query) || item.docTags?.includes(query)
}

const handleSubmit = async () => {
  let valid = false
  try {
    if (knowledgeFormRef.value) {
      await knowledgeFormRef.value.validate()
    }
  } catch (err) {
    return
  }
  valid = knowledgeForm.name.length > 0 && knowledgeForm.type > 0
  if (!valid) {
    return
  }
  if (knowledgeForm.data.length === 0) {
    return
  }
  loading.value = true
  const documentIds = knowledgeForm.data.join(',')
  if (knowledgeForm.id === 0) {
    const res = await add({
      knowledgeName: knowledgeForm.name,
      knowledgeType: knowledgeForm.type,
      documentIds
    })
    pushQuery({ refresh: replaceDate(new Date()) })
    ElMessage.success(t('page.organizes.knows.createSuccess'))
  } else if (knowledgeForm.id.length > 0) {
    const res = await edit({
      knowledgeName: knowledgeForm.name,
      knowledgeType: knowledgeForm.type,
      documentIds,
      knowledgeId: knowledgeForm.knowledgeId
    })
    knowledgeForm.row.knowledgeName = knowledgeForm.name
    knowledgeForm.row.knowledgeType = knowledgeForm.type
    pushQuery({ refresh: replaceDate(new Date()) })
    ElMessage.success(t('page.organizes.knows.modifySuccess'))
  }
  knowledgeDialog.value = false
  loading.value = false

}

const goKnowledge = (row) => {
  router.push({
    path: '/organize/knowledge/qa',
    query: {
      knowledgeId: row.knowledgeId
    }
  })
}

const handleDelete = async (index, row) => {
  await handleDel(index, row)
}

const handleDel = async (index: number, row: TableListItem): Promise<void> => {
  tableData.list[index]['delLoading'] = true
  try {
    ElMessageBox.confirm(t('page.organizes.knows.deleteConfirm'), t('page.organizes.docus.hint'), {
      confirmButtonText: t('page.organizes.docus.buttonSubmit'),
      cancelButtonText: t('page.organizes.docus.buttonCancel'),
      type: 'warning'
    }).then(async () => {
      await remove({ ids: row.knowledgeId })
      ElMessage.success(t('page.organizes.knows.deleteSuccess'))
      if (tableData.list.length > 1) {
        tableData.list.splice(index, 1)
      } else {
        pushQuery({ refresh: replaceDate(new Date()) })
      }
    }).catch(() => {
    })
  } catch (error: any) {
    ElMessage.warning(error.msg || error || 'error')
  }
  tableData.list[index]['delLoading'] = false
}

const initData = async () => {
  const res = await documents()
  if (res && res.data)
    res.data.map(item => {
      if (!dataset.value[item.docType]) {
        dataset.value[item.docType] = []
      }
      dataset.value[item.docType].push({
        id: item.id,
        docName: item.docName,
        docId: item.docId,
        userId: item.userId,
        docTags: item.docTags,
        docLang: item.docLang
      })
    })
}

onMounted(async () => {
  initData()
})
</script>
<style lang="scss">
@import "@/assets/css/chat/organize/scroll.scss";
@import "@/assets/css/chat/media.scss";
</style>
<style lang="scss" scoped>
@import "@/assets/css/chat/organize/global.scss";
@import "@/assets/css/chat/media.scss";

.weight {
  font-weight: 600;
}

.flex-right {
  margin: 0.25rem;
  display: flex;
  gap: 0.25rem;
}

::v-deep(.el-input__wrapper) {
  border-radius: 0.25rem;
  background: var(--theme-bg-colorSpan);
}

::v-deep(.el-select__wrapper) {
  border-radius: 0.25rem;
  background: var(--theme-bg-colorSpan);
}

.form-input {
  width: 60%;

  ::v-deep(.el-input__wrapper) {
    border-radius: 0.25rem;
    background: var(--theme-bg-colorSpan);
  }

  ::v-deep(.el-input__inner) {
    border-radius: 0.25rem;
    background: var(--theme-bg-colorSpan);
  }
}

.th-s-input {
  width: 200px;
}

.main {
  .th-s-label {}

  .th-s-input {}
}
</style>
