<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useI18n } from "vue-i18n";
import IconSvg from '@/components/IconSvg'
import Spin from '@/components/Spin/index.vue'

import { useRouter } from "vue-router";
import { useStore } from 'vuex'
import { StateType as GlobalStateType } from "@/store/global"
const router = useRouter();
const store = useStore<{ global: GlobalStateType; }>()
const { t } = useI18n();
store.commit('global/setQiankunViewStyle', 'none')
store.commit('global/setMenuEnable', false)

const homeList = reactive([{
  svg: "pk-homeqa",
  class: "qa",
  title: 'layout.menu.qa',
  desc: 'layout.menu.qa.desc',
  href: '/qa',
  bg: '/images/pk-homeqa.svg'
}, {
  svg: "pk-homedocument",
  class: "document",
  title: 'layout.menu.document',
  desc: 'layout.menu.document.desc',
  href: '/document',
  bg: '/images/pk-homedocument.svg'
},
{
  svg: "pk-homeknowledge",
  class: "knowledge",
  title: 'layout.menu.knowledge',
  desc: 'layout.menu.knowledge.desc',
  href: '/knowledge',
  bg: '/images/home-know.png'
},
{
  svg: "pk-homewait",
  class: "gray wait",
  title: 'layout.menu.wait',
  desc: '',
  href: '',
  bg: '/images/home-wait.png'
}])

const go = (ph: string) => {
  if (ph === '') return
  router.push({ path: ph })
}

// xs 小于768 sm 768-992 md 992-1200 lg 1200-1600 xl 1600-2000
</script>
<template>
  <div class="layout-main-content">
    <div class="layer">
      <div class="row">
        <div class="row-item" :class="item.class"
          :style="{ background: `url(${item.bg}) no-repeat`, backgroundPosition: 'right bottom' }"
          @click="go(item.href)" v-for="(item, index) in homeList" :key="index">
          <div class="title">{{ t(item.title) }}</div>
          <div v-if="item.desc" class="desc">{{ t(item.desc) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
