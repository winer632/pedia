<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.rag.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" @click="handleAdd">
          <template #icon>+</template>
          {{ t('page.organizes.rag.add') }}
        </el-button>
        <el-button v-loading="batchingDel" :disabled="disabledBatchDel" type="danger" @click="handleDelete">
          <template #icon>
            <icon-svg type="pk-batchdelete"></icon-svg>
          </template>
          {{ t('page.organizes.rag.delete') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="roleId" :data="tableData.list" :pagination="tableData.pagination"
      :loading="tableData.loading" @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.rag.th-s-name') }}</span>
            <el-input v-model="searchInput.name" class="th-s-input"
              :placeholder="t('page.organizes.rag.th-s-name-holder')"></el-input>
            />
          </el-col>
          <el-col :span="4">
            <span class="th-s-label">{{ t('page.organizes.rag.th-s-code') }}</span>
            <el-input v-model="searchInput.code" class="th-s-input"
              :placeholder="t('page.organizes.rag.th-s-code-holder')"></el-input>
          </el-col>
          <el-col :span="4">
            <div class="th-s">
              <el-button type="primary" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.rag.search') }}
              </el-button>
              <el-button type="primary" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.rag.reset') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisableSelection"></el-table-column>
      <el-table-column prop="name" :label="t('page.organizes.rag.th-s-name')"></el-table-column>
      <el-table-column prop="code" :label="t('page.organizes.rag.th-s-code')"></el-table-column>
      <el-table-column prop="description" :label="t('page.organizes.rag.th-s-description')"></el-table-column>
      <el-table-column prop="createTime" :label="t('page.organizes.rag.th-s-createTime')"></el-table-column>
      <el-table-column prop="updateTime" :label="t('page.organizes.rag.th-s-updateTime')"></el-table-column>
      <el-table-column prop="creator" :label="t('page.organizes.rag.th-s-creator')"></el-table-column>
      <el-table-column prop="updater" :label="t('page.organizes.rag.th-s-updater')"></el-table-column>
      <el-table-column prop="status" :label="t('page.organizes.rag.th-s-status')">
        <template #default="{ row }">
          {{ STATES[row.status] }}
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.rag.th-s-action')" width="120">
        <div class="operations">
          <el-button type="primary" @click="handleEdit(row)">
            <template #icon>
              <icon-svg type="pk-edit"></icon-svg>
            </template>
            {{ t('page.organizes.rag.edit') }}
          </el-button>
          <el-button type="danger" @click="handleDelete(row)">
            <template #icon>
              <icon-svg type="pk-delete"></icon-svg>
            </template>
            {{ t('page.organizes.rag.delete') }}
          </el-button>
          <el-button type="primary" @click="handleDetail(row)">
            <template #icon>
              <icon-svg type="pk-detail"></icon-svg>
            </template>
            {{ t('page.organizes.rag.detail') }}
          </el-button>
        </div>
      </el-table-column>
    </screen-table>
    <el-dialog v-model="ragDialog" :title="t('page.organizes.rag.dialog-title')" :close-on-modal="false"
      :close-on-click-modal="false">
      <el-form ref="ragFormRef" :model="ragForm" :rules="ragFormRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="ragForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="ragForm.code"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="ragForm.description"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleRagSubmit">{{ t('page.organizes.rag.submit') }}</el-button>
          <el-button @click="handleRagCancel">{{ t('page.organizes.rag.cancel') }}</el-button>
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
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/rag', async (queryParams, pushQuery): Promise<void> => {
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
  name: '',
  code: '',
})

const ragForm = reactive<TableListItem>({
  name: '',
  code: '',
  description: '',
})
const ragDialog = ref(false)

const ragFormRules = reactive({
  name: [
    { required: true, message: t('page.organizes.rag.name-required'), trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('page.organizes.rag.code-required'), trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('page.organizes.rag.description-required'), trigger: 'blur' }
  ]
})
const ragFormRef = ref(null)
const loading = ref(false)

const STATES = {
}

const handleSelection = (selection: TableListItem[]) => {
  multipleIds.value = selection
}
const handleDisableSelection = (selection: TableListItem) => {
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
  searchInput.code = ''
  search({ page: 1 })
}
const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) {
    ElMessage({
      message: t('page.organizes.rag.batch-del-empty'),
      type: 'warning'
    })
    return
  }
  const ids = multipleIds.value.map((item) => item.id)
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
  ragForm.name = row.name
  ragForm.code = row.code
  ragForm.description = row.description
  ragDialog.value = true
}
const handleAdd = async () => {
  ragForm.name = ''
  ragForm.code = ''
  ragForm.description = ''
  ragDialog.value = true
}
const handleSubmit = async () => {
  loading.value = true
  if (ragFormRef.value) {
    const valid = ragFormRef.value.validate()
    if (!valid) {
      loading.value = false
      return
    }
    if (ragForm.id) {
      await edit(ragForm)
      ElMessage.success(t('page.organizes.docus.editSuccess'))
    } else {
      await add(ragForm)
      ElMessage.success(t('page.organizes.docus.addSuccess'))
    }
    pushQuery({})
  }
  ragDialog.value = false
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
