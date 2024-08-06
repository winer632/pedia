<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.logs.topNav') }}
      </div>
    </div>

    <screen-table row-key="id" :data="tableData.list" :loading="tableData.loading" :pagination="tableData.pagination"
      @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="12">
            <span class="th-s-label">{{ t('page.organizes.logs.th-s-datetime') }}</span>
            <el-date-picker v-model="searchInput.datetime" type="datetimerange" start-placeholder="Start Date"
              end-placeholder="End Date" format="YYYY-MM-DD HH:mm:ss" date-format="YYYY/MM/DD ddd"
              time-format="A hh:mm:ss" />
          </el-col>
          <el-col :span="2">
            <span class="th-s-label">{{ t('page.organizes.logs.th-s-member') }}</span>
          </el-col>
          <el-col :span="3">
            <el-select v-model="searchInput.memberIds" multiple
              :placeholder="t('page.organizes.logs.th-s-member-holder')">
              <el-option v-for="item in members" :key="item.userId" :label="item.loginName" :value="item.userId" />
            </el-select>
          </el-col>
          <el-col :span="7">
            <div class="th-s">
              <el-button class="th-s-button" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.logs.reset') }}
              </el-button>
              <el-button v-loading="previewing" :disabled="searchInput.datetime === null" type="primary"
                @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.logs.search') }}
              </el-button>
              <el-button v-loading="loading" type="primary" @click="handleExport">
                {{ t('page.organizes.logs.export') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column label="Id" prop="id" width="55">
      </el-table-column>
      <el-table-column sortable label="CreateTime" prop="createTime" width="160">
      </el-table-column>
      <el-table-column label="SessionId" prop="sessionId" width="100">
      </el-table-column>
      <el-table-column label="UserId" prop="uid" width="100">
      </el-table-column>
      <el-table-column label="DocumentId" prop="docId" width="160">
      </el-table-column>
      <el-table-column label="DocumentName" prop="docName" width="160" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="KnowledgeId" prop="knowledgeId" width="160" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="KnowledgeName" prop="knowledgeName" width="160" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="Query" prop="query" width="160">
      </el-table-column>
      <el-table-column label="Chat Status" prop="chatStatus" width="160">
      </el-table-column>
      <el-table-column label="Answer" prop="answer" width="460">
      </el-table-column>
      <el-table-column label="ConversationId" prop="conversationId" width="160">
      </el-table-column>
      <el-table-column label="PreConversationId" prop="preConversationId" width="160">
      </el-table-column>
      <el-table-column label="References" prop="references" width="260" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="Top K" prop="topk" width="260" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="Knowledge Base" prop="knowledges" width="160">
      </el-table-column>
      <el-table-column label="Score" prop="score" width="100">
      </el-table-column>
      <el-table-column label="Comment" prop="comment" width="100">
      </el-table-column>
    </screen-table>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import IconSvg from '@/components/IconSvg'
import ScreenTable from '@/components/ScreenTable/index.vue'
import useQueryList from '@/composables/useQueryList'
import { replaceDate } from '@/utils/date'
import { ResponseData } from '@/utils/request'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import { queryList, queryAll, exportLog, add, edit, remove, tree } from './service'
import { StateType as GlobalStateType } from '@/store/global'
import { read, utils, readFile, SSF } from 'xlsx'

import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const tableClass = ref('custom-table')
const rowName = ref('custom-table-header')

const { t } = useI18n()
const store = useStore<GlobalStateType>()
const router = useRouter()

const members = ref<TableListItem[]>([])
const loading = ref<boolean>(false)
const previewing = ref<boolean>(false)
const url = ref<string>('')
const json = ref<any>([])

const tableData = reactive<TableDataType>({
  loading: false,
  list: [],
  pagination: {
    total: 0,
    current: 1,
    pageSize: 10,
    sizeChange: () => { },
    onChange: (page: number) => { }
  },
})

const multipleIds = ref<TableListItem[]>([])
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/log', async (queryParams, pushQuery): Promise<any> => {
  if (queryParams.from === undefined) return
  tableData.loading = true
  const response: ResponseData = await queryList(queryParams)

  const { rows, data } = response
  const list: TableListItem[] = rows || data || []
  tableData.list = list.map(item => {
    return item
  })
  tableData.pagination = {
    total: response.total || 0,
    current: queryParams.page,
    pageSize: queryParams.perPage,
    sizeChange: (size) => search({ perPage: size, page: 1 }),
    onChange: (page: number) => search({ page })
  }
  tableData.loading = false
})

