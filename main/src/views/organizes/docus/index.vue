<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.docus.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" @click="handleAdd">
          {{ t('page.organizes.docus.add') }}
        </el-button>
        <el-button v-loading="batchingDel" :disabled="disabledBatchDel" @click="handleBatchDel">
          <template #icon>
            <icon-svg type="pk-batchdelete"></icon-svg>
          </template>
          {{ t('page.organizes.docus.batchDel') }}
        </el-button>
        <el-button v-loading="batchingPublish" :disabled="disabledBatchPublish" @click="handleBatchPublish">
          <template #icon>
            <icon-svg type="pk-batchstop"></icon-svg>
          </template>
          {{ t('page.organizes.docus.batchPublish') }}
        </el-button>
        <el-button v-loading="batchingStop" :disabled="disabledBatchStop" @click="handleBatchStop">
          <template #icon>
            <icon-svg type="pk-batchpublish"></icon-svg>
          </template>
          {{ t('page.organizes.docus.batchStop') }}
        </el-button>
      </div>
    </div>

    <screen-table ref="screenTableRef" row-key="docId" :data="tableData.list" :loading="tableData.loading"
      :pagination="tableData.pagination" @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.docus.th-s-name') }}</span>
            <el-input class="th-s-input" v-model="searchInput.docName"
              :placeholder="t('page.organizes.docus.th-s-name-holder')" />
          </el-col>
          <el-col :span="4" class="text-align-right">
            <span class="th-s-label">{{ t('page.organizes.docus.th-s-lang') }}</span>
            <el-select class="th-s-input w200" v-model="searchInput.docLang">
              <el-option v-for="item in LangOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.docus.th-s-status') }}</span>
            <el-select class="th-s-input" v-model="searchInput.state">
              <el-option v-for="item in StatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.docus.th-s-tags') }}</span>
            <el-input class="th-s-input" v-model="searchInput.docTags"
              :placeholder="t('page.organizes.docus.th-s-tags-holder')" />
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.docus.th-s-type') }}</span>
            <el-select class="th-s-input" v-model="searchInput.docType">
              <el-option v-for="item in TypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <div class="th-s">
              <el-button class="th-s-button color-huge" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.docus.th-s-reset') }}
              </el-button>
              <el-button class="th-s-button" type="primary" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.docus.th-s') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisable"> </el-table-column>

      <el-table-column :label="t('page.organizes.docus.tb-label-name')" prop="docName" min-width="240">
      </el-table-column>

      <el-table-column :label="t('page.organizes.docus.tb-label-lang')" prop="lang" width="200">
      </el-table-column>

      <el-table-column :label="t('page.organizes.docus.tb-label-tags')" width="200">
        <template #default="{ row }">
          <el-tag type="info" v-for="tag in row.tags" :key="tag">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.docus.tb-label-type')" prop="type" width="100">
        <template #default="{ row }">
          <el-tag type="info">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.docus.tb-label-status')" width="200">
        <template #default="{ row }">
          <el-tag :class="'state' + row.translateState" :type="TAGS_TYPE[row.translateState] || 'info'">
            <template v-if="row.translateState !== 3">{{ STATES[row.translateState] }}</template>
            <template v-else>
              <el-tooltip :content="errorMsg[row.parserDetail] || row.parserDetail" effect="light" placement="top">
                {{ STATES[row.translateState] }}
              </el-tooltip>
            </template>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.docus.tb-label-creator')" prop="createBy" width="200">
      </el-table-column>
      <el-table-column :label="t('page.organizes.docus.tb-label-createtime')" prop="createTime" width="200">
      </el-table-column>
      <el-table-column :label="t('page.organizes.docus.tb-label-updatetime')" prop="updateTime" width="200">
      </el-table-column>
      <el-table-column :label="t('page.organizes.docus.tb-label-updator')" prop="updateBy" width="200">
      </el-table-column>
      <el-table-column fixed="right" :label="t('page.organizes.docus.tb-label-actions')" prop="action" width="240">
        <template #default="{ row, $index }">
          <div class="actions">
            <el-button v-if="translateState(row.state, row.parserState) === 3" class="color-huge" type="primary" text
              @click="handleReParse(row)">{{
          t('page.organizes.docus.actionParser')
        }}</el-button>
            <el-button
              v-if="translateState(row.state, row.parserState) === 4 || translateState(row.state, row.parserState) === 5"
              class="color-huge" type="primary" text @click="showEdit(row)">{{
          t('page.organizes.docus.actionEdit')
        }}</el-button>
            <el-button
              v-if="row.docType != 2 && (translateState(row.state, row.parserState) === 4 || translateState(row.state, row.parserState) === 5)"
              class="color-huge" type="primary" @click="handleConfirm(row)" text>{{
          t('page.organizes.docus.actionConfirm')
        }}</el-button>
            <el-button v-if="row.translateState === 5 || row.translateState === 7 || row.translateState === 8"
              :loading="row.publishLoading || row.translateState === 7" class="color-huge" type="primary"
              @click="handlePublish(row)" text>{{
          t('page.organizes.docus.actionPublish')
        }}</el-button>
            <el-button v-if="translateState(row.state, row.parserState) === 6" class="color-huge" type="primary"
              @click="handleStop(row)" text>{{
          t('page.organizes.docus.actionStop')
        }}</el-button>
            <el-button v-if="row.translateState !== 2" type="info" text :loading="row.delLoading"
              @click="handleDelete($index, row)">{{
          t('page.organizes.docus.actionDel')
        }}</el-button>
          </div>
        </template>
      </el-table-column>
    </screen-table>
    <el-dialog v-loading="uploading" v-model="uploadDialog" :title="t('page.organizes.docus.addDialogTitle')"
      width="824" :close-on-click-modal="false">
      <div class="uploadForm-flex">
        <div class="uploadForm-left">
          <el-form :model="uploadForm" :rules="formRules" ref="uploadFormRef" class="uploadForm" label-position="top"
            @submit.prevent>
            <el-form-item :label="t('page.organizes.docus.tb-label-lang')" prop="lang">
              <el-radio-group v-model="uploadForm.lang" name="lang">
                <el-radio v-for="item in filterLangOptions" :key="item.value" :label="item.label"
                  :value="item.value"></el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="t('page.organizes.docus.tb-label-tags')">
              <el-tag v-for="tag in uploadForm.tags" :key="tag" closable @close="handleTagClose('upload', tag)">
                {{ tag }}
              </el-tag>
              <el-input v-if="tagsInput" class="tags-input" v-model="inputTag"
                @keyup.enter="handleTag('upload', $event)" @blur="handleTag('upload', $event)" />
              <el-button class="span" v-else @click="showInputTag('edit')"> + New Tag </el-button>
            </el-form-item>
            <el-form-item :label="t('page.organizes.docus.tb-label-type')" prop="type">
              <el-radio-group v-model="uploadForm.type" :disabled="disabledType" name="type">
                <el-radio v-for="item in filterTypeOptions" :key="item.value" :label="item.label"
                  :value="item.value"></el-radio>
              </el-radio-group>
              <div class="flex-right">
                <a class="ml" :href="qaHref" target="_blank">{{
          t('page.organizes.docus.downloadQALink')
        }}</a>
              </div>
            </el-form-item>
            <el-form-item class="uploadForm-upload">
              <el-upload v-model:file-list="fileList" accept=".xlsx,.pptx,.pdf,.md,.docx" :show-file-list="false" drag
                multiple :limit="10" :before-upload="beforeUpload" :on-exceed="handleExceed"
                :http-request="httpRequest">
                <div class="upload">
                  <div class="upload-plus upload-flex">
                    <icon-svg type="pk-addplus"></icon-svg>
                    <div class="upload-text">
                      {{ t('page.organizes.docus.uploadText') }}
                    </div>
                    <div class="upload-hint">
                      {{ t('page.organizes.docus.uploadHint') }}
                    </div>
                  </div>
                </div>
              </el-upload>
            </el-form-item>
          </el-form>
        </div>
        <div class="uploadForm-right">
          <div class="upload-progress-header">
            <div class="title">
              {{ t('page.organizes.docus.uploadProgressTitle') }}
            </div>
            <div class="hint">
              {{ t('page.organizes.docus.uploadProgressHint') }}
            </div>
          </div>
          <div class="upload-file-list" v-for="(list, index) in fileList" :key="list.name">
            <div class="icon">
              <icon-svg :type="iconType(list)" class="w24 h24 wh24"></icon-svg>
            </div>
            <div class="title">
              <div class="name">
                {{ list.name }}
              </div>
              <div class="kb">
                {{ (list.size / 1024).toFixed(2) }}kb
              </div>
            </div>
            <div class="actions">
              <icon-svg type="pk-delete" class="wh16" @click="deleteFile(index)"></icon-svg>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialog = false">{{ t('page.organizes.docus.buttonCancel') }}</el-button>
          <el-button :disabled="fileList.length === 0" v-loading="uploading" type="primary" @click="handleUpload">{{
          t('page.organizes.docus.buttonSubmit')
        }}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="editDialog" :title="t('page.organizes.docus.editDialogTitle')" width="600"
      :close-on-click-modal="false">
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-position="top" @submit.prevent>
        <el-form-item :label="t('page.organizes.docus.tb-label-name')" prop="name">
          <el-input maxlength="100" v-model="editForm.name" :placeholder="t('page.organizes.docus.editHolder')"
            name="name"></el-input>
        </el-form-item>
        <el-form-item :label="t('page.organizes.docus.tb-label-lang')" prop="lang">
          <el-radio-group v-model="editForm.lang" name="lang">
            <el-radio v-for="item in filterLangOptions" :key="item.value" :label="item.label"
              :value="item.value"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="edit-form" :label="t('page.organizes.docus.tb-label-tags')">
          <el-tag v-for="tag in editForm.tags" :key="tag" closable :disable-transitions="false"
            @close="handleTagClose('edit', tag)">
            {{ tag }}
          </el-tag>
          <el-input v-if="tagsInput" ref="inputTagsRef" class="tags-input" v-model="inputTag"
            @keyup.enter="handleTag('edit')" @blur="handleTag('edit')" />
          <el-button class="span" v-else @click="showInputTag('edit')"> + New Tag </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialog = false">{{ t('page.organizes.docus.buttonCancel') }}</el-button>
          <el-button type="primary" @click="handleEdit">{{ t('page.organizes.docus.buttonSubmit') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    <div v-show="uploadState.show" class="upload-state" :class="uploadState.type">
      <div class="top">
        <div class="upload-state-icon">
          <img src="/images/upload-state.png" class="wh92" />
        </div>
        <div class="upload-state-title">
          {{ t('page.organizes.docus.uploadStateTitle') }}
        </div>
        <div class="upload-state-success">
          {{ t('page.organizes.docus.uploadStateSuccess', { successCount: uploadState.success }) }}
        </div>
        <div class="upload-state-fail">
          {{ t('page.organizes.docus.uploadStateFail', { failCount: uploadState.fail }) }}
        </div>
        <div class="upload-state-expand">
          <icon-svg v-if="uploadState.type === 'expand'" type="pk-shrink" class="wh16"
            @click="uploadState.type = 'expanded'"></icon-svg>
          <icon-svg v-else type="pk-expand" class="wh16" @click="uploadState.type = 'expand'"></icon-svg>
        </div>
      </div>
      <div v-if="uploadState.type !== 'expand'" class="list">
        <template v-for="file, index in uploadState.fileList" :key="file">
          <div v-if="file" class="upload-state-list"
            :class="translateState(file.state, file.parserState) === 3 ? 'red' : ''">
            <div class="icon">
              <icon-svg :type="iconType(file)" class="w24 h24 wh24"></icon-svg>
            </div>
            <div class="name">
              <div class="text">
                <el-tooltip :content="file.name" effect="light">
                  {{ file.name }}
                </el-tooltip>
              </div>
              <div class="kb">
                {{ (file.size / 1024).toFixed(2) }}kb
              </div>
            </div>
            <div v-if="file.error" class="state red">
              <el-tooltip :content="file.error" effect="light">{{ file.error }}</el-tooltip>
            </div>
            <div v-else class="state">
              <el-tooltip :content="STATES[translateState(file.state, file.parserState)]" effect="light">
                {{ STATES[translateState(file.state, file.parserState)] }}
              </el-tooltip>
            </div>
            <div class="actions">
              <icon-svg type="pk-delete" class="wh16" @click="deleteUploadStateFile(index)"></icon-svg>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from 'element-plus'
import IconSvg from "@/components/IconSvg";
import ScreenTable from '@/components/ScreenTable/index.vue'
import ALink from '@/components/ALink/index.vue'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import useQueryList from '@/composables/useQueryList'
import useState from '@/composables/useState'
import { trimComma } from '@/utils/trim'
import { ResponseData } from '@/utils/request'
import { replaceDate } from '@/utils/date'
import { queryList, query, remove, add, edit, reParse, publish, stop, association } from './service'
import { useRouter } from 'vue-router';
import crypto from 'crypto-js'

const { locale, t } = useI18n();
const router = useRouter();

const { STATES, TYPES, LANGS, LangOptions, StatusOptions, TypeOptions, translateState, queryState } = useState()

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
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/document', async (queryParams, pushQuery): Promise<void> => {
  tableData.loading = true
  const response: ResponseData = await queryList(queryParams)

  const { rows } = response
  const list: TableListItem[] = rows || []
  tableData.list = list.map(item => {
    item.docTags = trimComma(item.docTags || '')
    item.tags = item.docTags !== '' ? item.docTags.split(',') : []
    item.type = TYPES[item.docType]
    item.lang = LANGS[item.docLang || 'zh-cn']
    item.translateState = translateState(item.state, item.parserState)
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

const handleSelection = (selection: any) => {
  multipleIds.value = selection
}

const disabledBatchDel = computed(() => multipleIds.value.length === 0)
const disabledBatchPublish = computed(() => multipleIds.value.length === 0)
const disabledBatchStop = computed(() => multipleIds.value.length === 0)
const batchingDel = ref(false)
const batchingPublish = ref(false)
const batchingStop = ref(false)
const disabledType = ref(false)
const publishLoading = ref(false)
const screenTableRef = ref<typeof ScreenTable | null>(null)

const editDialog = ref(false)
const editForm = reactive({
  id: 0,
  name: '',
  lang: '',
  tags: []
})
const uploadDialog = ref(false)
const uploadForm = ref({
  lang: '1',
  tags: [],
  type: '',
  files: []
})
const uploading = ref(false)
const uploadFormRef = ref(null)
const formRules = reactive({
  lang: [{ required: true, trigger: 'change' }],
  name: [{ required: true, trigger: 'blur' }],
  type: [{ required: true, trigger: 'change' }],
})
const fileList = ref<any>([])
const uploadState = reactive({
  fileList: [],
  show: false,
  success: 0,
  fail: 0,
  type: 'expand'
})
const qaHref = ref('/preview/SampleQAData.xlsx')
const errorMsg = {
  'File is empty': 'The file is empty',
  'Invalid file format': 'Non-compliant with QA',
  'Error embedding content': 'Error embedding content',
  'Unknown error': 'Unknown error'
}
let times = 1
let timer: number = 0
const intervalFunc = async () => {
  if (timer) {
    clearInterval(timer)
    timer = 0
  }
  timer = setInterval(async () => {
    let find = false
    for (const i in uploadState.fileList) {
      const { state, parserState, docId } = uploadState.fileList[i]
      if (translateState(state, parserState) === 0 || translateState(state, parserState) === 3) {
        find = true
        continue
      }
      if (uploadState.fileList[i].error) {
        continue
      }
      if (translateState(state, parserState) === 1 || translateState(state, parserState) === 2) {
        if (docId && docId.length > 10) {
          try {
            const res = await query(docId)
            if (res && res.data) {
              uploadState.fileList[i].state = ~~res.data.state
              uploadState.fileList[i].parserState = ~~res.data.parserState
              tableData.list.forEach(item => {
                if (item.docId === res.data.docId) {
                  item.state = res.data.state
                  item.parserState = res.data.parserState
                  item.translateState = translateState(item.state, item.parserState)
                }
              })
            }
          } catch (e) {
            uploadState.fileList[i].error = e?.response?.data?.msg || 'Failed'
            console.log(e)
          }
        }
        if (uploadState.fileList[i].parserState <= 2) {
          find = true
        }
      }
    }
    uploadState.success = uploadState.fileList.filter(it => translateState(it.state, it.parserState) <= 2).length
    uploadState.fail = uploadState.fileList.filter(it => translateState(it.state, it.parserState) === 3).length
    times++
    if (!find || times > 600) {
      clearInterval(timer)
      times = 1
      timer = 0
      uploadState.show = false
      uploadState.fileList = []
      pushQuery({ refresh: replaceDate(new Date()) })
    }
  }, 1000)
}
let timesPublish = 1
let timerPublish: number = 0
const intervalFuncPublish = async () => {
  if (timerPublish) {
    clearInterval(timerPublish)
    timerPublish = 1
  }
  timerPublish = setInterval(async () => {
    let find = false
    tableData.list.forEach(async (item) => {
      if (item.translateState === 7) {
        find = true
        try {
          const res = await query(item.docId)
          if (res && res.data) {
            item.state = ~~res.data.state
            item.parserState = ~~res.data.parserState
            item.translateState = translateState(item.state, item.parserState)
          }
        } catch (e) {
          console.log(e)
        }
      }
    })
    timesPublish++
    if (!find || timesPublish > 600) {
      clearInterval(timerPublish)
      timesPublish = 1
      timerPublish = 0
    }
  }, 6000)
}

const inputTag = ref('')
const tagsInput = ref(false)
const inputTagsRef = ref()
const TAGS_TYPE = ["primary", "info", "warning", "error", "warning", "primary", "success", "success"]
const TagsOptions = reactive([
  { label: '全部', value: 'ALL' },
  { label: '医学', value: '医学' }, { label: '财经', value: '财经' },
  { label: '保险', value: '保险' }, { label: '其他', value: '其他' },
])
const searchInput = reactive({
  docName: '',
  docLang: 'ALL',
  state: 0,
  docType: 'ALL',
  docTags: ''
})
const filterLangOptions = computed(() => LangOptions.filter(item => item.value !== 'ALL'))
const filterTypeOptions = computed(() => TypeOptions.filter(item => item.value !== 'ALL'))
const filterTagsOptions = computed(() => TagsOptions.filter(item => item.value !== 'ALL'))
const search = (op) => {
  const params = {
    ...searchInput,
    ...queryState(searchInput.state),
    perPage: tableData.pagination.pageSize,
    page: tableData.pagination.current,
    ...op,
    refresh: replaceDate(new Date())
  }
  if (params.docLang === 'ALL') {
    delete params.docLang
  }
  if (params.docType === 'ALL') {
    delete params.docType
  }
  if (params.docTags === 'ALL') {
    delete params.docTags
  }
  delete params.state
  delete params.parserState
  pushQuery(params)
}
const reset = () => {
  searchInput.docName = ''
  searchInput.docLang = 'ALL'
  searchInput.state = 0
  searchInput.docType = 'ALL'
  searchInput.docTags = ''
  search({})
}

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
  searchInput.name = params.keywords
})

const handleBatchStop = async () => {
  screenTableRef.value?.toggleSelect([6])
  multipleIds.value = multipleIds.value.filter(it => it.translateState === 6)
  if (multipleIds.value.length === 0) {
    ElMessage.error(t('page.organizes.docus.selectHint'))
    return
  }
  let knowstring = ''
  for (let i = 0; i < multipleIds.value.length; i++) {
    const res = await association({ docId: multipleIds.value[i].docId })
    const knowledgeCount = res?.data || 0
    knowstring += t('page.organizes.docus.batchDeleteHint', { name: multipleIds.value[i].docName, count: knowledgeCount }) + ' /'
  }
  ElMessageBox.confirm(t('page.organizes.docus.stopHintDetail', { knowledgeCount: knowstring }), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    batchingStop.value = true
    let ids = multipleIds.value.map(item => item.docId)
    const idsStr = ids.join(',')
    const res = await stop({ ids: idsStr })
    ElMessage.success(t('page.organizes.successMessage'))
    batchingStop.value = false
    pushQuery({ refresh: replaceDate(new Date()) })
  }).catch(() => {
    batchingDel.value = false
  })
}

const handleBatchPublish = async () => {
  screenTableRef.value?.toggleSelect([5, 8])
  multipleIds.value = multipleIds.value.filter(item => item.translateState === 5 || item.translateState === 8)
  if (multipleIds.value.length === 0) {
    ElMessage.error(t('page.organizes.docus.selectHint'))
    return
  }
  batchingPublish.value = true
  let ids = multipleIds.value.map(item => item.docId)
  const idsStr = ids.join(',')
  const res = await publish({ ids: idsStr })
  ElMessage.success(t('page.organizes.successMessage'))
  batchingPublish.value = false
  intervalFuncPublish()
  pushQuery({ refresh: replaceDate(new Date()) })
}

const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) {
    ElMessage.error(t('page.organizes.docus.selectHint'))
    return
  }
  let knowstring = ''
  for (let i = 0; i < multipleIds.value.length; i++) {
    const res = await association({ docId: multipleIds.value[i].docId })
    const knowledgeCount = res?.data || 0
    knowstring += t('page.organizes.docus.batchDeleteHint', { name: multipleIds.value[i].docName, count: knowledgeCount }) + ' /'
  }
  ElMessageBox.confirm(t('page.organizes.docus.batchDeleteHintDetail', { knowledgeCount: knowstring }), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    batchingDel.value = true
    let ids = multipleIds.value.map(item => item.docId)
    const idsStr = ids.join(',')
    const res = await remove({ docIds: idsStr })
    ElMessage.success(t('page.organizes.docus.deleteSuccess'))
    batchingDel.value = false
    pushQuery({ refresh: replaceDate(new Date()) })
  }).catch(() => {
    batchingDel.value = false
  })
}

