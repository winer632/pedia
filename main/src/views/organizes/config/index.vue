<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.config.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" @click="handleAdd">
          <template #icon>+</template>
          {{ t('page.organizes.config.add') }}
        </el-button>
        <el-button v-loading="bacthingDel" :disabled="disabledBatchDel" type="danger" @click="handleBatchDel">
          <template #icon>
            <icon-svg type="pk-batchdelete"></icon-svg>
          </template>
          {{ t('page.organizes.config.delete') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="roleId" :data="tableData.list" :loading="tableData.loading"
      :pagination="tableData.pagination" @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.config.th-s-name') }}</span>
            <el-input v-model="searchInput.name" :placeholder="t('page.organizes.config.th-s-name-holder')" />
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.config.th-s-code') }}</span>
            <el-input v-model="searchInput.code" :placeholder="t('page.organizes.config.th-s-code-holder')" />
          </el-col>
          <el-col :span="16">
            <div class="th-s">
              <el-button type="primary" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.config.search') }}
              </el-button>
              <el-button @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.config.reset') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisableSection"></el-table-column>
      <el-table-column prop="name" :label="t('page.organizes.config.th-s-name')"></el-table-column>
      <el-table-column prop="code" :label="t('page.organizes.config.th-s-code')"></el-table-column>
      <el-table-column prop="description" :label="t('page.organizes.config.th-s-description')"></el-table-column>
      <el-table-column prop="createTime" :label="t('page.organizes.config.th-s-createTime')"></el-table-column>
      <el-table-column prop="updateTime" :label="t('page.organizes.config.th-s-updateTime')"></el-table-column>
      <el-table-column prop="creator" :label="t('page.organizes.config.th-s-creator')"></el-table-column>
      <el-table-column prop="updater" :label="t('page.organizes.config.th-s-updater')"></el-table-column>
      <el-table-column prop="status" :label="t('page.organizes.config.th-s-status')"></el-table-column>
      <el-table-column label="t('page.organizes.config.th-s-operate')" width="120">
        <template #default="{ row, $index }">
          <div class="operation">
            <el-button type="text" @click="handleEdit(row, $index)">
              <template #icon>
                <icon-svg type="pk-edit"></icon-svg>
              </template>
              {{ t('page.organizes.config.edit') }}
            </el-button>
            <el-button type="text" @click="handleDelete(row, $index)">
              <template #icon>
                <icon-svg type="pk-delete"></icon-svg>
              </template>
              {{ t('page.organizes.config.delete') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-dialog v-model="configDialog" :title="t('page.organizes.config.dialog.title')" :close-on-modal="false">
        <el-form ref="configFormRef" :model="configForm" :rules="configRules" label-width="120px">
          <el-form-item label="page.organizes.config.dialog.name">
            <el-input v-model="configForm.name"></el-input>
          </el-form-item>
          <el-form-item label="page.organizes.config.dialog.code">
            <el-input v-model="configForm.code"></el-input>
          </el-form-item>
          <el-form-item label="page.organizes.config.dialog.description">
            <el-input v-model="configForm.description"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="configDialog = false">{{ t('page.organizes.config.dialog.cancel') }}</el-button>
            <el-button type="primary" @click="handleConfig">{{ t('page.organizes.config.dialog.confirm') }}</el-button>
          </div>
        </template>
      </el-dialog>
    </screen-table>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
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
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/config', async (queryParams, pushQuery): Promise<void> => {
  tableData.loading = true
  const response: ResponseData = await queryList(queryParams)

  const { rows, data } = response
  const list: TableListItem[] = rows || data
  tableData.list = list.map((item: TableListItem) => {
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

const disabledBatchDel = computed(() => multipleIds.value.length === 0)
const batchingDel = ref(false)

const searchInput = reactive<TableListQueryParams>({
  name: '',
  code: ''
})

const configDialog = ref(false)
const configForm = ref<TableListItem>({
  name: '',
  code: '',
  description: ''
})
const configRules = reactive<Record<string, any>>({
  name: [
    { required: true, message: t('page.organizes.config.rules.name'), trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('page.organizes.config.rules.code'), trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('page.organizes.config.rules.description'), trigger: 'blur' }
  ]
})
const loading = ref(false)

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
  searchInput.code = ''
  search({ page: 1 })
}

const handleDisableSection = (row: TableListItem, index: number) => {
  return true
}

const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) {
    ElMessage.warning(t('page.organizes.config.batch-del-warning'))
    return
  }
  const ids = multipleIds.value.map(item => item.roleId).join(',')
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


const handleEdit = (row: TableListItem, index: number) => {
  configDialog.value = true
  configForm.value = { ...row }
}

const handleSelection = (selection: TableListItem[]) => {
  multipleIds.value = selection
}

const handleAdd = () => {
  configDialog.value = true
  configForm.value = {
    name: '',
    code: '',
    description: ''
  }
}

const handleSubmit = async () => {
  loading.value = true
  if (configForm.value.roleId) {
    const valid = configForm.value.validate()
    if (!valid) {
      loading.value = false
      return
    }
    if (configForm.value.roleId) {
      await edit(configForm.value)
      ElMessage.success(t('page.organizes.docus.editSuccess'))
    } else {
      await add(configForm.value)
      ElMessage.success(t('page.organizes.docus.addSuccess'))
    }
  }
  configDialog.value = false
  loading.value = false
}

const handleDelete = async (row: TableListItem, index: number) => {
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
  max-width: calc(100vw - 14.725rem);

  .th-s-label {}

}
</style>
