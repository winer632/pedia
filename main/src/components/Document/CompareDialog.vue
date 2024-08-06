<template>
  <el-dialog v-model="openDialog" :title="t('page.document.compare.dialogTitle')">
    <div class="dialog-header">
      {{ t('page.document.compare.dialogHeader') }}
    </div>
    <el-table ref="table" :data="docs" border :stripe="true" @select="handleSelect">
      <el-table-column type="selection" :selectable="handleDisable"></el-table-column>
      <el-table-column prop="docName" :label="t('page.organizes.docus.tb-label-name')" min-width="240">
        <template #default="{ row }">
          <icon-svg :type="iconType(row)" class="icon-svg"></icon-svg>
          {{ row.docName }}
        </template>
      </el-table-column>
      <el-table-column prop="tokenNum" :label="t('page.document.compare.tokenNum')" width="120">
      </el-table-column>
    </el-table>
    <div class="error-hint">
      <span>{{ hint }}</span>
      <span>{{ MAX_TOKEN_NUM }}</span>
      <span :class="{ red: total > MAX_TOKEN_NUM }">({{ total }}</span>
      <span>/</span>
      <span>{{ MAX_TOKEN_NUM }})</span>
    </div>
    <div class="dialog-footer">
      <el-button @click="handleCancel">{{ t('page.organizes.docus.buttonCancel') }}</el-button>
      <el-button :disabled="total > MAX_TOKEN_NUM || total < 10" type="primary" @click="handleSubmit">{{
    t('page.document.compare.buttonChat') }}</el-button>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits, computed, defineComponent, PropType, WritableComputedRef, onMounted, watch } from "vue";
import '@ckeditor/ckeditor5-build-decoupled-document/build/translations/zh-cn';
import IconSvg from '@/components/IconSvg';
import { ElMessage } from 'element-plus';
import { useI18n } from "vue-i18n";
import { queryDocument, getDocumentList } from '@/views/document/service';
import useState from '@/composables/useState';
import { StateType as GlobalStateType } from '@/store/global';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore<{ global: GlobalStateType }>();

const { t } = useI18n();

const { STATE_NEXT } = useState();
const MAX_TOKEN_NUM = computed(() => store.state.global.maxToken);
const total = computed(() => multiple.value.reduce((pre, cur) => pre + cur.tokenNum, 0));
const header = 'Please select two uploaded documents for comparison'
const hint = 'The total token count of the two documents must not exceed'

interface Props {
  modelValue: boolean;
}

interface Emits {
  (ev: 'update:modelValue', open: boolean): void;
  (ev: 'handleCreateCompare', docs: any[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const docs = ref<any[]>([]);
const multiple = ref<any[]>([]);
const table = ref<any>(null);
const openDialog = ref<boolean>(props.modelValue);

const iconType = (item: any) => {
  if (item.sourceFile.includes('.md')) {
    return 'pk-md'
  } else if (item.sourceFile.includes('.xlsx')) {
    return 'pk-xlsx'
  } else if (item.sourceFile.includes('.ppt')) {
    return 'pk-ppt'
  } else if (item.sourceFile.includes('.docx')) {
    return 'pk-docx'
  } else if (item.sourceFile.includes('.txt')) {
    return 'pk-txt'
  } else {
    return 'pk-pdf'
  }
}

const handleSelect = (selection: any[], row: any) => {
  const length = selection.length;
  if (length > 2) {
    ElMessage.error(t('page.document.compare.error'));
    table.value.toggleRowSelection(row);
    return;
  }
  multiple.value = selection;
}

const handleDisable = (row: any) => {
  if (multiple.value.length > 2) {
    return false;
  }
  return true;
}

const handleCancel = () => {
  openDialog.value = false;
}

const handleSubmit = () => {
  if (multiple.value.length !== 2) {
    ElMessage.error(t('page.document.compare.error'));
    return;
  }
  const tokenNum = multiple.value[0].tokenNum + multiple.value[1].tokenNum
  if (tokenNum > MAX_TOKEN_NUM.value) {
    ElMessage.error(t('page.document.compare.tokenNumError', { maxToken: MAX_TOKEN_NUM.value, currentToken: tokenNum }));
    return;
  }
  emit('handleCreateCompare', multiple.value);
  table.value.clearSelection();
}

const loadDocs = async () => {
  const res = await getDocumentList();
  if (res && res.data) {
    docs.value = res.data.filter(item => item.parserState === STATE_NEXT.READY);
  }
}

watch(() => props.modelValue, async (value) => {
  if (value) {
    await loadDocs()
  }
  openDialog.value = props.modelValue;
})
watch(() => openDialog.value, (value) => {
  emit('update:modelValue', openDialog.value);
})

onMounted(async () => {
  await loadDocs()
})
</script>
<style lang="scss" scoped>
::v-deep(.el-table__header-wrapper .el-checkbox) {
  display: none;
}

.error-hint {
  margin-top: 1rem;
  display: flex;
  gap: 0.25rem;
}

.red {
  color: var(--theme-color-error);
}

.dialog-header {
  margin: 0 0 0.625rem 0;
}

.dialog-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}
</style>