const handleTagClose = (type, tag) => {
  if (type === 'upload') {
    uploadForm.value.tags.splice(uploadForm.value.tags.indexOf(tag), 1)
  } else if (type === 'edit') {
    editForm.tags.splice(editForm.tags.indexOf(tag), 1)
  }
}

const showInputTag = () => {
  tagsInput.value = true
  inputTagsRef.value?.input?.focus()
}

const handleTag = (type, $event: TouchEvent) => {
  $event?.stopPropagation()
  if (inputTag.value) {
    if (type === 'upload') {
      uploadForm.value.tags.push(inputTag.value)
    } else if (type === 'edit') {
      editForm.tags.push(inputTag.value)
    }
  }
  tagsInput.value = false
  inputTag.value = ''
}

const handleAdd = async () => {
  uploadForm.value.type = '1'
  uploadForm.value.lang = 'zh-cn'
  uploadForm.value.tags = []
  uploadForm.value.files = []
  fileList.value = []
  disabledType.value = false
  uploadDialog.value = true
}

const showEdit = (row) => {
  editDialog.value = true
  editForm.row = row
  editForm.docId = row.docId
  editForm.name = row.docName
  editForm.lang = row.docLang
  editForm.tags = row.docTags ? row.docTags.split(',') : []
}

const handleEdit = async () => {
  const valid = editForm.lang && editForm.name
  if (!valid) {
    ElMessage.error(t('page.organizes.docus.errorForm'))
    return
  }
  await edit({
    docId: editForm.docId,
    docLang: editForm.lang,
    docName: editForm.name,
    docTags: editForm.tags.join(',')
  })
  ElMessage.success(t('page.organizes.successMessage'))
  editForm.row.docName = editForm.name
  editForm.row.docLang = editForm.lang
  editForm.row.docTags = editForm.tags.join(',')
  editForm.row.tags = editForm.tags
  editForm.row.lang = LANGS[editForm.lang]
  editForm.row.type = TYPES[editForm.type]
  editDialog.value = false
}

