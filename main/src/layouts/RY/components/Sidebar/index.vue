<template>
  <div :class="{ 'has-logo': showLogo }"
    :style="{ backgroundColor: sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper">
      <el-menu :default-active="activeMenu" :collapse="isCollapse"
        :background-color="sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground"
        :text-color="sideTheme === 'theme-dark' ? variables.menuColor : variables.menuLightColor" :unique-opened="true"
        :active-text-color="theme" :collapse-transition="false" mode="vertical">
        <sidebar-item v-for="(route, index) in sidebarRouters" :key="route.path + index" :item="route"
          :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/assets/ry/styles/variables.module.scss'
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore<any>();
const route = useRoute();
const appStore = store.state.ry_app
const settingsStore = store.state.ry_settings
const permissionStore = store.state.permission

const sidebarRouters = computed(() => permissionStore.sidebarRouters);
const showLogo = computed(() => settingsStore.sidebarLogo);
const sideTheme = computed(() => settingsStore.sideTheme);
const theme = computed(() => settingsStore.theme);
const isCollapse = computed(() => !appStore.sidebar.opened);

const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
})

</script>
