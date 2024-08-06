<template>
  <div class="main">
    <div class="main-info">
      <div class="main-info-title">
      </div>

      <el-tabs v-model="name" class="main-info-tabs" type="border-card">
        <el-tab-pane :label="t('page.organizes.profile.infoNav')" name="info">
          <div class="main-info-avatar">
            <div class="avatar">
              <img :src="avatarUrl" alt="avatar" width="74" height="74" />
            </div>
            <el-upload :show-file-list="false" :accept="'.png,.jpg,.jpeg'" :before-upload="beforeUpload"
              :http-request="uploadAvatar" :limit="1">
              <el-button type="primary" text>{{ t('page.organizes.profile.avatar') }}</el-button>
            </el-upload>
          </div>
          <el-form ref="infoFormRef" class="main-info-login" :model="infoForm" :rules="infoRules" label-width="100">
            <div class="form">
              <el-form-item :label="t('page.organizes.profile.form-login-name')" prop="loginName">
                {{ profile.name }}
              </el-form-item>
              <el-form-item :label="t('page.organizes.profile.form-roleName')" prop="roleName">
                {{ profile.roleName }}
              </el-form-item>
              <el-form-item :label="t('page.organizes.profile.form-real-name')" prop="realName">
                <el-input :max="100" maxlength="100" v-model="infoForm.realName"
                  :placeholder="t('page.organizes.profile.form-real-name-holder')" />
              </el-form-item>
              <el-form-item :label="t('page.organizes.profile.form-phone')" prop="phone">
                <el-input :max="11" maxlength="11" v-model="infoForm.phone"
                  :placeholder="t('page.organizes.profile.form-phone-holder')" />
              </el-form-item>
              <el-form-item :label="t('page.organizes.profile.form-email')" prop="email">
                <el-input :max="255" maxlength="255" v-model="infoForm.email"
                  :placeholder="t('page.organizes.profile.form-email-holder')" />
              </el-form-item>
              <el-form-item :label="t('page.organizes.profile.form-create-time')" prop="createTime">
                {{ infoForm.createTime }}
              </el-form-item>

              <el-form-item>
                <div class="text-align">
                  <el-button type="info" @click="back">{{ t('page.organizes.profile.cancel') }}</el-button>
                  <el-button v-loading="loading" type="primary" @click="submitInfo">{{ t('page.organizes.profile.save')
                    }}</el-button>
                </div>
              </el-form-item>
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="t('page.organizes.profile.modifyNav')" name="pwd">
          <div class="main-info-content">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
              <div class="form">
                <el-form-item :label="t('page.organizes.profile.oldPassword')" prop="oldPassword">
                  <el-input :min="6" type="password" v-model="form.oldPassword"
                    :placeholder="t('page.organizes.profile.oldPassword-holder')" />
                </el-form-item>
                <el-form-item :label="t('page.organizes.profile.password')" prop="password">
                  <el-input :min="6" type="password" v-model="form.password"
                    :placeholder="t('page.organizes.profile.password-holder')" />
                </el-form-item>
                <el-form-item :label="t('page.organizes.profile.repassword')" prop="repassword">
                  <el-input :min="6" type="password" v-model="form.repassword"
                    :placeholder="t('page.organizes.profile.repassword-holder')" />
                </el-form-item>
                <el-form-item>
                  <div class="text-align">
                    <el-button type="info" @click="back">{{ t('page.organizes.profile.cancel') }}</el-button>
                    <el-button v-loading="loading" type="primary" @click="submit">{{
        t('page.organizes.profile.save')
                      }}</el-button>
                  </div>
                </el-form-item>
              </div>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IconSvg from '@/components/IconSvg'
import ScreenTable from '@/components/ScreenTable/index.vue'
import useQueryList from '@/composables/useQueryList'
import { ResponseData } from '@/utils/request'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import { resetPwd } from './service'
import { avatar, update } from './service'
import { StateType as GlobalStateType } from '@/store/global'
import { StateType as UserStateType, CurrentUser } from "@/store/user"

import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useRouter } from "vue-router"

const API = process.env.VUE_APP_HTTP_PREFIX

const { t } = useI18n()
const store = useStore<{ global: GlobalStateType, user: UserStateType }>()
const route = useRoute()
const router = useRouter()

const profile = computed<CurrentUser>(() => store.state.user.currentUser)

