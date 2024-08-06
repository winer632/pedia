<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.vector.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" @click="handleAdd">
          <template #icon>+</template>
          {{ t('page.organizes.vector.add') }}
        </el-button>
        <el-button v-loading="batchingDel" :disabled="disabledBatchDel" type="danger" @click="handleBatchDel">
          <template #icon>
            <icon-svg type="pk-delete"></icon-svg>
          </template>
          {{ t('page.organizes.vector.delete') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="roleId" :data="tableData.list" :pagination="tableData.pagination"
      :loading="tableData.loading" @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.vector.th-s-name') }}</span>
            <el-input v-model="searchInput.name" class="th-s-input"
              :placeholder="t('page.organizes.vector.th-s-name-holder')" />
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.vector.th-s-desc') }}</span>
            <el-input v-model="searchInput.desc" class="th-s-input"
              :placeholder="t('page.organizes.vector.th-s-desc-holder')" />
          </el-col>
          <el-col :span="16">
            <div class="th-s">
              <el-button type="primary" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.vector.search') }}</el-button>
              <el-button @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.vector.reset') }}</el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisableSelection"></el-table-column>
      <el-table-column prop="name" :label="t('page.organizes.vector.th-s-name')" width="100"></el-table-column>
      <el-table-column prop="desc" :label="t('page.organizes.vector.th-s-desc')" width="100"></el-table-column>
      <el-table-column prop="createTime" :label="t('page.organizes.vector.th-s-createTime')"
        width="100"></el-table-column>
      <el-table-column prop="updateTime" :label="t('page.organizes.vector.th-s-updateTime')"
        width="100"></el-table-column>
      <el-table-column prop="creator" :label="t('page.organizes.vector.th-s-creator')" width="100"></el-table-column>
      <el-table-column prop="updater" :label="t('page.organizes.vector.th-s-updater')" width="100"></el-table-column>
      <el-table-column prop="status" :label="t('page.organizes.vector.th-s-status')" width="100"></el-table-column>
      <el-table-column :label="t('page.organizes.vector.th-s-operate')" width="100">
        <template #default="{ row }">
          <div class="operations">
            <el-button size="mini" type="text" @click="handleEdit(row)">
              <template #icon>
                <icon-svg type="pk-edit"></icon-svg>
              </template>
              {{ t('page.organizes.vector.edit') }}</el-button>
            <el-button size="mini" type="text" @click="handleDel(row)">
              <template #icon>
                <icon-svg type="pk-delete"></icon-svg>
              </template>
              {{ t('page.organizes.vector.delete') }}</el-button>
          </div>
        </template>
      </el-table-column>
    </screen-table>
    <el-dialog v-model="vectorDialog" :title="t('page.organizes.vector.dialog-title')" :close-on-modal="false"
      :close-on-click-modal="false">
      <el-form :model="vectorForm" :rules="vectorRules" label-width="100px">
        <el-form-item :label="t('page.organizes.vector.dialog-name')" prop="name">
          <el-input v-model="vectorForm.name"></el-input>
        </el-form-item>
        <el-form-item :label="t('page.organizes.vector.dialog-description')" prop="desc">
          <el-input v-model="vectorForm.desc"></el-input>
        </el-form-item>
      </el-form>
      <template #default>
        <div class="dialog-footer">
          <el-button @click="vectorDialog = false">{{ t('page.organizes.vector.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ t('page.organizes.vector.submit') }}</el-button>
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
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/vector', async (queryParams, pushQuery): Promise<void> => {
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

const vectorDialog = ref(false)
const vectorFormRef = ref(null)
const vectorForm = reactive({
  name: '',
  desc: ''
})
const vectorRules = reactive({
  name: [
    { required: true, message: t('page.organizes.vector.name-required'), trigger: 'blur' }
  ],
  desc: [
    { required: true, message: t('page.organizes.vector.desc-required'), trigger: 'blur' }
  ]
})
const loading = ref(false)

const searchInput = reactive({
  name: '',
  desc: ''
})

const handleSelection = (selection: TableListItem[]) => {
  multipleIds.value = selection
}
const handleDisableSelection = (selection: TableListItem[]) => {
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
  searchInput.desc = ''
  search()
}

const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) {
    ElMessage({
      message: t('page.organizes.vector.batch-del-empty'),
      type: 'warning'
    })
    return
  }
  const ids = multipleIds.value.map(item => item.vectorId)
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
  vectorForm.name = row.name
  vectorForm.desc = row.desc
  vectorDialog.value = true
}
const handleAdd = () => {
  vectorForm.name = ''
  vectorForm.desc = ''
  vectorDialog.value = true
}
const handleSubmit = async () => {
  loading.value = true
  if (vectorFormRef.value) {
    const valid = vectorFormRef.value.validate()
    if (!valid) {
      loading.value = false
      return
    }
    if (vectorForm.vectorId) {
      await edit(vectorForm)
      ElMessage.success(t('page.organizes.docus.editSuccess'))
    } else {
      await add(vectorForm)
      ElMessage.success(t('page.organizes.docus.addSuccess'))
    }
    pushQuery({})
  }
  vectorDialog.value = false
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
