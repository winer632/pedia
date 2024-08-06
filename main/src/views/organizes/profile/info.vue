<template>
  <div class="main">
    <div class="main-info">
      <div class="main-info-avatar">
        <div class="avatar">
          <img :src="avatarUrl" alt="avatar" width="52" height="52" />
        </div>
        <el-upload :show-file-list="false" :accept="'.png,.jpg,.jpeg'" :before-upload="beforeUpload"
          :http-request="uploadAvatar" :limit="1">
          <el-button type="primary" text>{{ t('page.organizes.profile.avatar') }}</el-button>
        </el-upload>
      </div>
      <div class="main-info-content">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100">
          <div class="form">
            <el-form-item :label="t('page.organizes.profile.form-login-name')" prop="loginName">
              {{ profile.name }}
            </el-form-item>
            <el-form-item :label="t('page.organizes.profile.form-real-name')" prop="realName">
              <el-input maxlength="100" v-model="form.realName" :placeholder="t('page.organizes.profile.form-real-name-holder')" />
            </el-form-item>
            <el-form-item :label="t('page.organizes.profile.form-phone')" prop="phone">
              <el-input maxlength="100" v-model="form.phone" :placeholder="t('page.organizes.profile.form-phone-holder')" />
            </el-form-item>
            <el-form-item :label="t('page.organizes.profile.form-email')" prop="email">
              <el-input maxlength="255" v-model="form.email" :placeholder="t('page.organizes.profile.form-email-holder')" />
            </el-form-item>
            <el-form-item :label="t('page.organizes.profile.form-create-time')" prop="createTime">
              {{ form.createTime }}
            </el-form-item>

            <el-form-item>
              <div class="text-align">
                <el-button type="info" @click="back">{{ t('page.organizes.profile.cancel') }}</el-button>
                <el-button v-loading="loading" type="primary" @click="submit">{{ t('page.organizes.profile.save')
                  }}</el-button>
              </div>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, computed, onMounted, watchEffect } from 'vue'
import { useI18n } from "vue-i18n";
import { ElMessage } from 'element-plus'
import IconSvg from "@/components/IconSvg";
import ScreenTable from '@/components/ScreenTable'
import ALink from '@/components/ALink'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import useQueryList from '@/composables/useQueryList'
import { trimComma } from '@/utils/trim'
import { ResponseData } from '@/utils/request'
import { avatar, update, queryList, removeData } from './service'
import { StateType as UserStateType, CurrentUser } from "@/store/user"
import { useStore } from "vuex"

const API = process.env.VUE_APP_HTTP_PREFIX

const { t } = useI18n();
const store = useStore<{ user: UserStateType }>()

const profile = computed<CurrentUser>(() => store.state.user.currentUser)

const avatarUrl = ref('')
const defaultAvatar = '/images/default-avatar.png'
const form = reactive({
  loginName: profile.value.name,
  realName: profile.value.realName,
  phone: profile.value.phone,
  email: profile.value.email,
  createTime: profile.value.createTime,
})
const formRef = ref(null)
const rules = reactive({
  realName: [
    { required: true, trigger: 'blur' },
    { max: 100, trigger: 'blur' }
  ],
  phone: [
    { required: true, trigger: 'blur' },
    { max: 100, trigger: 'blur' }
  ],
  email: [
    { required: true, trigger: 'blur' },
    { max: 255, trigger: 'blur' }
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
  window.history.go(-1)
}

const submit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) {
      return
    }
  } catch (error) {
    return
  }
  loading.value = true
  const data = { ...form }
  data.userId = profile.value.id
  if (profile.value.phone === form.phone) {
    delete data.phone
  }
  if (profile.value.email === form.email) {
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

onMounted(() => {
  form.loginName = profile.value.name
  form.realName = profile.value.realName
  form.phone = profile.value.phone
  form.email = profile.value.email
  form.createTime = profile.value.createTime
  avatarUrl.value = profile.value.avatar ? `${API}${profile.value.avatar}` : defaultAvatar
})

</script>
<style lang="scss"></style>
<style lang="scss" scoped>
@import "@/assets/css/chat/organize/global.scss";
@import "@/assets/css/chat/media.scss";

.main {
  width: auto;

  &-info {
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    height: 100%;
    border-radius: 1rem;
    background-color: #fff;
    justify-content: center;
    align-items: center;

    .text-align {
      display: flex;
      flex: 1;
      justify-content: flex-end;
    }

    .avatar {}

    .main-info-content {}
  }
}
</style>
