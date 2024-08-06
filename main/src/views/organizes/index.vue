<template>
  <div class="main">
    <screen-table :data="tableData.lis" :loading="tableData.loading" :pagination="table.pagination">
    </screen-table>
  </div>
</template>
<script setup lang="ts">
import { DefineComponents, reactive, ref, watchEffect } from 'vue'
import { useI18n } from "vue-i18n";
import { ElMessage } from 'element-plus'
import IconSvg from "@/components/IconSvg";
import ScreenTable from '@/components/ScreenTable'
import ALink from '@/components/ALink'
import { TableDataType, TableListItem, TableListQueryParams } from './data.d'
import useQueryList from '@/composables/useQueryList'
import { trimComma } from '@/utils/trim'
import { ResponseData } from '@/utils/request'
import { queryList, removeData } from './service'

const { t } = useI18n();

</script>
<style lang="scss" scoped></style>