const name = ref('info')
const avatarUrl = ref('')
const defaultAvatar = '/images/default-avatar.png'
const infoForm = reactive({
  loginName: profile.value.name,
  realName: profile.value.realName,
  phone: profile.value.phone,
  email: profile.value.email,
  createTime: profile.value.createTime,
})
const infoFormRef = ref(null)
const infoRules = reactive({
  realName: [
    { required: true, trigger: 'blur' },
    { max: 100, trigger: 'blur' }
  ],
})

const form = reactive({
  oldPassword: '',
  password: '',
  repassword: ''
})
const formRef = ref(null)
const rules = reactive({
  oldPassword: [
    { required: true, trigger: 'blur' },
    { min: 6, trigger: 'blur' }
  ],
  password: [
    { required: true, trigger: 'blur' },
    { min: 6, trigger: 'blur' }
  ],
  repassword: [
    { required: true, trigger: 'blur' },
    { min: 6, trigger: 'blur' }
  ]
})
const loading = ref(false)

const beforeUpload = (file: File) => {
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isLt2M) {
    ElMessage.error('exceed 2MB');
    return false;
  }
  return true;
}
const uploadAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append('avatarfile', file.file)
  const res = await avatar(formData)
  if (res.code === 200) {
    avatarUrl.value = `${API}${res.imgUrl}`
    form.avatar = res.imgUrl
  } else {
    ElMessage.error(res.msg)
  }
}
const back = () => {
  router.push({
    path: '/home'
  })
}

const submitInfo = async () => {
  try {
    const valid = await infoFormRef.value.validate()
    if (!valid) {
      return
    }
  } catch (error) {
    return
  }
  loading.value = true
  const data = { ...infoForm }
  data.userId = profile.value.id
  if (profile.value.phone === infoForm.phone) {
    delete data.phone
  }
  if (profile.value.email === infoForm.email) {
    delete data.email
  }
  try {
    const res = await update(data)
    if (res.code === 200) {
      ElMessage.success(t('page.organizes.profile.update-success'))
      await store.dispatch('user/fetchCurrent')
    } else {
      ElMessage.error(t('page.organizes.profile.update-error'))
    }
  } catch (error) {
    ElMessage.error(t('page.organizes.profile.update-error'))
  }
  loading.value = false
}

const submit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) {
      return
    }
  } catch (error) {
    return
  }
  if (form.password !== form.repassword) {
    ElMessage.error(t('page.organizes.profile.repasswordError'))
    return
  }
  loading.value = true
  try {
    const res: ResponseData<any> = await resetPwd(form)
    if (res.code === 200) {
      ElMessage.success(t('page.organizes.profile.update-success'))
      await store.dispatch('user/logout')
      router.push({
        path: '/login'
      })
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error(t('page.organizes.profile.update-error'))
  } finally {
    loading.value = false
  }
}

const currentRoute = computed(() => router.currentRoute.value)
if (currentRoute.value.path.includes('profile')) {
  name.value = 'info'
} else {
  name.value = 'pwd'
}

watchEffect(() => {
  if (router.currentRoute.value.path.includes('profile')) {
    name.value = 'info'
  } else {
    name.value = 'pwd'
  }
})

onMounted(() => {
  infoForm.loginName = profile.value.name
  infoForm.realName = profile.value.realName
  infoForm.phone = profile.value.phone
  infoForm.email = profile.value.email
  infoForm.createTime = profile.value.createTime
  avatarUrl.value = profile.value.avatar ? `${API}${profile.value.avatar}` : defaultAvatar
})
</script>
<style lang="scss">
@import "@/assets/css/chat/organize/scroll.scss";
@import "@/assets/css/chat/media.scss";
</style>
<style scoped lang="scss">
@import "@/assets/css/chat/organize/global.scss";
@import "@/assets/css/chat/media.scss";

.main {

  &-info {
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    height: 100%;
    border-radius: 1rem;
    background-color: #fff;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    .text-align {
      display: flex;
      flex: 1;
      justify-content: flex-end;
    }

    &-avatar {
      display: flex;
      flex-flow: column nowrap;
      justify-content: center;
      align-items: center;

      .avatar {
        img {
          border-radius: 50%;
        }
      }

      ::v-deep(.el-button) {
        margin-top: 0.6875rem;
        border: 1px solid var(--theme-color-huge);
      }
    }

    &-login {
      margin-top: 2.5rem;
    }

    &-tabs {
      width: 50%;
    }

    &-title {
      font-weight: 500;
    }

  }

  .th-s-label {}

}
</style>