const handleReParse = async (row) => {
  await reParse({ docId: row.docId })
  row.parserState = 2
}

const handleConfirm = (row) => {
  router.push({
    path: '/organize/document/preview/' + row.docId
  })
}

const handlePublish = async (row) => {
  if (publishLoading.value) {
    ElMessage.error('Document publishing in progress. Please try again later.')
    return
  }
  publishLoading.value = true
  row['publishLoading'] = true
  try {
    await query(row.docId)
    const res = await publish({ ids: row.docId })
    if (res && ~~res.code !== 200) {
      ElMessage.error('System Error ' + res.msg)
      publishLoading.value = false
      row['publishLoading'] = false
      return
    }
    pushQuery({ refresh: replaceDate(new Date()) })
  } catch (e) {
    console.log(e)
  }
  row['publishLoading'] = false
  publishLoading.value = false
  intervalFuncPublish()
}

const handleStop = async (row) => {
  const res = await association({ docId: row.docId })
  row.knowledgeCount = res?.data || 0
  ElMessageBox.confirm(t('page.organizes.docus.stopHintDetail', { knowledgeCount: row.knowledgeCount }), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    await stop({ ids: row.docId })
    row.state = 4
    row.translateState = 5
  }).catch(() => {
  })
}

const handleDisable = (row, index) => {
  if (row.translateState > 2) {
    return true
  }
  return false
}

