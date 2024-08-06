<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.monitor.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" size="small" @click="handleAdd">
          <template #icon>+</template>
          {{ t('page.organizes.monitor.add') }}
        </el-button>
        <el-button v-loading="batchingDel" :disabled="disabledBatchDel" type="danger" size="small"
          @click="handleBatchDel">
          <template #icon>
            <icon-svg type="pk-batchdelete"></icon-svg>
          </template>
          {{ t('page.organizes.monitor.delete') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="roleId" :loading="tableData.loading" :data="tableData.list"
      :pagination="tableData.pagination" @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.monitor.th-s-name') }}</span>
            <el-input v-model="searchInput.name" size="small" class="th-s-input"
              :placeholder="t('page.organizes.monitor.th-s-name-holder')"></el-input>
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.monitor.th-s-type') }}</span>
            <el-select v-model="searchInput.type" size="small" class="th-s-input" placeholder="请选择">
              <el-option v-for="item in typeOptions" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </el-col>
          <el-col :span="16">
            <div class="th-s">
              <el-button type="primary" size="small" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.monitor.search') }}</el-button>
              <el-button type="primary" size="small" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.monitor.reset') }}</el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisableSection"></el-table-column>
      <el-table-column prop="name" :label="t('page.organizes.monitor.th-s-name')"></el-table-column>
      <el-table-column prop="type" :label="t('page.organizes.monitor.th-s-type')">
        <template #default="{ row }">
          <span>{{ typeOptions.find(item => item.value === row.type)?.label }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" :label="t('page.organizes.monitor.th-s-description')"></el-table-column>
      <el-table-column prop="createTime" :label="t('page.organizes.monitor.th-s-createTime')">
        <template #default="{ row }">
          <span>{{ formatDate(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" :label="t('page.organizes.monitor.th-s-updateTime')">
        <template #default="{ row }">
          <span>{{ formatDate(row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.monitor.th-s-operate')" width="120">
        <div class="operations">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            <template #icon>
              <icon-svg type="pk-edit"></icon-svg>
            </template>
            {{ t('page.organizes.monitor.edit') }}
          </el-button>
          <el-button type="primary" size="small" @click="handleDel(row)">
            <template #icon>
              <icon-svg type="pk-delete"></icon-svg>
            </template>
            {{ t('page.organizes.monitor.delete') }}
          </el-button>
        </div>
      </el-table-column>
    </screen-table>
    <el-dialog v-model="monitorDialog" :title="t('page.organizes.monitor.dialog-title')" :close-on-modal="false"
      :close-on-click-modal="false">
      <el-form ref="monitorFormRef" :model="monitorForm" :rules="monitorRules" label-width="200px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="monitorForm.name"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="monitorForm.type" placeholder="请选择">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label"
              :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="monitorForm.description"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" text size="small" @click="handleSubmit">
            {{ t('page.organizes.monitor.save') }}
          </el-button>
          <el-button type="primary" tex size="small" @click="handleCancel">
            {{ t('page.organizes.monitor.cancel') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IconSvg from '@/components/IconSvg'
import ScreenTable from '@/components/ScreenTable/index.vue'
import useQueryList from '@/composables/useQueryList'
import { ResponseData } from '@/utils/request'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import { queryList, query, add, edit, remove, status } from './service'
import { StateType as GlobalStateType } from '@/store/global'

import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const store = useStore<GlobalStateType>()
const router = useRouter()

const tableData = reactive<TableDataType>({
  loading: false,
  list: [] as TableListItem[],
  pagination: {
    total: 0,
    current: 1,
    pageSize: 10,

    sizeChange: () => { },
    onChange: (page: number) => { }
  }
})
const multipleIds = ref<TableListItem[]>([])
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/monitor', async (queryParams, pushQuery): Promise<void> => {
  tableData.loading = true
  const response: ResponseData = await queryList(queryParams)

  const { rows, data } = response
  const list: TableListItem[] = rows || data
  tableData.list = list.map(item => {
    return item
  })
  tableData.pagination = {
    total: response.total,
    current: queryParams.page,
    pageSize: queryParams.perPage,
    sizeChange: (size) => search({ perPage: size, page: 1 }),
    onChange: (page) => search({ page })
  }
  tableData.loading = false
})

const disabledBatchDel = computed(() => multipleIds.value.length === 0)
const batchingDel = ref(false)

const monitorDialog = ref(false)
const monitorFormRef = ref(null)
const monitorForm = reactive({
  name: '',
  type: '',
  description: ''
})
const monitorRules = reactive({
  name: [
    { required: true, message: t('page.organizes.monitor.name-required'), trigger: 'blur' }
  ],
  type: [
    { required: true, message: t('page.organizes.monitor.type-required'), trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('page.organizes.monitor.description-required'), trigger: 'blur' }
  ]
})
const loading = ref(false)

const searchInput = reactive({
  name: '',
  type: ''
})
const typeOptions = ref([])

const handleSelection = (selection: TableListItem[]) => {
  multipleIds.value = selection
}

const search = (op: any) => {
  const data = { ...searchInput }
  pushQuery({
    ...data,
    page: tableData.pagination.current,
    perPage: tableData.pagination.pageSize,
    ...op,
  })
}
const reset = () => {
  searchInput.name = ''
  searchInput.type = ''
  search({ page: 1 })
}
const handleDisableSection = (selection: TableListItem[]) => {
  return true
}
const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) {
    ElMessage.warning(t('page.organizes.monitor.batch-del-warning'))
    return
  }
  const ids = multipleIds.value.map(item => item.id).join(',')
  ElMessageBox.confirm(t('page.organizes.role.deleteHintDetail'), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    batchingDel.value = true
    await remove({ ids })
    ElMessage.success(t('page.organizes.docus.deleteSuccess'))
    batchingDel.value = false
  }).catch(() => {
    batchingDel.value = false
  })
}
const handleEdit = (row: TableListItem) => {
  monitorForm.name = row.name
  monitorForm.type = row.type
  monitorForm.description = row.description
  monitorDialog.value = true
}
const handleAdd = () => {
  monitorForm.name = ''
  monitorForm.type = ''
  monitorForm.description = ''
  monitorDialog.value = true
}
const handleSubmit = async () => {
  loading.value = true
  if (monitorFormRef.value) {
    const valid = monitorFormRef.value.validate()
    if (!valid) {
      loading.value = false
      return
    }
    if (monitorForm.id) {
      await edit(monitorForm)
      ElMessage.success(t('page.organizes.docus.editSuccess'))
    } else {
      await add(monitorForm)
      ElMessage.success(t('page.organizes.docus.addSuccess'))
    }
  }
  pushQuery({})
  monitorDialog.value = false
  loading.value = false
}
const handleDelete = async (row: TableListItem) => {
  ElMessageBox.confirm(t('page.organizes.role.deleteHintDetail'), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    await remove({ ids: row.roleId })
    ElMessage.success(t('page.organizes.docus.deleteSuccess'))
  }).catch(() => {
  })
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
<style scoped lang="scss">
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
  max-width: calc(100vw - 14.125rem);

  .th-s-label {}

}
</style>
