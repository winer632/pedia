<template>
  <div class="main-content-screen">
    <div v-if="$slots.header" class="screen-header">
      <slot name="header"></slot>
    </div>
    <div v-else class="screen-padding" />

    <div class="screen-content" ref="conentRef">
      <el-table ref="tableRef" :height="tableHeight" :row-key="rowKey" :data="data" v-loading="loading"
        :show-header="showHeader" :stripe="stripe" :border="border" :size="size" :class="tableClass"
        :header-row-class-name="headerRowClassName" @selection-change="handleSelection">
        <slot></slot>
        <template #empty>
          <slot v-if="$slots.empty" name="empty"></slot>
          <span v-else>
            <div class="empty">
              <div class="icon"><img src="/images/pk-nodata.png" width="176" height="115" /></div>
              <div class="hint">{{ t('app.global.data.empty') }}</div>
            </div>
          </span>
        </template>
      </el-table>
    </div>

    <div v-if="pagination" class="screen-footer">
      <el-pagination background :layout="pagination.layout || 'total, prev, pager, next, sizes'"
        :current-page="pagination.current" :page-sizes="pagination.sizes || [10, 20, 50, 100]"
        @size-change="pagination.sizeChange" :page-size="pagination.pageSize" :total="pagination.total"
        @current-change="pagination.onChange">
      </el-pagination>
    </div>
    <div v-else class="screen-padding" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref, SetupContext } from 'vue';
import { ElTable } from 'element-plus';
import debounce from 'lodash.debounce';
import { PaginationConfig } from './data.d';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'ScreenTable',
  props: {
    rowKey: {
      type: String,
    },
    data: {
      type: Array,
    },
    loading: {
      type: Boolean,
    },
    pagination: {
      type: Object as PropType<PaginationConfig | false | undefined>,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    stripe: {
      type: Boolean,
      default: true,
    },
    border: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: 'default',
    },
    tableClass: {
      type: String,
      default: 'custom-table',
    },
    headerRowClassName: {
      type: String,
      default: 'custom-table-header',
    },
  },
  setup(props, context: SetupContext) {
    const { t } = useI18n();
    const conentRef = ref<HTMLDivElement>();
    const tableHeight = ref<string | number>("70vh");
    const tableRef = ref<typeof ElTable | null>(null)

    const handleSelection = (selection: any) => {
      context.emit('handleSelection', selection)
    }

    const toggleSelect = (state: number[]) => {
      props.data?.map((item: any) => {
        if (!state.includes(item.translateState)) {
          tableRef.value?.toggleRowSelection(item, false)
        }
      })
    }

    const resizeHandler = debounce(() => {
      console.log(conentRef.value);
      if (conentRef.value) {
        tableHeight.value = conentRef.value.offsetHeight;
        console.log(tableHeight.value);
      }
    }, 100);

    onMounted(() => {
      resizeHandler();

      window.addEventListener('resize', resizeHandler);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeHandler);
    });

    return {
      t,
      handleSelection,
      conentRef,
      tableHeight,
      tableRef,
      toggleSelect
    };
  },
});
</script>
<style lang="scss" scoped>
.main-content-screen {
  display: flex;
  flex-direction: column;
  height: calc(100% - 48px - 50px);
  border-radius: 14px;
  background-color: #fff;
  padding: 0 10px 10px 10px;

  .screen-header {
    padding: 20px;
    min-height: 33px;
  }

  .screen-footer {
    display: flex;
    padding: 10px 0;
    min-height: 32px;
    text-align: right;

    ::v-deep(.el-pagination) {
      justify-content: right;
      width: 100%;
    }
  }

  .screen-content {
    flex: 1;
    padding: 0 20px;
    overflow: hidden;

    ::v-deep(.el-pagination) {
      justify-content: flex-end;
    }
  }

  .screen-padding {
    padding-top: 20px;
  }
}
</style>