const iconType = (item: any) => {
  if (item.name.includes('.xls')) {
    return 'pk-xlsx'
  } else if (item.name.includes('.md')) {
    return 'pk-md'
  } else if (item.name.includes('.doc')) {
    return 'pk-docx'
  } else if (item.name.includes('.ppt')) {
    return 'pk-txt'
  } else if (item.name.includes('.txt')) {
    return 'pk-txt'
  }

  return 'pk-pdf'
}

watchEffect(() => {
  if (locale.value === 'zh-CN' || locale.value === 'zh-TW') {
    qaHref.value = '/preview/SampleQAData.xlsx'
  } else {
    qaHref.value = '/preview/SampleQAData-EN.xlsx'
  }
})

const beforeUpload = (file) => {
  if (uploadForm.value.type === '') {
    ElMessage.error(t('page.organizes.docus.errorType'))
    return false
  }
  const fileExt = file.name.replace(/.+\./, "")
  if (~~uploadForm.value.type === 2 && !['xlsx'].includes(fileExt)) {
    ElMessage.error('Please upload "QA" documents, including XLSX files.')
    return false
  }
  if (~~uploadForm.value.type !== 2 && !['docx', 'pdf', 'md'].includes(fileExt)) {
    ElMessage.error('Please upload "text" documents, including PDF, DOCX, and MD files.')
    return false
  }
  const fileName = file.name
  if (fileName.match(/\[|\]|\^|\$|￥/g)) {
    ElMessage.error('Please do not use special characters in the file name.')
    return false
  }
  const kb = 1024 * 1024 * 50
  if (kb < file.size) {
    ElMessage.error('Exceed Limit 50M' + file.name)
    return false
  }
  disabledType.value = true
  return true
}

