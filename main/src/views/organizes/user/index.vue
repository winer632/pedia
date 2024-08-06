<template>
  <div class="main">
    <div class="main-top">
      <div class="main-top-nav">
        {{ t('page.organizes.user.topNav') }}
      </div>
      <div class="main-top-batch">
        <el-button type="primary" @click="handleAdd">
          <template #icon>+</template>
          {{ t('page.organizes.user.add') }}
        </el-button>
        <el-button v-loading="batchingDel" :disabled="disabledBatchDel" @click="handleBatchDel">
          <template #icon>
            <icon-svg type="pk-batchdelete"></icon-svg>
          </template>
          {{ t('page.organizes.user.del') }}
        </el-button>
      </div>
    </div>

    <screen-table row-key="userId" :data="tableData.list" :loading="tableData.loading"
      :pagination="tableData.pagination" @handleSelection="handleSelection">
      <template #header>
        <el-row>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.user.th-s-login-name') }}</span>
            <el-input class="th-s-input" v-model="searchInput.loginName"
              :placeholder="t('page.organizes.user.th-s-login-name-holder')"></el-input>
          </el-col>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.user.th-s-phone-number') }}</span>
            <el-input class="th-s-input" v-model="searchInput.phone"
              :placeholder="t('page.organizes.user.th-s-phone-number-holder')"></el-input>
          </el-col>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.user.th-s-role') }}</span>
            <el-select class="th-s-input" v-model="searchInput.roleId">
              <el-option v-for="item in roleList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-col>
          <el-col :span="5">
            <span class="th-s-label">{{ t('page.organizes.user.th-s-status') }}</span>
            <el-select class="th-s-input" v-model="searchInput.status">
              <el-option v-for="item in STATES" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-col>
          <el-col :span="4" class="text-align-right">
            <div class="th-s">
              <el-button class="th-s-button" @click="reset">
                <template #icon>
                  <icon-svg type="pk-refresh"></icon-svg>
                </template>
                {{ t('page.organizes.user.reset') }}
              </el-button>
              <el-button type="primary" class="th-s-button" @click="search">
                <template #icon>
                  <icon-svg type="pk-search"></icon-svg>
                </template>
                {{ t('page.organizes.user.search') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table-column type="selection" width="46" :selectable="handleDisable"></el-table-column>

      <el-table-column fixed :label="t('page.organizes.user.tb-label-id')" prop="userId" width="80"></el-table-column>
      <el-table-column :label="t('page.organizes.user.tb-label-username')" prop="loginName"
        width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.user.tb-label-nickname')" prop="realName"
        width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.user.tb-label-tel')" prop="phone" width="200"></el-table-column>
      <el-table-column :label="t('page.organizes.user.tb-label-roleName')" prop="roleName"
        width="100"></el-table-column>
      <el-table-column :label="t('page.organizes.user.tb-label-state')" prop="status" width="100">
        <template #default="{ row }">
          <el-tag :type="STATE_TYPE[row.status]">{{ stateLocale(row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('page.organizes.user.tb-label-createTime')" prop="createTime"
        width="200"></el-table-column>
      <el-table-column fixed="right" :label="t('page.organizes.user.tb-label-operate')" min-width="100">
        <template #default="{ row, $index }">
          <div class="operations">
            <el-button type="primary" text @click="handleEdit(row, $index, $event)">
              {{ t('page.organizes.user.edit') }}
            </el-button>
            <el-button type="info" text @click="handleDelete(row, $index, $event)">
              {{ t('page.organizes.user.delete') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </screen-table>
  </div>
  <el-dialog v-model="userDialog" :title="t('page.organizes.user.dialog-title')" :close-on-click="false"
    :close-on-press-escape="false">
    <el-form :model="userForm" :rules="userFormRules" ref="userFormRef" :label-width="100">
      <div class="dialog-form">
        <div class="dialog-form-title">
          {{ t('page.organizes.user.dialog-label-id') }}
        </div>
        <div class="dialog-form-item">
          <el-form-item :label="t('page.organizes.user.dialog-label-username')" prop="loginName">
            <el-input :disabled="userForm.userId > 0" v-model="userForm.loginName"
              :placeholder="t('page.organizes.user.dialog-placeholder-prefix', { holder: t('page.organizes.user.dialog-label-username') })"></el-input>
          </el-form-item>
          <el-form-item v-if="userForm.userId > 0" :label="t('page.organizes.user.dialog-label-reset')"
            label-width="120" prop="reset">
            <el-radio-group v-model="userForm.reset">
              <el-radio v-for="item in resetList" :key="item.value" :label="item.label" :value="item.value"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="userForm.reset" :label="t('page.organizes.user.dialog-label-password')" prop="password">
            <el-input :disabled="userForm.userId === 0" type="password" v-model="userForm.password"
              :placeholder="t('page.organizes.user.dialog-placeholder-prefix', { holder: t('page.organizes.user.dialog-label-password') })"></el-input>
          </el-form-item>
          <el-form-item :label="t('page.organizes.user.dialog-label-nickname')" prop="realName">
            <el-input v-model="userForm.realName"
              :placeholder="t('page.organizes.user.dialog-placeholder-prefix', { holder: t('page.organizes.user.dialog-label-nickname') })"></el-input>
          </el-form-item>
          <el-form-item :label="t('page.organizes.user.dialog-label-tel')" prop="phone">
            <el-input :max="11" maxlength="11" v-model="userForm.phone"
              :placeholder="t('page.organizes.user.dialog-placeholder-prefix', { holder: t('page.organizes.user.dialog-label-tel') })"></el-input>
          </el-form-item>
          <el-form-item :label="t('page.organizes.user.dialog-label-email')" prop="email">
            <el-input :max="255" maxlength="255" v-model="userForm.email"
              :placeholder="t('page.organizes.user.dialog-placeholder-prefix', { holder: t('page.organizes.user.dialog-label-email') })"></el-input>
          </el-form-item>
        </div>
        <div class="dialog-form-title">
          {{ t('page.organizes.user.dialog-label-roleTitle') }}
        </div>
        <div class="dialog-form-item">
          <el-form-item :label="t('page.organizes.user.dialog-label-roleName')" prop="roleId">
            <template v-if="userForm.roleName">{{ userForm.roleName }}</template>
            <el-select v-else :disabled="userForm.userId" v-model="userForm.roleId" placeholder="Please Select">
              <el-option v-for="item in filterRole" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="t('page.organizes.user.dialog-label-state')" prop="status">
            <el-radio-group v-model="userForm.status">
              <el-radio v-for="item in STATE_OPTIONS" :key="item.value" :label="item.label"
                :value="item.value"></el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <div class="dialog-form-title">
          {{ t('page.organizes.user.dialog-label-otherTitle') }}
        </div>
        <div class="dialog-form-item">
          <el-form-item :label="t('page.organizes.user.dialog-label-remarks')" prop="remarks">
            <el-input v-model="userForm.remark"
              :placeholder="t('page.organizes.user.dialog-placeholder-prefix', { holder: t('page.organizes.user.dialog-label-remarks') })"></el-input>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="userDialog = false">{{ t('page.organizes.user.cancel') }}</el-button>
        <el-button v-loading="loading" type="primary" @click="handleSubmit">{{ t('page.organizes.user.submit')
          }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IconSvg from "@/components/IconSvg"
import ScreenTable from '@/components/ScreenTable/index.vue'
import ALink from '@/components/ALink/index.vue'
import useQueryList from '@/composables/useQueryList'
import useRole from '@/composables/useRole'
import { replaceDate } from '@/utils/date'
import { ResponseData } from '@/utils/request'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import { queryList, query, add, edit, remove, status } from './service'
import { queryAll } from '@/views/organizes/role/service'
import { StateType as GlobalStateType } from '@/store/global'
import { StateType as UserStateType } from "@/store/user"

import { useI18n } from "vue-i18n"
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const { t } = useI18n()
const router = useRouter()
const store = useStore<{ global: GlobalStateType, user: UserStateType }>()

const currentUser = computed(() => store.state.user.currentUser)
const superAdmin = computed(() => store.state.user.currentUser.roleId === 1)

const { STATES, STATE_OPTIONS } = useRole()

const roleName = []
const tableData = reactive<TableDataType>({
  loading: false,
  list: [],
  pagination: {
    total: 0,
    current: 1,
    pageSize: 10,

    sizeChange: () => { },
    onChange: () => { }
  }
})
const { pushQuery, queryParams } = useQueryList<TableListQueryParams>('/organize/system/user', async (queryParams, pushQuery): Promise<any> => {
  tableData.loading = true
  const response: ResponseData = await queryList(queryParams)

  const { rows } = response
  const list: TableListItem[] = rows || []
  tableData.list = list.filter(item => {
    if (superAdmin.value) return true
    if (item.roleId === 1) return false
    return true
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

const loading = ref(false)
const userDialog = ref(false)

const userForm = ref<TableListItem>({
  loginName: '',
  password: '123456',
  realName: '',
  phone: '',
  roleId: '',
  state: '',
  status: '',
  remark: '',
  reset: true,
})

const userFormRules = reactive({
  loginName: [{ required: true, trigger: 'blur' }],
  roleId: [{ required: true, trigger: 'blur' }],
})

const roleList = ref([])
const filterRole = computed(() => roleList.value.filter(item => {
  if (item.value !== '') {
    if (!superAdmin.value && item.value === 1) {
      return false
    }
    return true
  }
  return false
}))

const STATE_TYPE = {
  '0': 'success',
  '1': 'danger',
  '-1': 'info',
  '2': 'info',
}

const multipleIds = ref([])
const disabledBatchDel = computed(() => multipleIds.value.length === 0)
const batchingDel = ref(false)
const userFormRef = ref(null)
const resetList = reactive([{
  label: 'Yes', value: true,
}, {
  label: 'No', value: false,
}])
const searchInput = reactive({
  loginName: '',
  phone: '',
  roleId: '',
  status: '',
  createTime: '',
})

const search = (op) => {
  const data = { ...searchInput }
  pushQuery({
    ...data,
    page: tableData.pagination.current,
    perPage: tableData.pagination.pageSize,
    ...op,
    refresh: replaceDate(new Date()),
  })
}
const reset = () => {
  searchInput.loginName = ''
  searchInput.phone = ''
  searchInput.roleId = ''
  searchInput.status = ''
  searchInput.createTime = ''
  search({ page: 1 })
}

const handleSelection = (selection) => {
  multipleIds.value = selection
}

const handleDisable = (row, $index, $event) => {
  if (row.status === '0') {
    return true
  }
  return true
}

const handleBatchDel = async () => {
  if (multipleIds.value.length === 0) {
    ElMessage.error(t('page.organizes.docus.selectHint'))
    return
  }
  const ids = multipleIds.value.map((item) => item.userId).join(',')
  ElMessageBox.confirm(t('page.organizes.user.deleteHintDetail'), t('page.organizes.docus.hint'), {
    confirmButtonText: t('page.organizes.docus.buttonSubmit'),
    cancelButtonText: t('page.organizes.docus.buttonCancel'),
    type: 'warning'
  }).then(async () => {
    batchingDel.value = true
    await remove(ids)
    ElMessage.success(t('page.organizes.docus.deleteSuccess'))
    batchingDel.value = false
    pushQuery({ refresh: replaceDate(new Date()) })
  }).catch(() => {
    batchingDel.value = false
  })
}

const handleEdit = (row, $index, $event) => {
  userDialog.value = true
  userForm.value = { ...row, status: Number(row.status), reset: false }
}

const handleAdd = async () => {
  userDialog.value = true
  userForm.value = {
    userId: 0,
    loginName: '',
    password: '123456',
    realName: '',
    phone: '',
    email: '',
    roleId: '',
    roleName: '',
    status: 0,
    remark: '',
    reset: true,
  }
}

const handleDelete = async (row, index, $event) => {
  await handleDel(row, index, $event)
}

const handleSubmit = async () => {
  loading.value = true
  if (userFormRef.value) {
    userFormRef.value.validate().then(async () => {
      if (userForm.value.userId) {
        await edit(userForm.value)
        pushQuery({ refresh: replaceDate(new Date()) })
        ElMessage.success(t('page.organizes.knows.modifySuccess'))
      } else {
        await add(userForm.value)
        pushQuery({ refresh: replaceDate(new Date()) })
        ElMessage.success(t('page.organizes.knows.createSuccess'))
      }
    }).catch(() => { })
  }
  userDialog.value = false
  loading.value = false
}

const handleDel = async (row: TableListItem, index: number, $event) => {
  tableData.list[index]['delLoading'] = true
  try {
    ElMessageBox.confirm(t('page.organizes.knows.deleteConfirm'), t('page.organizes.docus.hint'), {
      confirmButtonText: t('page.organizes.docus.buttonSubmit'),
      cancelButtonText: t('page.organizes.docus.buttonCancel'),
      type: 'warning'
    }).then(async () => {
      await remove(row.userId + '')
      ElMessage.success(t('page.organizes.knows.deleteSuccess'))
      if (tableData.list.length > 1) {
        tableData.list.splice(index, 1)
      } else {
        pushQuery({ refresh: replaceDate(new Date()) })
      }
    }).catch(() => {
    })
  } catch (error: any) {
    ElMessage.warning(error.msg || error || 'error')
  }
  tableData.list[index]['delLoading'] = false
}

const initData = async () => {
  const role = await queryAll()
  if (role && role.data) {
    roleList.value = role.data.map((item) => {
      roleName[item.roleId] = item.roleName
      return {
        label: item.roleName,
        value: item.roleId,
      }
    })
    tableData.list = tableData.list.filter(item => {
      if (superAdmin.value) return true
      if (item.roleId === 1) return false
      return true
    })
  }
  roleList.value.unshift({
    label: 'ALL',
    value: ''
  })
}

const stateLocale = (row) => {
  const state = STATES.find(it => it.value === ~~row.status)
  if (state) return state.label
  console.log(STATES)
  return STATES[1]?.label
}

onMounted(async () => {
  store.commit('global/setLefter', true)
  window.document.documentElement.style.setProperty('--el-popper-width', 'fit-content')
  await initData()
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
}

.hint {
  color: #f11;
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

  ::v-deep(.el-input__inner) {
    border-radius: 0.25rem;
    background: var(--bg-color);
  }
}

.main {
  .th-s-label {
    text-align: right;
  }

  .th-s-input {}
}
</style>
