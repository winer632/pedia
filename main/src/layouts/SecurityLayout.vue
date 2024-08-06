<template>
  <spin v-if="(!isLogin && loading) || !isReady" style="height: 200px;" />
  <router-view v-if="isLogin" />
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, Ref, ComputedRef } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Spin from '@/components/Spin/index.vue';
import { StateType as UserStateType, CurrentUser } from "@/store/user";
import { queryRole } from '@/views/organizes/menu/service'
import { queryAll as queryConfigList } from "@/views/organizes/settings/service";

interface SecurityLayoutSetupData {
  isLogin: ComputedRef<boolean>;
  loading: Ref<boolean>;
  getUser: () => Promise<void>;
  isReady: Ref<boolean>;
}

export default defineComponent({
  name: 'SecurityLayout',
  components: {
    Spin
  },
  setup(): SecurityLayoutSetupData {
    const router = useRouter();
    const store = useStore<{ user: UserStateType }>();

    // 获取当前登录用户信息
    const currentUser = computed<CurrentUser>(() => store.state.user.currentUser);

    // 判断是否登录
    const isLogin = computed<boolean>(() => currentUser.value ? currentUser.value.id > 0 : false);

    // 读取当前用户信息func
    const isReady = ref<boolean>(false); // 是否读取过用户信息
    const loading = ref<boolean>(false);
    const getUser = async () => {
      loading.value = true;
      await store.dispatch('user/fetchCurrent');
      const roleId = currentUser.value.roleId
      if (roleId !== 1) {
        await queryMenu(roleId);
      }
      if (!isLogin.value && router.currentRoute.value.path !== '/user/login') {
        router.replace({
          path: '/user/login',
          query: {
            redirect: router.currentRoute.value.path,
            ...router.currentRoute.value.query
          }
        })
        return;
      }
      loading.value = false;
      isReady.value = true;
    }
    const queryMenu = async (roleId) => {
      const res = await queryRole(roleId)
      if (res && res.data && res.data.length > 0) {
        const menu = res.data.map(item => {
          return {
            path: item.path,
            name: item.menuName,
            id: item.menuId,
          }
        })
        res.data.map(item => {
          if (item.children && item.children.length > 0) {
            item.children.map(item => {
              menu.push({
                path: item.path,
                name: item.menuName,
                id: item.menuId,
              })
            })
          }
        })
        store.commit('user/setMenu', menu)
      }
    }
    const queryConfig = async () => {
      const res = await queryConfigList()
      if (res && res.data && res.data.length > 0) {
        const multipleOption = res.data.find(item => item.configKey === 'chatbot_option')?.configValue === '1'
        store.commit('global/setMultipleOption', multipleOption)
        const maxToken = ~~res.data.find(item => item.configKey === 'chatbot_max_token')?.configValue
        maxToken > 0 && store.commit('global/setMaxToken', maxToken)
        const openDocumentCompare = res.data.find(item => item.configKey === 'open_document_compare')?.configValue === '1'
        store.commit('global/setOpenDocumentCompare', openDocumentCompare)
      }
    }

    onMounted(() => {
      getUser();
      queryConfig();
    })


    return {
      isLogin,
      loading,
      getUser,
      isReady
    }


  }
})
</script>
