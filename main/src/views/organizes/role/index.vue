<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.role.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" @click="handleAdd">
          <template #icon>+</template>
          {{ t('page.organizes.role.add') }}
        </el-button>
        <el-button v-loading="batchingDel" :disabled="disabledBatchDel" @click="handleBatchDel">
          <template #icon>
            <icon-svg type="pk-batchdelete"></icon-svg>
          </template>
          {{ t('page.organizes.role.del') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="roleId" :data="tableData.list" :loading="tableData.loading"
      :pagination="tableData.pagination" @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.role.th-s-role-name') }}</span>
            <el-input class="th-s-input" v-model="searchInput.roleName"
              :placeholder="t('page.organizes.role.th-s-role-name-holder')"></el-input>
          </el-col>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.role.th-s-role-key') }}</span>
            <el-input class="th-s-input" v-model="searchInput.roleKey"
              :placeholder="t('page.organizes.role.th-s-role-key-holder')"></el-input>
          </el-col>
          <el-col :span="14">
            <div class="th-s">
              <el-button class="th-s-button" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.role.reset') }}
              </el-button>
              <el-button class="th-s-button" type="primary" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.role.search') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisable"></el-table-column>

      <el-table-column fixed :label="t('page.organizes.role.th-b-role-id')" prop="roleId" width="100">
      </el-table-column>
      <el-table-column :label="t('page.organizes.role.th-b-role-name')" prop="roleName"></el-table-column>
      <el-table-column :label="t('page.organizes.role.th-b-role-key')" prop="roleKey"></el-table-column>
      <el-table-column :label="t('page.organizes.role.th-b-role-state')" prop="status">
        <template #default="{ row }">
          <el-tag :type="STATE_TYPE[row.status]">{{ stateLocale(row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.role.th-b-role-createTime')" prop="createTime"></el-table-column>
      <el-table-column fixed="right" :label="t('page.organizes.role.th-b-operate')">
        <template #default="{ row, $index }">
          <div v-if="operateRole(row)" class="operations">
            <el-button type="primary" text @click="handleEdit(row, $index, $event)">
              {{ t('page.organizes.role.edit') }}
            </el-button>
            <el-button type="info" text @click="handleDel(row, $index, $event)">
              {{ t('page.organizes.role.del') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </screen-table>
    <el-dialog v-model="roleDialog" :title="t('page.organizes.role.dialog-title')" :close-on-click="false">
      <el-form :model="roleForm" :rules="roleFormRules" ref="roleFormRef" label-width="100px">
        <div class="dialog">
          <el-form-item :label="t('page.organizes.role.dialog-role-name')" prop="roleName">
            <el-input v-model="roleForm.roleName"
              :placeholder="t('page.organizes.role.dialog-placeholder-prefix', { holder: t('page.organizes.role.dialog-role-name') })"></el-input>
          </el-form-item>
          <el-form-item :label="t('page.organizes.role.dialog-role-key')" prop="roleKey">
            <el-select v-model="roleForm.roleKey">
              <el-option v-for="item in ROLE_OPTIONS" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="t('page.organizes.role.dialog-role-state')" prop="status">
            <el-radio-group v-model="roleForm.status">
              <el-radio v-for="item in STATE_OPTIONS" :key="item.value" :label="item.label"
                :value="item.value"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="t('page.organizes.role.dialog-role-remark')">
            <el-input v-model="roleForm.remark"
              :placeholder="t('page.organizes.role.dialog-placeholder-prefix', { holder: t('page.organizes.role.dialog-role-remark') })"></el-input>
          </el-form-item>
          <el-form-item :label="t('page.organizes.role.dialog-role-menu')" prop="menuIds">
            <el-scrollbar height="200">
              <el-tree ref="treeDataRef" :data="treeData" show-checkbox node-key="menuId"
                :default-expanded-keys="roleForm.defaultExpandedKeys"
                :default-checked-keys="roleForm.defaultCheckedKeys" />
            </el-scrollbar>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialog = false">{{ t('page.organizes.role.cancel') }}</el-button>
          <el-button v-loading="loading" type="primary" @click="handleSubmit">{{ t('page.organizes.role.submit')
            }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IconSvg from '@/components/IconSvg'
import ALink from '@/components/ALink'
import ScreenTable from '@/components/ScreenTable/index.vue'
import { usePermission } from '@/hooks/usePermission'
import useQueryList from '@/composables/useQueryList'
import useRole from '@/composables/useRole'
import { replaceDate } from '@/utils/date'
import { ResponseData } from '@/utils/request'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import { queryList, queryRole, add, edit, remove, status } from './service'
import { queryTree } from '@/views/organizes/menu/service'
import { StateType as GlobalStateType } from '@/store/global'

import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const { t } = useI18n()
const store = useStore<{ global: GlobalStateType; }>()
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
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/role', async (queryParams, pushQuery): Promise<void> => {
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

const { ROLE_KEY, ROLE_OPTIONS, validRole, STATES, STATE_OPTIONS } = useRole()

const handleSelection = (selection) => {
  multipleIds.value = selection
}

const disabledBatchDel = computed(() => multipleIds.value.length === 0)
const batchingDel = ref(false)

const roleDialog = ref(false)
const roleForm = ref<TableListItem>({
  roleId: '',
  roleName: '',
  roleKey: '',
  status: '0',
  remark: ''
})
const roleFormRules = reactive({
  roleName: [{ required: true, trigger: 'blur' }],
  roleKey: [{ required: true, trigger: 'blur' }],
  status: [{ required: true, trigger: 'blur' }],
  menuIds: [{ required: true, trigger: 'blur' }]
})
const loading = ref(false)
const STATE_TYPE = {
  '0': 'success',
  '1': 'danger',
  '-1': 'info',
}
const roleFormRef = ref(null)
const treeDataRef = ref(null)
const treeData = ref<any>([])
const searchInput = reactive({
  roleName: '',
  status: ''
})

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
  searchInput.roleName = ''
  searchInput.roleKey = ''
  search({ page: 1 })
}

const handleDisable = (row) => {
  return true
}

const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) {
    return
  }
  const ids = multipleIds.value.map(item => item.roleId).join(',')
  ElMessageBox.confirm(t('page.organizes.role.deleteHintDetail'), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    batchingDel.value = true
    await remove(ids)
    ElMessage.success(t('page.organizes.docus.deleteSuccess'))
    batchingDel.value = false
  }).catch(() => {
    batchingDel.value = false
  })
}

const handleEdit = async (row, index, event) => {
  const menuIds = await queryRole(row.roleId)
  const defaultExpandedKeys = retriveParent(menuIds.data.menuIds)
  roleForm.value = row
  treeDataRef.value?.setCheckedKeys([])
  roleForm.value.defaultExpandedKeys = defaultExpandedKeys
  roleForm.value.defaultCheckedKeys = defaultExpandedKeys
  roleDialog.value = true
}

const handleAdd = async () => {
  roleDialog.value = true
  roleForm.value = {
    roleId: '',
    roleName: '',
    roleKey: '',
    status: '0',
    remark: ''
  }
}

const addParent = (tree) => {
  const reTree = [...tree]
  treeData.value.filter(it => it.children && it.children.length > 0).forEach(item => {
    item.children.forEach(it => {
      if (tree.includes(it.menuId)) {
        reTree.push(item.menuId)
      }
    })
  })
  return [...new Set(reTree)]
}

const retriveParent = (tree) => {
  const reTree = [...tree]
  treeData.value.filter(it => it.children && it.children.length > 0).forEach(item => {
    let length = 0
    tree.forEach(it => {
      if (item.children.includes(it)) {
        length++
      }
    })
    if (length !== item.children.length) {
      const index = reTree.findIndex(it => it === item.menuId)
      if (index !== -1) {
        reTree.splice(index, 1)
      }
    }
  })
  return [...new Set(reTree)]
}

const handleSubmit = async () => {
  loading.value = true
  if (roleFormRef.value) {
    let tree = treeDataRef.value.getCheckedKeys()
    if (tree.length === 0) {
      ElMessage.error(t('page.organizes.role.menuEmpty'))
      loading.value = false
      return
    }
    tree = addParent(tree)
    roleForm.value.menuIds = tree
    try {
      const valid = await roleFormRef.value.validate()
      if (!valid) {
        loading.value = false
        return
      }
    } catch (e) {
      loading.value = false
      return
    }
    if (roleForm.value.roleId === '') {
      await add(roleForm.value)
      ElMessage.success(t('page.organizes.role.addSuccess'))
    } else {
      await edit(roleForm.value)
      ElMessage.success(t('page.organizes.role.submitSuccess'))
    }
    pushQuery({ refresh: replaceDate(new Date()) })
  }
  roleDialog.value = false
  loading.value = false
}

const handleDel = async (row, index, event) => {
  ElMessageBox.confirm(t('page.organizes.role.deleteHintDetail'), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    await remove(row.roleId + '')
    ElMessage.success(t('page.organizes.role.deleteSuccess'))
    pushQuery({ refresh: replaceDate(new Date()) })
  }).catch(() => {
  })
}

const loadTree = async () => {
  const res = await queryTree()
  const labels = (data) => {
    return data.map(item => {
      return {
        menuId: item.menuId,
        label: item.menuName,
        children: labels(item.children)
      }
    })
  }
  treeData.value = labels(res.data)
}

const stateLocale = (row) => {
  const state = STATES.find(it => it.value === ~~row.status)
  if (state) {
    return state.label
  }
  return STATES[1]?.label
}

const operateRole = (row: TableListItem) => {
  if (row.roleKey === "superadmin") {
    return false
  }
  return false
}

onMounted(async () => {
  store.commit('global/setLefter', true)
  await loadTree()
})
onUnmounted(() => {
  store.commit('global/setLefter', false)
})

</script>
<style lang="scss">
@import "@/assets/css/chat/organize/scroll.scss";
@import "@/assets/css/chat/media.scss";
</style>
<style lang="scss" scoped>
@import "@/assets/css/chat/organize/global.scss";
@import "@/assets/css/chat/media.scss";

.main {
  width: auto;
  max-width: calc(100vw - 14.725rem);

  .th-s-label {
    text-align: right;
  }
}

::v-deep(.el-input__wrapper) {
  border-radius: 0.25rem;
  background: var(--bg-color);
}

::v-deep(.el-select__wrapper) {
  border-radius: 0.25rem;
  background: var(--bg-color);
}

.form-input {
  width: 60%;
  --bg-color: --theme-bg-colorSpan;

  ::v-deep(.el-input__wrapper) {
    border-radius: 0.25rem;
    background: var(--bg-color);
  }
}
</style>