const handleExceed = () => {
  ElMessage.error(t('page.organizes.docus.exceedLimit'))
}

const httpRequest = async (file) => {

}

const deleteFile = (index) => {
  fileList.value.splice(index, 1)
}

const deleteUploadStateFile = (index) => {
  uploadState.fileList.splice(index, 1)
  if (uploadState.fileList.length === 0) {
    uploadState.show = false
  }
}

const getMD5 = (file): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(file)
    reader.readAsText(file, 'utf-8')
    reader.onload = (e) => {
      const r = e.target.result
      const md5 = crypto.MD5(r).toString(crypto.enc.Hex)
      resolve(md5)
    }
  })
}

const handleUpload = async () => {
  const valid = uploadForm.value.tags.length > 0 && uploadForm.value.type && uploadForm.value.lang
  uploading.value = true
  uploadState.fileList = []
  uploadState.success = 0
  uploadState.fail = 0
  uploadState.type = 'expand'
  const md5Li = []

  const p = []
  for (let i = 0; i < fileList.value.length; i++) {
    const fd = new FormData()
    fd.append('docTags', uploadForm.value.tags.join(','))
    fd.append('docType', uploadForm.value.type)
    fd.append('docLang', uploadForm.value.lang)
    fd.append('file', fileList.value[i].raw);
    const md5 = await getMD5(fileList.value[i].raw)
    if (md5Li.includes(md5)) {
      ElMessage.error(t('page.organizes.docus.fileDup') + fileList.value[i].name)
      continue
    }
    md5Li.push(md5)
    uploadState.fileList[i] = {
      state: 0,
      parserState: 0,
      name: fileList.value[i].name,
      raw: fileList.value[i].raw,
      md5: md5,
      size: fileList.value[i].size
    }
    uploadState.success = uploadState.fileList.filter(it => translateState(it.state, it.parserState) <= 2).length
    uploadState.fail = uploadState.fileList.filter(it => translateState(it.state, it.parserState) === 3).length;
    // eslint-disable-next-line no-unexpected-multiline
    p.push(
      new Promise((resolve, reject) => {
        ((i, fd) => {
          add(fd).then(res => {
            if (res && typeof res.data === 'object') {
              if (res.data.code === 1 || res.data.code === 5) {
                uploadState.fileList[i].parserState = 4
                uploadState.fileList[i].error = t('page.organizes.docus.fileDup')
                ElMessage.error(t('page.organizes.docus.fileDup') + fd.get('file').name)
                resolve()
                return
              } else if (res && res.code !== 200) {
                uploadState.fileList[i].parserState = 4
                uploadState.fileList[i].error = res.msg
                reject()
              } else if (res && res.data) {
                res.data.lang = LANGS[res.data.docLang]
                res.data.type = TYPES[res.data.docType]
                res.data.tags = res.data.docTags ? res.data.docTags.split(',') : []
                res.data.translateState = translateState(res.data.state, res.data.parserState)
                tableData.list.unshift(res.data)
                if (uploadState.fileList[i]) {
                  uploadState.fileList[i].docId = res.data.docId
                  uploadState.fileList[i].state = res.data.state > 0 ? res.data.state : 1
                  uploadState.fileList[i].parserState = res.data.parserState ? res.data.parserState : 4
                }
                if (translateState(uploadState.fileList[i].state, uploadState.fileList[i].parserState) >= 4) {
                  query(res.data.docId)
                }
                if (translateState(uploadState.fileList[i].state, uploadState.fileList[i].parserState) === 3) {
                  delete uploadState.fileList[i]
                }
                ElMessage.success(t('page.organizes.docus.uploadSuccess') + fd.get('file').name)
              }
              resolve()
            } else if (res && res.code !== 200) {
              uploadState.fileList[i].parserState = 4
              uploadState.fileList[i].error = res.msg
              reject()
            }
          }).catch(e => {
            uploadState.fileList[i].parserState = 4
            uploadState.fileList[i].error = e.msg
            reject()
          })
        })(i, fd);
      })
    )
  }

  uploadForm.value.tags = []
  uploading.value = false
  uploadDialog.value = false
  uploadState.show = true
  intervalFunc()
  await Promise.all(p)
}

