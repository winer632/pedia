<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.menu.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" size="mini" @click="handleAdd">
          <template #icon>+</template>
          {{ t('page.organizes.menu.add') }}
        </el-button>
        <el-button v-loading="batchingDel" :disabled="disabledBatchDel" type="danger" size="mini"
          @click="handleBatchDel">
          <template #icon>
            <icon-svg type="pk-batchdelete"></icon-svg>
          </template>
        </el-button>
      </div>
    </div>

    <screen-table row-key="id" :data="tableData.list" :loading="tableData.loading" :pagination="tableData.pagination"
      @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.menu.th-s-name') }}</span>
            <el-input v-model="searchInput.name" size="mini" :placeholder="t('page.organizes.menu.th-s-name-holder')" />
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.menu.th-s-code') }}</span>
            <el-input v-model="searchInput.code" size="mini" :placeholder="t('page.organizes.menu.th-s-code-holder')" />
          </el-col>
          <el-col :span="16">
            <div class="th-s">
              <el-button type="primary" size="mini" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.menu.search') }}
              </el-button>
              <el-button type="primary" size="mini" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.menu.reset') }}</el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisableSelection"></el-table-column>
      <el-table-column prop="name" :label="t('page.organizes.menu.th-s-name')"></el-table-column>
      <el-table-column prop="code" :label="t('page.organizes.menu.th-s-code')"></el-table-column>
      <el-table-column prop="description" :label="t('page.organizes.menu.th-s-description')"></el-table-column>
      <el-table-column prop="status" :label="t('page.organizes.menu.th-s-status')"></el-table-column>
      <el-table-column :label="t('page.organizes.menu.th-s-operate')">
        <template #default="{ row }">
          <div class="operation">
            <el-button type="text" size="mini" @click="handleEdit(row)">
              <template #icon>
                <icon-svg type="pk-edit"></icon-svg>
              </template>
              {{ t('page.organizes.menu.edit') }}
            </el-button>
            <el-button type="text" size="mini" @click="handleDelete(row)">
              <template #icon>
                <icon-svg type="pk-delete"></icon-svg>
              </template>
              {{ t('page.organizes.menu.delete') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </screen-table>
    <el-dialog v-model="menuDialog" :title="t('page.organizes.menu.dialog.title')" :close-on-click-modal="false">
      <el-form ref="menuFormRef" :model="menuForm" :rules="menuFormRules" label-width="200px">
        <el-form-item label="{{ t('page.organizes.menu.dialog.name') }}" prop="name">
          <el-input v-model="menuForm.name"></el-input>
        </el-form-item>
        <el-form-item label="{{ t('page.organizes.menu.dialog.code') }}" prop="code">
          <el-input v-model="menuForm.code"></el-input>
        </el-form-item>
        <el-form-item label="{{ t('page.organizes.menu.dialog.description') }}" prop="description">
          <el-input v-model="menuForm.description"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="menuDialog = false">{{ t('page.organizes.menu.dialog.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ t('page.organizes.menu.dialog.submit') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
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
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/menu', async (queryParams, pushQuery): Promise<void> => {
  tableData.loading = true
  const response: ResponseData = await queryList(queryParams)

  const { rows, data } = response
  const list: TableListItem[] = rows || data
  tableData.list = list.map(item => {
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

const menuDialog = ref(false)
const menuFormRef = ref(null)
const menuForm = reactive<TableListItem>({
  id: '',
  name: '',
  code: '',
  description: ''
})
const menuFormRules = reactive({
  name: [
    { required: true, message: t('page.organizes.menu.dialog.name-required'), trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('page.organizes.menu.dialog.code-required'), trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('page.organizes.menu.dialog.description-required'), trigger: 'blur' }
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
const handleSelection = (selection: TableListItem[]) => {
  multipleIds.value = selection
}

const handleDisableSelection = (selection: TableListItem[]) => {
  return multipleIds.value.length > 0
}
const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) return
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
const handleEdit = async (row: TableListItem) => {
  menuForm.id = row.id
  menuForm.name = row.name
  menuForm.code = row.code
  menuForm.description = row.description
  menuDialog.value = true
}
const handleAdd = async () => {
  menuForm.id = ''
  menuForm.name = ''
  menuForm.code = ''
  menuForm.description = ''
  menuDialog.value = true
}
const handleSubmit = async () => {
  loading.value = true
  if (menuFormRef.value) {
    const valid = menuFormRef.value.validate()
    if (!valid) {
      loading.value = false
      return
    }
    if (menuForm.id) {
      await edit(menuForm)
      ElMessage.success(t('page.organizes.docus.editSuccess'))
    } else {
      await add(menuForm)
      ElMessage.success(t('page.organizes.docus.addSuccess'))
    }
  }
  menuDialog.value = false
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
  max-width: calc(100vw - 14.725rem);

  .th-s-label {}

}
</style>
