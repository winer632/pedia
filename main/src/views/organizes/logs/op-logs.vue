<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.logs.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" @click="handleExport">
          {{ t('page.organizes.logs.export') }}
        </el-button>
        <el-button type="primary" @click="handleBatchDelete">
          {{ t('page.organizes.logs.delete') }}
        </el-button>
        <el-button type="primary" @click="handleAdd">
          {{ t('page.organizes.logs.add') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="id" :loading="tableData.loading" :data="tableData.list" :pagination="tableData.pagination"
      @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.logs.th-s-role-name') }}</span>
            <el-input class="th-s-input" v-model="searchInput.roleName"
              :placeholder="t('page.organizes.logs.th-s-role-name-holder')" />
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.role.th-s-role-key') }}</span>
            <el-input class="th-s-input" v-model="searchInput.roleKey"
              :placeholder="t('page.organizes.role.th-s-role-key-holder')" />
          </el-col>
          <el-col :span="16">
            <div class="th-s">
              <el-button class="th-s-button" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.logs.reset') }}
              </el-button>
              <el-button class="th-s-button" @click="handleSearch">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.logs.search') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisableSelection"></el-table-column>

      <el-table-column :label="t('page.organizes.logs.th-b-role-name')" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.role.th-b-role-key')" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.logs.th-b-operator')" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.logs.th-b-operator-ip')" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.logs.th-b-operator-time')" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.logs.th-b-remark')" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.logs.th-b-operate-type')" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.logs.th-b-operate-result')" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.logs.th-b-operate-result-detail')" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.role.th-b-operate')">
        <template #default="{ row, $index }">
          <el-button type="text" @click="handleEdit(row, $index)">
            {{ t('page.organizes.logs.edit') }}
          </el-button>
          <el-button type="text" @click="handleDelete(row)">
            {{ t('page.organizes.logs.delete') }}
          </el-button>
          <el-button type="text" @click="handleDetail(row)">
            {{ t('page.organizes.logs.detail') }}
          </el-button>
        </template>
      </el-table-column>
    </screen-table>
    <el-dialog v-model="logsDialog" :title="t('page.organizes.logs.dialog-title')" :close-on-modal="false"
      :close-on-press-escape="false">
      <div class="logs-form">
        <el-form>
          <el-form-item :label="t('page.organizes.role.dialog-role-name')">
            {{ t('page.organizes.role.dialog-role-name') }}
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import IconSvg from '@/components/IconSvg'
import ScreenTable from '@/components/ScreenTable/index.vue'
import useQueryList from '@/composables/useQueryList'
import { ResponseData } from '@/utils/request'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import { queryList, query, add, edit, remove } from './service'
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
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/logs', async (queryParams, pushQuery): Promise<void> => {
  tableData.loading = true
  const response: ResponseData = await queryList(queryParams)

  const { rows, data } = response
  const list: TableListItem[] = rows || data
  tableData.list = list.map((item: TableListItem) => {
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

const searchInput = reactive<TableListQueryParams>({
  roleName: '',
  roleKey: ''
})

const logsDialog = ref(false)
const logsDialogLoading = ref(false)
const logsForm = reactive<TableListItem>({
  name: '',
})
const logsFormRef = ref(null)

const search = (op: any) => {
  const data = { ...searchInput }
  pushQuery({
    ...data,
    page: tableData.pagination.current,
    perPage: tableData.pagination.pageSize,
    ...op
  })
}

const reset = () => {
  searchInput.roleName = ''
  searchInput.roleKey = ''
  search({ page: 1 })
}

const handleDisableSelection = (row) => {
  return true
}

const handleSelection = (selection: TableListItem[]) => {
  multipleIds.value = selection
}

const handleBatchDelete = async () => {
  if (multipleIds.value.length === 0) {
    return
  }
  const ids = multipleIds.value.map((item) => item.id).join(',')
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

const handleAdd = async () => {
  logsDialog.value = true
  logsForm.name = ''
}

const handleEdit = async (row: TableListItem) => {
  logsDialog.value = true
  logsForm.name = row.name
}

const handleExport = async () => {
}

const handleDetail = async (row: TableListItem) => {
}

const handleSubmit = async () => {
  logsDialog.value = false
  if (logsFormRef.value) {
    const valid = await logsFormRef.value.validate()
    if (!valid) {
      ElMessage.error(t('page.organizes.logs.validateError'))
      return
    }
    if (logsForm.id) {
      await edit(logsForm)
    } else {
      await add(logsForm)
    }
    ElMessage.success(t('page.organizes.docus.saveSuccess'))
  }
  logsDialog.value = false
  logsDialogLoading.value = false
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

::v-deep(.el-datepicker) {
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
../data../service