const handleDelete = async (index: number, row: TableListItem) => {
  const res = await association({ docId: row.docId })
  row.knowledgeCount = res && res.data ? res.data : 0
  await handleDel(index, row)
}

const handleDel = async (index: number, row: TableListItem): Promise<void> => {
  tableData.list[index]['delLoading'] = true
  try {
    ElMessageBox.confirm(t('page.organizes.docus.deleteHintDetail', { knowledgeCount: row.knowledgeCount }), t('page.organizes.docus.hint'), {
      confirmButtonText: t('page.organizes.docus.buttonSubmit'),
      cancelButtonText: t('page.organizes.docus.buttonCancel'),
      type: 'warning'
    }).then(async () => {
      await remove({ docIds: row.docId })
      ElMessage.success(t('page.organizes.docus.deleteSuccess'))
      if (tableData.list.length > 1) {
        tableData.list.splice(index, 1)
      } else {
        pushQuery({ refresh: replaceDate(new Date()) })
      }

    }).catch(() => {
      tableData.list[index]['delLoading'] = false
      return
    })
  } catch (error: any) {
    ElMessage.warning(error.msg || error || 'error')
    tableData.list[index]['delLoading'] = false
  }
}
onMounted(() => {
  intervalFuncPublish()
})
onUnmounted(() => {
  clearInterval(timer)
  clearInterval(timerPublish)
})

