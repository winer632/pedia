<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.tgi.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" size="small" @click="handleAdd">
          <template #icon>+</template>
          {{ t('page.organizes.tgi.add') }}
        </el-button>
        <el-button v-loading="batchingDel" :disabled="disabledBatchDel" type="danger" size="small"
          @click="handleBatchDel">
          <template #icon>
            <icon-svg type="pk-delete"></icon-svg>
          </template>
          {{ t('page.organizes.tgi.delete') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="roleId" :data="tableData.list" :pagination="tableData.pagination"
      :loading="tableData.loading" @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.tgi.th-s-name') }}</span>
            <el-input v-model="searchInput.name" placeholder="{{ t('page.organizes.tgi.th-s-name-holder') }}" />
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.tgi.th-s-description') }}</span>
            <el-input v-model="searchInput.decription"
              placeholder="{{ t('page.organizes.tgi.th-s-description-holder') }}" />
          </el-col>
          <el-col :span="16">
            <div class="th-s">
              <el-button type="primary" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.tgi.search') }}</el-button>
              <el-button @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.tgi.reset') }}</el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisableSelection"></el-table-column>
      <el-table-column prop="name" :label="t('page.organizes.tgi.th-s-name')"></el-table-column>
      <el-table-column prop="description" :label="t('page.organizes.tgi.th-s-description')"></el-table-column>
      <el-table-column prop="createTime" :label="t('page.organizes.tgi.th-s-createTime')" width="150"></el-table-column>
      <el-table-column prop="updateTime" :label="t('page.organizes.tgi.th-s-updateTime')" width="150"></el-table-column>
      <el-table-column prop="creator" :label="t('page.organizes.tgi.th-s-creator')"></el-table-column>
      <el-table-column prop="updater" :label="t('page.organizes.tgi.th-s-updater')"></el-table-column>
      <el-table-column :label="t('page.organizes.tgi.th-s-operate')" width="150">
        <template #default="{ row }">
          <div class="operations">
            <el-button type="text" size="small" @click="handleEdit(row)">
              <template #icon>
                <icon-svg type="pk-edit"></icon-svg>
              </template>
              {{ t('page.organizes.tgi.edit') }}</el-button>
            <el-button type="text" size="small" @click="handleDel(row)">
              <template #icon>
                <icon-svg type="pk-delete"></icon-svg>
              </template>
              {{ t('page.organizes.tgi.delete') }}</el-button>
          </div>
        </template>
      </el-table-column>
    </screen-table>
    <el-dialog v-model="tgiDialog" :title="t('page.organizes.tgi.dialog.title')" :close-on-modal="false"
      :close-on-click-modal="false">
      <el-form ref="tgiFormRef" :model="tgiForm" :rules="tgiRules" label-width="100px">
        <el-form-item :label="t('page.organizes.tgi.dialog.name')" prop="name">
          <el-input v-model="tgiForm.name"></el-input>
        </el-form-item>
        <el-form-item :label="t('page.organizes.tgi.dialog.description')" prop="description">
          <el-input v-model="tgiForm.description"></el-input>
        </el-form-item>
        <el-form-item :label="t('page.organizes.tgi.dialog.creator')" prop="creator">
          <el-input v-model="tgiForm.creator"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="tgiDialog = false">{{ t('page.organizes.tgi.dialog.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ t('page.organizes.tgi.dialog.submit') }}</el-button>
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
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/tgi', async (queryparams) => {
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

const tgiDialog = ref(false)
const tgiForm = reactive<TableListQueryParams>({
  name: '',
  description: '',
  page: 1,
  perPage: 10
})
const tgiRules = reactive<Record<string, any>>({
  name: [
    { required: true, message: t('page.organizes.tgi.rules.name.required'), trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('page.organizes.tgi.rules.description.required'), trigger: 'blur' }
  ],
  creator: [
    { required: true, message: t('page.organizes.tgi.rules.creator.required'), trigger: 'blur' }
  ]
})
const tgiFormRef = ref(null)
const loading = ref(false)

const searchInput = reactive<TableListQueryParams>({
  name: '',
  description: '',
  page: 1,
  perPage: 10
})

const handleSelection = (selection: TableListItem[]) => {
  multipleIds.value = selection
}
const handleDisableSelection = (row: TableListItem) => {
  return true
}
const search = (op) => {
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
  searchInput.description = ''
  search({ page: 1, perPage: 10 })
}

const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) {
    ElMessage({
      message: t('page.organizes.tgi.batch-del-empty'),
      type: 'warning'
    })
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
const handleEdit = async (row: TableListItem) => {
  tgiDialog.value = true
  tgiForm.name = row.name
  tgiForm.description = row.description
  tgiForm.creator = row.creator
}
const handleAdd = () => {
  tgiDialog.value = true
  tgiForm.name = ''
  tgiForm.description = ''
  tgiForm.creator = ''
}
const handleSubmit = async () => {
  loading.value = true
  if (tgiFormRef.value) {
    const valid = tgiFormRef.value.validate()
    if (!valid) {
      loading.value = false
      return
    }
    if (tgiForm.id) {
      await edit(tgiForm)
      ElMessage.success(t('page.organizes.docus.editSuccess'))
    } else {
      await add(tgiForm)
      ElMessage.success(t('page.organizes.docus.addSuccess'))
    }
    pushQuery({})
  }
  tgiDialog.value = false
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