const handleSelection = (selection: TableListItem[]) => {
  multipleIds.value = selection
}

const week = () => {
  const date = new Date()
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  date.setDate(date.getDate() - 7)
  return date
}
const today = () => {
  const date = new Date()
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

const searchInput = reactive<TableListQueryParams>({
  datetime: [week(), new Date()],
  memberId: ''
})


const search = (op: any) => {
  const data = { ...searchInput, ...op }
  data.from = replaceDate(searchInput.datetime[0])
  data.to = replaceDate(searchInput.datetime[1])
  data.userIds = searchInput.memberIds.length > 0 ? searchInput.memberIds.join(',') : members.value.map(item => item.userId).join(',')
  delete data.datetime
  pushQuery(data)
}

const reset = () => {
  searchInput.datetime = [week(), new Date()]
  searchInput.memberIds = []
  search({ refresh: replaceDate(new Date()) })
}

const handlePreview = async () => {
  previewing.value = true

  if (searchInput.datetime === null) {
    previewing.value = false
    return
  }

  try {
    const data = {
      userIds: '',
      from: replaceDate(searchInput.datetime[0]),
      to: replaceDate(searchInput.datetime[1]),
    }
    if (searchInput.memberIds.length === 0) {
      data.userIds = members.value.map(item => item.userId).join(',')
    } else {
      data.userIds = searchInput.memberIds.join(',')
    }
    const blob = await exportLog(data)
    url.value = window.URL.createObjectURL(blob)
    const ab = await blob.arrayBuffer()
    const wb = read(ab)
    const ws = wb.Sheets[wb.SheetNames[0]]
    json.value = utils.sheet_to_json(ws)
    if (json.value) {
      json.value.forEach(data => {
        data.Time = SSF.format('yyyy/mm/dd hh:mm:ss', data.Time)
      })
    }
  } catch (error) {
    console.log(error)
  }
  previewing.value = false
}

const download = () => {
  if (url.value === '') {
    return
  }
  const a = document.createElement('a')
  a.href = url.value
  a.download = 'preview-logs.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url.value)
}

const handleExport = async () => {
  loading.value = true

  if (searchInput.datetime === null) {
    loading.value = false
    return
  }

  try {
    const data = {
      userIds: '',
      from: replaceDate(searchInput.datetime[0]),
      to: replaceDate(searchInput.datetime[1]),
    }
    if (searchInput.memberIds.length === 0) {
      data.userIds = members.value.map(item => item.userId).join(',')
    } else {
      data.userIds = searchInput.memberIds.join(',')
    }
    const blob = await exportLog(data)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'logs.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.log(error)
  }
  loading.value = false
}

const loadMembers = async () => {
  const res = await tree()
  if (res && res.data) {
    const subTree = (tree) => {
      tree && tree.forEach(item => {
        if (item.subList && item.subList.length > 0) {
          item && subTree(item.subList)
        }
        members.value.push(item)
      })
    }
    res.data.subList = res.data.subList || []
    members.value = res.data.subList
    res.data.subList.forEach(item => {
      item && subTree(item.subList)
    })
    if (members.value.findIndex(item => item.userId === res.data.userId) === -1) {
      members.value.push(res.data)
    }
  }
}

onMounted(async () => {
  await loadMembers()
  window.document.documentElement.style.setProperty('--el-popper-width', 'fit-content')
})
onUnmounted(() => {

})
</script>
<style lang="scss">
@import "@/assets/css/chat/organize/scroll.scss";
@import "@/assets/css/chat/media.scss";
</style>
<style scoped lang="scss">
@import "@/assets/css/chat/organize/global.scss";
@import "@/assets/css/chat/media.scss";

::v-deep(.el-input__wrapper) {
  border-radius: 0.25rem;
  background: var(--bg-color);
}

::v-deep(.el-datepicker) {
  border-radius: 0.25rem;
  background: var(--bg-color);
}

::v-deep(.el-row) {
  width: 100%;
}

::v-deep(.el-col) {
  justify-content: flex-end;
}

.main {
  width: auto;
  display: flex;
  flex-flow: column;
  max-width: 100vw;
  --el-popper-width: fit-content;

  .flex {
    display: flex;
  }

  .splitNext {
    margin-top: 0.625rem;
  }

  .th-s-label {
    margin: 0.5rem;
    width: fit-content;
    text-align: right;
    display: inline-block;
  }

  .th-s {
    display: flex;
    align-items: center;
  }
}
</style>
