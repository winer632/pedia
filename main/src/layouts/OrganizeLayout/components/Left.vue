<template>
  <div id="layout-left" :class="{ 'narrow': collapsed, 'fixed': fixed }">
    <div class="layout-left">
      <div class="layout-left-header">
      </div>
      <div class="layout-left-menu">
        <sider-menu :menu-data="menuData" :route-item="routeItem" :collapsed="collapsed"></sider-menu>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { withDefaults, defineProps, computed, toRefs, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { StateType as GlobalStateType } from '@/store/global'
import { RoutesDataItem } from '@/router'
import SiderMenu from './SiderMenu.vue'

interface Props {
  menuData: RoutesDataItem[];
  routeItem: RoutesDataItem;
}

const props = withDefaults(defineProps<Props>(), {})
const { menuData, routeItem } = toRefs(props)

const store = useStore<GlobalStateType>()

const collapsed = computed(() => store.state.global.collapsed)

const fixed = computed(() => store.state.global.fixed)
</script>
