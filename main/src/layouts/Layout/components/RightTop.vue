<template>
  <div id="layout-right-top" :class="{
    'fiexd': headFixed,
    'narrow': collapsed,
    'tabNavEnable': !tabNavEnable,
    'navModeHorizontal': navMode === 'horizontal'
  }">
    <div class="layout-right-top-header">
      <div v-if="navMode === 'vertical'" class="layout-right-top-top">
        <div @click="toggleCollapsed" class="layout-flexible">
          <icon-svg v-if="collapsed" type="menu-unfold"></icon-svg>
          <icon-svg v-else type="menu-fold"></icon-svg>
        </div>
        <div class="layout-top-menu">
          <div>
            <bread-crumbs class="breadcrumb" :list="breadCrumbs"></bread-crumbs>
          </div>
        </div>
        <div class="layout-top-menu-right">

          <right-top-message v-show="hideMessage" />

          <right-top-user />

          <select-lang class="layout-top-selectlang" />

          <settings v-if="showSettings"></settings>

        </div>
      </div>

      <div v-else class="layout-right-top-top menu">
        <div class="layout-right-top-logo">
          <router-link to="/" class="logo-url">
            <img alt="" src="/images/pk-logo.png" class="logo-png">
          </router-link>
        </div>
        <div class="layout-top-menu">
          <sider-menu v-if="menuEnable" :menu-data="menuData" :route-item="routeItem" mode="horizontal">
          </sider-menu>
        </div>
        <div class="layout-top-menu-right">

          <right-top-message v-show="hideMessage" />

          <select-lang class="layout-top-selectlang" />

          <settings v-if="showSettings"></settings>

          <a @click="handleGo"><img class="settings" src="/images/settings.png" /></a>

          <right-top-user />

        </div>
      </div>
      <right-tab-nav v-if="tabNavEnable" :route-item="routeItem"></right-tab-nav>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, withDefaults, defineProps, computed, toRefs } from "vue"
import { useStore } from "vuex"
import { StateType as UserStateType } from "@/store/user"
import { StateType as GlobalStateType } from '@/store/global'
import { RoutesDataItem, BreadcrumbType } from '@/utils/routes'
import IconSvg from "@/components/IconSvg"
import BreadCrumbs from '@/components/BreadCrumbs/index.vue'
import SelectLang from '@/components/SelectLang/index.vue'
import SiderMenu from "./SiderMenu.vue"
import RightTopMessage from './RightTopMessage.vue'
import RightTopUser from './RightTopUser.vue'
import RightTabNav from './RightTabNav.vue'
import Settings from './Settings.vue'
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

const { t } = useI18n()
const router = useRouter()

const isAdmin = computed<boolean>(() => store.state.user.currentUser.roleId <= 2)
interface Props {
  menuData: RoutesDataItem[];
  routeItem: RoutesDataItem;
  breadCrumbs: BreadcrumbType[];
}

const props = withDefaults(defineProps<Props>(), {})
const { menuData, routeItem, breadCrumbs } = toRefs(props)


const store = useStore<{ global: GlobalStateType; user: UserStateType }>()

const hideMessage = ref(true)
const showSettings = ref(true)
showSettings.value = false
hideMessage.value = false

// 导航模式
const navMode = computed(() => store.state.global.navMode)

// 头部是否固定
const headFixed = computed(() => store.state.global.headFixed)

// 右侧顶部tabNav是否开启
const tabNavEnable = computed<boolean>(() => store.state.global.tabNavEnable);

// 收缩左侧
const collapsed = computed<boolean>(() => store.state.global.collapsed)
const toggleCollapsed = (): void => {
  store.commit('global/changeLayoutCollapsed', !collapsed.value)
}

const menuEnable = computed<boolean>(() => store.state.global.menuEnable)

const handleGo = () => {
  if (isAdmin.value) {
    go('/organize/document')
  } else {
    go('/organize/log')
  }
}

const go = (p: string): void => {
  router.push({ path: p })
}

</script>
