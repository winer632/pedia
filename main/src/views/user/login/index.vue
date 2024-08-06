<template>
  <div class="main">
    <div class="left">
      <img :src="prefix + 'images/login.png'" />
    </div>
    <div class="right">
      <h1 class="title" style="mix-blend-mode: darken;">
        <img src="/images/pk-logo.png" />
      </h1>
      <el-form class="form" :model="modelRef" :rules="rulesRef" ref="formRef">
        <el-form-item label="" prop="username">
          <el-input class="input" v-model="modelRef.username" :placeholder="t('page.user.login.form-item-username')"
            @keydown.enter="handleSubmit">
            <template #prefix>
              <i class="el-input__icon">
                <icon-svg type="user"></icon-svg>
              </i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input class="input" v-model="modelRef.password" type="password"
            :placeholder="t('page.user.login.form-item-password')" @keydown.enter="handleSubmit">
            <template #prefix>
              <i class="el-input__icon">
                <icon-svg type="pwd"></icon-svg>
              </i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox class="text-align-right" v-model="modelRef.remeberMe">
            {{ t('page.user.login.rememberMe') }}
          </el-checkbox>
          <div class="text-forget">
            <span @click="handleForget">{{ t('page.user.login.form.forget') }}</span>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit" @click="handleSubmit" :loading="submitLoading">
            {{ t('page.user.login.form.btn-submit') }}
          </el-button>
        </el-form-item>

        <el-alert v-if="loginStatus === 'error' && !submitLoading" :title="t('page.user.login.form.login-error')"
          type="error" show-icon :closable="false" />

      </el-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from "vue-i18n";
import { ElForm, ElMessage } from 'element-plus';
import IconSvg from "@/components/IconSvg";
import { LoginParamsType } from './data.d';
import { StateType as UserLoginStateType } from './store';
import Cookie from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'


const router = useRouter();
const { currentRoute } = router;
const store = useStore<{ userlogin: UserLoginStateType }>();
const { t } = useI18n();

const prefix = computed(() => process.env.VUE_APP_PUBLIC_HREF)

// 表单值
const modelRef = reactive<LoginParamsType>({
  username: '',
  password: '',
  remeberMe: false,
});
// 表单验证
const rulesRef = reactive({
  username: [
    {
      required: true,
      message: t('page.user.login.form-item-username.required'),
    },
  ],
  password: [
    {
      required: true,
      message: t('page.user.login.form-item-password.required'),
    },
    {
      min: 6,
      message: t('page.user.login.form-item-password.min'),
    },
  ],
});
// form
const formRef = ref<typeof ElForm>();
// 登录loading
const submitLoading = ref<boolean>(false);
// 登录
const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    const valid: boolean | undefined = await formRef.value?.validate();
    if (valid === true) {
      if (modelRef.remeberMe) {
        Cookie.set('username', modelRef.username, { expires: 30 });
        Cookie.set('password', encrypt(modelRef.password), { expires: 30 });
        Cookie.set('remeberMe', modelRef.remeberMe, { expires: 30 });
      } else {
        Cookie.remove('username');
        Cookie.remove('password');
        Cookie.remove('remeberMe');
      }
      const res: boolean = await store.dispatch('userlogin/login', modelRef);
      if (res === true) {
        ElMessage.success(t('page.user.login.form.login-success'));
        const { redirect, ...query } = currentRoute.value.query;
        window.location.href = router.resolve({
          path: redirect as string || '/',
          query: {
            open: 'video',
            ...query
          }
        }).href;
      }
    }
  } catch (error) {
    console.log(error);
    ElMessage.warning(t('app.global.form.validatefields.catch'));
  }
  submitLoading.value = false;
}

// 登录状态
const loginStatus = computed<"ok" | "error" | undefined>(() => store.state.userlogin.loginStatus);

const getCookie = () => {
  const username = Cookie.get('username');
  const password = Cookie.get('password');
  const remeberMe = Cookie.get('remeberMe');
  if (username && password) {
    modelRef.username = username === undefined ? modelRef.username : username;
    modelRef.password = password === undefined ? modelRef.password : decrypt(password);
    modelRef.remeberMe = remeberMe === undefined ? false : Boolean(remeberMe);
  }
}

getCookie();

const forget = ref<boolean>(false);
const handleForget = () => {
  forget.value = true;
  ElMessage.success(t('page.user.login.form.forget-success'));
}

</script>
<style lang="scss">
@import "@/assets/css/chat/media.scss";
</style>
<style lang="scss" scoped>
@import "@/assets/css/chat/media.scss";

.main {
  display: flex;
  flex: none;
  width: 60.6875rem;
  height: 40.0625rem;
  border-radius: 1.25rem;
  border: 0.0625rem solid #FFF;
  background: rgba(241, 243, 247, 0.50);
  box-shadow: 0rem 0.875rem 3.5rem 0rem rgba(22, 24, 75, 0.10);
  backdrop-filter: blur(1.1969rem);
  padding: 1rem 1rem 1rem;

  .left {
    margin-right: 1rem;

    img {
      border-radius: 0.625rem 0.625rem 2.5rem 0.625rem;
      height: 100%;
    }
  }

  .right {
    display: flex;
    flex-grow: 1;
    flex-flow: column;
    align-items: center;
    justify-content: center;

    .text-forget {
      display: flex;
      flex: 1;
      justify-content: flex-end;
      color: #86909C;
      font-size: 0.875rem;
      font-weight: 400;
      cursor: pointer;
    }

    .form {
      width: 22.125rem;
      font-family: "PingFang SC";
      font-size: 1.25rem;
      font-style: normal;
      font-weight: 500;
      line-height: 1.75rem;

      .input {
        height: 3.375rem;
      }

      .submit {
        height: 3.375rem;
        border-radius: 0.25rem;
      }
    }
  }

  .title {
    font-size: 1.75rem;
    margin-top: 0;
    margin-bottom: 1.875rem;
    text-align: center;
    color: rgba(0, 0, 0, .85);
    /*background-image:-webkit-linear-gradient(right,#FFFFFF,#409eff, #FFFFFF);
    -webkit-background-clip: text;
    -webkit-text-fill-color:transparent; */
  }

  .submit {
    width: 100%;
  }
}
</style>