window.onbeforeunload = function () {
  if (uploadState.fileList.length) {
    return t('page.organizes.docus.unload')
  }
}
window.addEventListener('beforeunload', (event) => {
  if (uploadState.fileList.length) {
    event.returnValue = t('page.organizes.docus.upload')
  }
})
</script>
<style lang="scss">
@import "@/assets/css/chat/organize/scroll.scss";
@import "@/assets/css/chat/media.scss";
</style>
<style lang="scss" scoped>
@import "@/assets/css/chat/organize/global.scss";
@import "@/assets/css/chat/media.scss";

.wh24 {
  width: 1.5rem;
  height: 1.5rem
}

.wh16 {
  width: 1rem;
  height: 1rem
}

.span {
  background: var(--theme-bg-colorSpan);
}

.tags-input {
  width: 6.5rem;
}

::v-deep(.el-input__wrapper) {
  border-radius: 0.25rem;
  background: var(--theme-bg-colorSpan);
}

::v-deep(.el-select__wrapper) {
  border-radius: 0.25rem;
  background: var(--theme-bg-colorSpan);
}

::v-deep(.el-tag) {
  margin-right: 0.625rem;
}

.state1 {
  color: var(--theme-color-text);
  background: var(--theme-color-error);
  border-color: var(--theme-color-error);
}

.state2 {
  color: var(--theme-color-ff7d00);
  background: var(--theme-bg-colorFFF7E8);
  border-color: var(--theme-color-ff7d00);
}

.state3 {
  color: var(--theme-color-error);
  background: var(--theme-bg-colorFFECE8);
  border-color: var(--theme-color-error);
}

