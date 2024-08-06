<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.settings.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" @click="handleAdd">
          <template #icon>+</template>
          {{ t('page.organizes.settings.add') }}
        </el-button>
        <el-button v-loading="batchingDel" :disabled="disabledBatchDel" @click="handleBatchDel">
          <template #icon>
            <icon-svg type="pk-batchdelete"></icon-svg>
          </template>
          {{ t('page.organizes.settings.delete') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="roleId" :data="tableData.list" :pagination="tableData.pagination"
      :loading="tableData.loading" @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.settings.th-s-name') }}</span>
            <el-input v-model="searchInput.configName" class="th-s-input"
              :placeholder="t('page.organizes.settings.th-s-name-holder')" />
          </el-col>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.settings.th-s-key') }}</span>
            <el-input v-model="searchInput.configKey" class="th-s-input"
              :placeholder="t('page.organizes.settings.th-s-key-holder')" />
          </el-col>
          <el-col :span="14">
            <div class="th-s">
              <el-button @click="refresh">
                <template #icon>
                  <icon-svg type="pk-batchbrush"></icon-svg>
                </template>
                {{ t('page.organizes.settings.refresh') }}
              </el-button>
              <el-button @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.settings.reset') }}
              </el-button>
              <el-button type="primary" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.settings.search') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisableSelection"></el-table-column>
      <el-table-column prop="configName" :label="t('page.organizes.settings.tb-name')" width="160"></el-table-column>
      <el-table-column prop="configKey" :label="t('page.organizes.settings.tb-key')" width="160"></el-table-column>
      <el-table-column prop="configValue" :label="t('page.organizes.settings.tb-value')" width="160"></el-table-column>
      <el-table-column prop="remark" :label="t('page.organizes.settings.tb-remark')" width="160"></el-table-column>
      <el-table-column prop="createTime" :label="t('page.organizes.settings.tb-create-time')"
        width="160"></el-table-column>
      <el-table-column fixed="right" :label="t('page.organizes.settings.operate')" width="160">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">
            {{ t('page.organizes.settings.edit') }}
          </el-button>
          <el-button v-if="false" v-loading="row.delLoading" type="text" @click="handleDelete(row)">
            {{ t('page.organizes.settings.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </screen-table>
    <el-dialog v-model="settingDialog" :title="t('page.organizes.settings.dialog-title')" width="800px">
      <el-form :model="settingForm" :rules="settingRules" ref="settingFormRef" label-width="100px">
        <el-form-item :label="t('page.organizes.settings.dialog-label-name')" prop="configName">
          <el-input v-model="settingForm.configName"></el-input>
        </el-form-item>
        <el-form-item :label="t('page.organizes.settings.dialog-label-key')" prop="configKey">
          <el-input v-model="settingForm.configKey"></el-input>
        </el-form-item>
        <el-form-item :label="t('page.organizes.settings.dialog-label-value')" prop="configValue">
          <el-input v-model="settingForm.configValue"></el-input>
        </el-form-item>
        <el-form-item :label="t('page.organizes.settings.dialog-label-remark')" prop="remark">
          <el-input v-model="settingForm.remark" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="settingDialog = false">{{ t('page.organizes.settings.cancel') }}</el-button>
          <el-button v-loading="loading" type="primary" @click="handleSubmit">{{ t('page.organizes.settings.submit')
            }}</el-button>
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
import { replaceDate } from '@/utils/date'
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
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/settings', async (queryParams) => {
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
  configKey: '',
  configName: '',
})

const settingForm = reactive<TableListItem>({
  configName: '',
  configKey: '',
  configValue: '',
})
const settingRules = reactive<Record<string, any>>({
  configName: [
    { required: true, trigger: 'blur' }
  ],
  configKey: [
    { required: true, trigger: 'blur' }
  ],
  configValue: [
    { required: true, trigger: 'blur' }
  ],
})
const settingDialog = ref(false)
const settingFormRef = ref(null)
const loading = ref(false)

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
  searchInput.configName = ''
  searchInput.configKey = ''
  pushQuery({ refresh: replaceDate(new Date()) })
}
const refresh = async () => {
  await status({})
  ElMessage.success(t('page.organizes.settings.refreshSuccess'))
  pushQuery({})
}
const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) {
    ElMessage({
      message: t('page.organizes.settings.batch-del-empty'),
      type: 'warning'
    })
    return
  }
  const configIds = multipleIds.value.map(item => item.configId).join(',')
  ElMessageBox.confirm(t('page.organizes.role.deleteHintDetail'), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    batchingDel.value = true
    await remove(configIds)
    ElMessage.success(t('page.organizes.docus.deleteSuccess'))
    batchingDel.value = false
  }).catch(() => {
    batchingDel.value = false
  })
}
const handleEdit = async (row: TableListItem) => {
  settingForm.configId = row.configId
  settingForm.configName = row.configName
  settingForm.configKey = row.configKey
  settingForm.configValue = row.configValue
  settingForm.remark = row.remark
  settingDialog.value = true
}
const handleAdd = () => {
  settingForm.configId = ''
  settingForm.configName = ''
  settingForm.configKey = ''
  settingForm.configValue = ''
  settingForm.remark = ''
  settingDialog.value = true
}
const handleSubmit = async () => {
  loading.value = true
  if (settingFormRef.value) {
    try {
      const valid = await settingFormRef.value.validate()
      console.log(valid)
      if (!valid) {
        loading.value = false
        return
      }
      if (settingForm.configId) {
        await edit(settingForm)
        ElMessage.success(t('page.organizes.settings.editSuccess'))
      } else {
        await add(settingForm)
        ElMessage.success(t('page.organizes.settings.addSuccess'))
      }
      reset()
    } catch (e) {
      console.error(e)
    }
  }
  loading.value = false
  settingDialog.value = false
}
const handleDelete = async (row: TableListItem) => {
  row['delLoading'] = true
  ElMessageBox.confirm(t('page.organizes.settings.deleteHintDetail'), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    await remove(row.configId + '')
    ElMessage.success(t('page.organizes.settings.deleteSuccess'))
  }).catch(() => {
  })
  row['delLoading'] = false
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
