<template>
  <result status="403" title="403" subtitle="Sorry, the page you visited does not unauthorized.">
      <template #extra>
          <router-link to="/">
              <el-button type="primary">
                  Back Home
              </el-button>
          </router-link>
      </template>
  </result>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import Result from '@/components/Result/index.vue';
export default defineComponent({
  name: 'NotFound',
  components: {
      Result
  }
})
</script>
