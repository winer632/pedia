<template>
  <inner-link v-for="(item, index) in tagsViewStore.iframeViews" :key="item.path" :iframeId="'iframe' + index"
    v-show="route.path === item.path" :src="iframeUrl(item.meta.link, item.query)"></inner-link>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import InnerLink from "../InnerLink/index";
import useTagsViewStore from "@/store/modules/tagsView";

const store = useStore<any>();
const route = useRoute();
const tagsViewStore = store.state.ry_tags_view;

function iframeUrl(url, query) {
  if (Object.keys(query).length > 0) {
    let params = Object.keys(query).map((key) => key + "=" + query[key]).join("&");
    return url + "?" + params;
  }
  return url;
}
</script>