.state4 {
  color: var(--theme-color-f7ba1e);
  background: var(--theme-bg-colorFFF7E8);
  border-color: var(--theme-color-f7ba1e);
}

.state5 {
  color: var(--theme-color-wait);
  background: var(--theme-bg-wait);
  border-color: var(--theme-color-wait);
}

.state6 {
  color: var(--theme-color-00b42a);
  background: var(--theme-bg-colorHover);
  border-color: var(--theme-color-00b42a);
}

.state7 {
  color: var(--theme-color-ff7d00);
  background: var(--theme-bg-colorFFF7E8);
  border-color: var(--theme-color-ff7d00);
}

.state8 {
  color: var(--theme-color-error);
  background: var(--theme-bg-colorFFF7E8);
  border-color: var(--theme-color-error);
}

.uploadForm-flex {
  display: flex;

  ::v-deep(.el-tag) {
    margin-right: 0.625rem;
  }

  .uploadForm-left {
    padding-right: 0.625rem;
    border-right: 0.0625rem solid var(--theme-bg-colorChunk);

    .uploadForm {
      ::v-deep(.el-form-item) {
        margin-bottom: 1rem;
      }

      .uploadForm-upload {

        ::v-deep(.el-form-item__content) {
          line-height: 1.5rem;

          div {
            flex: 1;
          }
        }
      }

      ::v-deep(.el-upload-dragger) {
        background: var(--theme-bg-colorSpan);
        height: 14.4375rem;

        .upload {
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
          height: 100%;

          .upload-flex {
            flex: 0;
          }

          .upload-text {
            color: var(--theme-color-text);
          }

          .upload-hint {
            color: var(--theme-color-nodata);
          }
        }
      }
    }
  }

  .uploadForm-right {
    margin-left: 0.625rem;
    flex: 1;
  }

  .upload-progress-header {
    display: flex;

    .title {
      color: var(--theme-color-text);
    }

    .hint {
      flex: 1;
      text-align: right;
      color: var(--theme-color-font);
    }
  }

  .upload-file-list {
    margin-top: 0.625rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.25rem;
    border: 0.0625rem solid var(--theme-color-blur);
    padding: 1rem;
    gap: 0.625rem;

    .icon {}

    .title {
      flex: 1;

      .name {
        color: var(--theme-color-text);
        font-size: 0.75rem;
        line-height: 140%;
      }

      .kb {
        color: var(--theme-color-nodata);
        font-size: 0.625rem;
        line-height: 140%;
      }

    }

    .name {}

    .actions {
      cursor: pointer;

    }
  }
}

.edit-form {
  ::v-deep(.el-tag) {
    margin-right: 0.625rem;
  }
}

.upload-state {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  width: 29.25rem;
  display: flex;
  flex-flow: column;
  border-radius: 3.0625rem;
  background: #FFF;
  box-shadow: 0rem 0.625rem 1.0625rem 0rem rgba(0, 0, 0, 0.15);
  z-index: 16;

  .top {
    display: flex;
    width: 29.25rem;
    height: 4.375rem;
    align-items: center;
    font-family: "PingFang SC";
    font-style: normal;
    line-height: normal;
    gap: 1rem;

    .upload-state-icon {
      position: relative;
      top: -1rem;
    }

    .upload-state-title {
      color: var(--theme-color-text);
      font-size: 1rem;
      font-weight: 500;
    }

    .upload-state-success {
      color: var(--theme-color-detail);
      font-size: 0.875rem;
      font-weight: 400;
    }

    .upload-state-fail {
      color: var(--theme-color-error);
      font-size: 0.875rem;
      font-weight: 400;
    }

    .upload-state-expand {
      margin-right: 1rem;
      display: flex;
      justify-content: flex-end;
      flex: 1;
    }
  }

  .list {
    .upload-state-list {
      display: flex;
      margin: 0.5rem 1.125rem 0.5rem 1.5rem;
      align-items: center;
      border-radius: 0.25rem;
      border: 0.0625rem solid var(--theme-color-blur);
      padding: 0.75rem 1rem 0.75rem 1rem;
      gap: 0.5rem;

      .icon {}

      .name {
        width: 16rem;
        font-weight: 400;

        .text {
          font-size: 0.75rem;
          color: var(--theme-color-text);
          line-height: 140%;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;

        }

        .kb {
          color: var(--theme-color-nodata);
          font-size: 0.625rem;
          line-height: 140%;
        }
      }

      .actions {
        cursor: pointer
      }

      .state {
        color: var(--theme-color-font);
        font-size: 0.75rem;
        font-weight: 400;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .red {
        color: var(--theme-color-error);
        font-size: 0.75rem;
        font-weight: 400;
      }
    }

    .upload-state-list.red {
      border-radius: 0.25rem;
      border: 0.0625rem solid var(--theme-color-error);
    }
  }
}

.upload-state.expanded {
  border-radius: 1rem;
  background: #FFF;
  box-shadow: 0rem 0rem 1.0625rem -0.125rem rgba(0, 0, 0, 0.15);
}
</style>
