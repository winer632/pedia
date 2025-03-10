<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.speech.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button v-if="false" type="primary" @click="handleAdd">
          {{ t('page.organizes.prompt.add') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="id" :data="tableData.list" :loading="tableData.loading" :pagination="tableData.pagination"
      @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.speech.th-s-label-name') }}</span>
            <el-input v-model="searchInput.title" @keypress.enter="search"
              :placeholder="t('page.organizes.speech.th-s-label-name-holder')" />
          </el-col>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.prompt.th-s-label-lang') }}</span>
            <el-select v-model="searchInput.language" :placeholder="t('page.organizes.prompt.th-s-label-lang-holder')">
              <el-option v-for="item in filterLangOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.speech.th-s-label-scope') }}</span>
            <el-select v-model="searchInput.scope">
              <el-option v-for="item in filterScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="10">
            <div class="th-s">
              <el-button class="th-s-button" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.prompt.reset') }}
              </el-button>
              <el-button type="primary" class="th-s-button" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.prompt.search') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisableSelection"></el-table-column>
      <el-table-column prop="title" :label="t('page.organizes.speech.tb-label-name')" width="200">
        <template #default="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.speech.tb-label-lang')" prop="lang" width="160">
      </el-table-column>
      <el-table-column :label="t('page.organizes.speech.tb-label-description')" prop="subtitle" width="180">
      </el-table-column>
      <el-table-column :label="t('page.organizes.speech.tb-label-scope')" prop="scope" width="160">
        <template #default="{ row }">
          <span>{{ SCOPES[row.scope] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.speech.tb-label-create-by')" prop="createBy" width="100">
      </el-table-column>
      <el-table-column :label="t('page.organizes.prompt.tb-label-createTime')" prop="createTime" width="160">
      </el-table-column>
      <el-table-column fixed="right" :label="t('page.organizes.prompt.tb-label-operate')" width="200">
        <template #default="{ row, $index }">
          <div class="operations">
            <el-button type="text" @click="handleEdit(row)">
              {{ t('page.organizes.prompt.edit') }}
            </el-button>
            <el-button v-if="false" v-loading="row['delLoading']" type="danger" text @click="handleDelete($index, row)">
              {{ t('page.organizes.prompt.delete') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </screen-table>
    <el-dialog v-model="uploadDialog" v-loading="uploadDialogLoading" :title="t('page.organizes.speech.uploadTitle')"
      width="824">
      <div class="upload-form">
        <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadFormRules" label-width="100px">
          <el-form-item :label="t('page.organizes.speech.dialog-label-name')" prop="title">
            <el-input v-model="uploadForm.title"
              :placeholder="t('page.organizes.speech.dialog-placeholder', { holder: t('page.organizes.speech.dialog-label-name') })" />
          </el-form-item>
          <el-form-item :label="t('page.organizes.speech.dialog-label-lang')" prop="language">
            <el-select v-model="uploadForm.language"
              :placeholder="t('page.organizes.speech.dialog-placeholder', { holder: t('page.organizes.speech.dialog-label-lang') })">
              <el-option v-for="      item       in       filterLangOptions      " :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('page.organizes.speech.dialog-label-scope')" prop="scope">
            <el-select v-model="uploadForm.scope"
              :placeholder="t('page.organizes.speech.dialog-placeholder', { holder: t('page.organizes.speech.dialog-label-scope') })">
              <el-option v-for="item in filterScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('page.organizes.speech.dialog-label-description')" prop="description">
            <el-input type="textarea" v-model="uploadForm.subtitle"
              :placeholder="t('page.organizes.speech.dialog-placeholder', { holder: t('page.organizes.speech.dialog-label-description') })" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialog = false">{{ t('page.organizes.prompt.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ t('page.organizes.prompt.submit') }}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="editDialog" v-loading="editDialogLoading" :title="t('page.organizes.speech.editTitle')"
      width="824">
      <div class="edit-form">
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
          <el-form-item :label="t('page.organizes.speech.dialog-label-name')" prop="title">
            <el-input v-model="editForm.title"
              :placeholder="t('page.organizes.speech.dialog-placeholder', { holder: t('page.organizes.speech.dialog-label-name') })" />
          </el-form-item>
          <el-form-item :label="t('page.organizes.speech.dialog-label-lang')" prop="language">
            <el-select v-model="editForm.language">
              <el-option v-for="      item       in       filterLangOptions      " :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('page.organizes.speech.dialog-label-scope')" prop="icon">
            <el-select v-model="editForm.scope">
              <el-option v-for="item in filterScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('page.organizes.speech.dialog-label-description')" prop="description">
            <el-input type="textarea" v-model="editForm.subtitle"
              :placeholder="t('page.organizes.speech.dialog-placeholder', { holder: t('page.organizes.speech.dialog-label-description') })" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialog = false">{{ t('page.organizes.prompt.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ t('page.organizes.prompt.submit') }}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="detailDialog" :title="t('page.organizes.prompt.detailTitle')" width="824">
      <div class="detail-form">
        <el-form>
          <el-form-item :label="t('page.organizes.prompt.dialog-label-name')" prop="name">
            {{ t('page.organizes.prompt.dialog-label-name') }}
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialog = false">{{ t('page.organizes.prompt.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IconSvg from "@/components/IconSvg"
import ScreenTable from '@/components/ScreenTable/index.vue'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import useQueryList from '@/composables/useQueryList'
import useState from '@/composables/useState'
import { replaceDate } from '@/utils/date'
import { ResponseData } from '@/utils/request'
import { StateType as GlobalStateType } from '@/store/global'
import { querySpeechList, query, removeSpeech, addSpeech, editSpeech } from './service'

import { useI18n } from "vue-i18n"
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const { t } = useI18n()
const store = useStore<{ global: GlobalStateType; }>()
const router = useRouter()

const { SCOPES, LANGS, LangOptions, ScopeOptions } = useState()

const tableData = reactive<TableDataType>({
  loading: false,
  list: [],
  pagination: {
    total: 0,
    current: 1,
    pageSize: 10,
    sizeChange: () => { },
    onChange: (page: number) => { }
  }
})
const multipleIds = ref<TableListItem[]>([])
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/speech', async (queryParams, pushQuery): Promise<void> => {
  tableData.loading = true
  const response: ResponseData = await querySpeechList(queryParams)

  const { rows, data } = response
  const list: TableListItem[] = rows || data
  tableData.list = list.map(item => {
    item.lang = LANGS[item.language]
    item.scope = Number(item.scope)
    return item
  })
  tableData.pagination = {
    total: response.total || 0,
    current: Number(queryParams.page) || 1,
    pageSize: Number(queryParams.perPage) || 10,
    sizeChange: (size) => search({ perPage: size, page: 1 }),
    onChange: (page) => search({ page })
  }
  tableData.loading = false
})

const handleSelection = (selection: TableListItem[]) => {
  multipleIds.value = selection
}

const disabledBatchDel = computed(() => multipleIds.value.length === 0)
const batchingDel = ref(false)

const uploadDialog = ref(false)
const uploadDialogLoading = ref(false)
const uploadForm = reactive({
  name: '',
})
const uploadFormRules = reactive({
  name: [{ required: true, trigger: 'blur' }]
})

const editDialog = ref(false)
const editDialogLoading = ref(false)
const editForm = reactive({
  id: 0,
  title: '',
})
const editFormRules = reactive({
  title: [{ required: true, trigger: 'blur' }]
})

const detailDialog = ref(false)
const detailForm = ref({})

const searchInput = reactive({
  title: '',
  language: 'en-us',
  scope: '',
})
const filterLangOptions = computed(() => LangOptions.filter(item => item.value !== 'ALL'))
const filterScopeOptions = computed(() => ScopeOptions.filter(item => item.value))

const search = (op: any) => {
  const data = { ...searchInput }
  pushQuery({
    ...data,
    page: tableData.pagination.current,
    perPage: tableData.pagination.pageSize,
    ...op,
    refresh: replaceDate(new Date())
  })
}

const reset = () => {
  searchInput.name = ''
  searchInput.language = 'en-us'
  searchInput.scope = ''
  search({ page: 1, perPage: 10 })
}

search({ refresh: replaceDate(new Date())})

const handleBatchDelete = async () => {
  if (multipleIds.value.length === 0) {
    ElMessage.error(t('page.organizes.prompt.selectHint'))
    return
  }
  ElMessageBox.confirm(t('page.organizes.prompt.batchDeleteHintDetail'), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    batchingDel.value = true
    let ids = multipleIds.value.map(item => item.id)
    const idsStr = ids.join(',')
    const res = await removeSpeech({ ids: idsStr })
    ElMessage.success(t('page.organizes.docus.deleteSuccess'))
    batchingDel.value = false
    pushQuery({ refresh: replaceDate(new Date()) })
  }).catch(() => {
    batchingDel.value = false
  })
}

const handleDisableSelection = (row: TableListItem, index: number) => {
  return true
}

const handleAdd = async () => {
  uploadForm.name = ''
  uploadForm.title = ''
  uploadForm.subtitle = ''
  uploadForm.scope = 1
  uploadForm.language = 'en-us'
  uploadDialog.value = true
}

const handleEdit = (item: TableListItem) => {
  editForm.id = item.id
  editForm.title = item.title
  editForm.subtitle = item.subtitle
  editForm.language = item.language
  editForm.scope = item.scope
  editDialog.value = true
}

const handleDetail = (item: TableListItem) => {
  detailDialog.value = true
  detailForm.value = item
}

const handleSubmit = async () => {
  try {
    if (editForm.id) {
      const res = await editSpeech(editForm)
      ElMessage.success(t('page.organizes.speech.editSuccess'))
      editDialog.value = false
      editForm.id = ''
      pushQuery({ ...searchInput, refresh: replaceDate(new Date()) })
    } else {
      const res = await addSpeech(uploadForm)
      ElMessage.success(t('page.organizes.speech.addSuccess'))
      uploadDialog.value = false
      pushQuery({ ...searchInput, refresh: replaceDate(new Date()) })
    }
  } catch (err) {
    console.error(err)
  }
}

const handleDelete = (index: number, row: TableListItem) => {
  tableData.list[index]['delLoading'] = true
  try {
    ElMessageBox.confirm(t('page.organizes.prompt.deleteHintDetail', { knowledgeCount: row.knowledgeCount }), t('page.organizes.docus.hint'), {
      confirmButtonText: t('page.organizes.docus.buttonSubmit'),
      cancelButtonText: t('page.organizes.docus.buttonCancel'),
      type: 'warning'
    }).then(async () => {
      await removeSpeech({ ids: row.id + '' })
      ElMessage.success(t('page.organizes.docus.deleteSuccess'))
      if (tableData.list.length > 1) {
        tableData.list.splice(index, 1)
      } else {
        pushQuery({ refresh: replaceDate(new Date()) })
      }

    }).catch(() => {
      tableData.list[index]['delLoading'] = false
    })
  } catch (error: any) {
    ElMessage.warning(error.msg || error || 'error')
    tableData.list[index]['delLoading'] = false
  }
}
onMounted(async () => {
  store.commit('global/setLefter', true)

})
onUnmounted(() => {
  store.commit('global/setLefter', false)

})
</script>
<style lang="scss">
@import "@/assets/css/chat/organize/scroll.scss";
@import "@/assets/css/chat/media.scss";
</style>
<style lang="scss" scoped>
@import "@/assets/css/chat/organize/global.scss";
@import "@/assets/css/chat/media.scss";

::v-deep(.el-input__wrapper) {
  border-radius: 0.25rem;
  background: var(--bg-color);
}

::v-deep(.el-select__wrapper) {
  border-radius: 0.25rem;
  background: var(--bg-color);
}

.main {
  width: auto;
  max-width: calc(100vw - 14.725rem);

  .th-s-label {
    text-align: right;
  }
}
</style>
