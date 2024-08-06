<style lang="scss" scoped>
@import "@/assets/css/chat/reset.scss";
</style>
<template>
  <el-dropdown popper-class="dropDownStyle" @command="onMenuClick">
    <a class="layout-top-usermenu" @click="e => e.preventDefault()">
      <img :src="avatarUrl" class="avatar" />
    </a>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="userinfo">
          {{ t('organize-layout.topmenu.userinfo') }}
        </el-dropdown-item>
        <el-dropdown-item command="modifyPwd">
          {{ t('organize-layout.topmenu.modifyPwd') }}
        </el-dropdown-item>
        <el-dropdown-item command="logout">
          {{ t('organize-layout.topmenu.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { StateType as UserStateType, CurrentUser } from "@/store/user";
import IconSvg from "@/components/IconSvg";

const store = useStore<{ user: UserStateType }>();
const router = useRouter();
const { t } = useI18n();

const API = process.env.VUE_APP_HTTP_PREFIX

const avatarUrl = ref('/images/avatar.png')

// 获取当前登录用户信息
const currentUser = computed<CurrentUser>(() => store.state.user.currentUser);

// 点击菜单
const onMenuClick = async (command: string) => {

  if (command === 'logout') {
    const res: boolean = await store.dispatch('user/logout');
    if (res === true) {
      router.replace({
        path: '/user/login',
        query: {
          redirect: router.currentRoute.value.path,
          ...router.currentRoute.value.query
        }
      })
    }
  } else if (command === 'userinfo') {
    router.push({
      path: '/organize/profile',
    })
  } else if (command === 'modifyPwd') {
    router.push({
      path: '/organize/modify-password',
    })
  }

}
onMounted(() => {
  if (currentUser.value.avatar) {
    avatarUrl.value = `${API}${currentUser.value.avatar}`
  } else {
    avatarUrl.value = '/images/avatar.png'
  }
})
</script>
