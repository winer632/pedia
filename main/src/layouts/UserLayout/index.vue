<template>
  <div class="layout-right">
    <div class="user-layout" style="background: url('/images/bg.png') 50% / cover no-repeat">
      <div class="logo">
        <img src="/images/pk-logo.png" alt="logo" />
      </div>
      <div class="lang">
        <SelectLang />
      </div>
      <div class="login">
        <router-view></router-view>
      </div>
      <div class="power-footer">
        Powered by SenseTime
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRoute } from 'vue-router';
import { jsonPathVueRoutes, getJsonRouteItem, RoutesDataItem, PathJsonRoutesDataItem, vueRoutes } from '@/utils/routes';
import UserLayoutRoutes from './routes';
import SelectLang from '@/components/SelectLang/index.vue';
import useTitle from '@/composables/useTitle';

export default defineComponent({
  name: 'UserLayout',
  components: {
    SelectLang
  },
  setup() {
    const route = useRoute();

    // 所有菜单路由
    const menuData: RoutesDataItem[] = vueRoutes(UserLayoutRoutes, '/user');

    // 框架所有的路由转成json并统一添加了parentPath
    const jsonPathRoutes: PathJsonRoutesDataItem = jsonPathVueRoutes(menuData)

    // 当前路由 item
    const routeItem = computed<RoutesDataItem>(() => getJsonRouteItem(route.path, jsonPathRoutes))

    // 设置title
    useTitle(routeItem);

  }
})
</script>
<style lang="scss" scoped>
.layout-right {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: auto;
  background: linear-gradient(101deg,
      #d3d2ff 2.58%,
      #eff2f7 31.64%,
      #cce0ff 93.67%);
}

.user-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  min-height: 31.25rem;
  flex-flow: column;
  overflow: auto;
  align-items: center;
  gap: 0.625rem;

  .logo {
    position: absolute;
    top: 1.25rem;
    left: 1rem;
  }

  .lang {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;

    ::v-deep(.el-dropdown) {
      .dropDown {

        i,
        .svg-icon {
          color: rgba(0, 0, 0, .85);
          font-size: 1rem;
        }
      }
    }

  }

  .login {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .power-footer {
    color: var(--theme-color-power);
    font-size: 0.75rem;
    font-weight: 400;
    margin-bottom: 0.625rem;
  }

}
</style>
