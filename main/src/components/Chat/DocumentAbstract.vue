<template>
  <div class="main-chat-abstract">
    <div v-if="abExpand" class="expand">
      <div class="abtitle">
        {{ t('page.document.abstract.prefix') }}<span class="abname">{{ history?.docName || history?.name }}</span>{{
      t('page.document.abstract.suffix') }}
      </div>
      <div v-loading="historyAbstract.loading" class="abstra">
        <div class="abstract" v-text="historyAbstract.abstract || loadingText || empty">
        </div>
        <div class="summary" v-text="historyAbstract.summary">
        </div>
      </div>
      <div class="operations">
        <div class="operation">
          <icon-svg v-if="!liked" type="pk-like" class="operation-icon" @click="like"></icon-svg>
          <icon-svg v-else type="pk-liked" class="operation-icon" @click="like"></icon-svg>
        </div>
        <div class="operation">
          <icon-svg v-if="!unliked" type="pk-unlike" class="operation-icon" @click="unlike"></icon-svg>
          <icon-svg v-else type="pk-unliked" class="operation-icon" @click="unlike"></icon-svg>
        </div>
        <div class="operation">
          <icon-svg v-if="!feed" type="pk-feedback" class="operation-icon" @click="showFeedback"></icon-svg>
        </div>
        <div class="operation">
          <icon-svg v-if="!copied" type="pk-copy" class="operation-icon" @click="handleClipboard"></icon-svg>
          <icon-svg v-else type="pk-copy" class="operation-icon" @click="handleClipboard"></icon-svg>
        </div>
        <div class="operation regenerate">
          <a @click="regenerateAb">
            {{ t('page.qa.message.regenerate') }}
          </a>
        </div>
      </div>
    </div>
    <el-dialog v-model="FeedbackDialog">
      <el-form :model="feedbackForm" ref="feedbackFormRef">
        <el-form-item>
          <el-input v-model="feedbackForm.comment" type="textarea" placeholder="Enter your feedback"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="FeedbackDialog = false">{{ t('page.qa.main.cancelButton') }}</el-button>
        <el-button type="primary" @click="feedback">{{ t('page.qa.main.confirmButton') }}</el-button>
      </template>
    </el-dialog>
  </div>
  <div v-if="!abExpand" class="inpand-hide">
  </div>
</template>
<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { copyToClip } from '@/utils/clipboard'
import IconSvg from '@/components/IconSvg'
import {
  putAbstractFeedback
} from '../../views/document/service'
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const empty = t('page.document.abstract.empty')
const loadingText = computed(() => props.historyAbstract.loading ? t('page.document.abstract.loading') : undefined)
const liked = computed(() => props.historyAbstract.score === 1)
const unliked = computed(() => props.historyAbstract.score === 2)
const feed = computed(() => props.historyAbstract.comment || '')
const copied = ref(false)
interface Props {
  id: number | string
  history: any
  historyAbstract: any
  abExpand: boolean
}

interface Emits {
  (ev: 'regenerateAb'): void
  (ev: 'showAbExpand'): void
  (ev: 'refreshAbstract'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const FeedbackDialog = ref(false)
const feedbackForm = ref({
  comment: ''
})

const regenerateAb = () => {
  emit('regenerateAb')
}

const showAbExpand = () => {
  emit('showAbExpand')
}

const handleClipboard = async () => {
  try {
    await copyToClip(`${props.historyAbstract.abstract}` || '')
    copied.value = true
    ElMessage.success(t('page.qa.main.copySuccess'))
  } catch (error) {
    ElMessage.error(t('page.qa.main.copyError'))
  }
}

const like = async () => {
  const res = await putAbstractFeedback({ id: props.historyAbstract.id, docId: props.history.docId, score: 1 })
  if (res && res.data) {
    emit('refreshAbstract', res.data)
  }
  ElMessage.success(t('page.qa.main.likeSuccess'))
}

const unlike = async () => {
  const res = await putAbstractFeedback({ id: props.historyAbstract.id, docId: props.history.docId, score: 2 })
  if (res && res.data) {
    emit('refreshAbstract', res.data)
  }
  ElMessage.success(t('page.qa.main.globalSuccess'))
}

const feedback = async () => {
  const res = await putAbstractFeedback({ id: props.historyAbstract.id, docId: props.history.docId, comment: feedbackForm.value.comment })
  if (res && res.data) {
    emit('refreshAbstract', res.data)
  }
  ElMessage.success(t('page.qa.main.globalSuccess'))
}

const showFeedback = () => {
  FeedbackDialog.value = true
}

</script>
<style lang="scss" scoped>
.main-chat-abstract {
  z-index: 1;
  display: flex;

  .expand {
    width: 100%;
    display: flex;
    flex-flow: column;
    margin-bottom: 1rem;
    border-radius: 1rem;
    background-color: #fff;
    padding-bottom: 1rem;

    .abtitle {
      border-radius: 0.25rem;
      background: var(--theme-bg-color);
      font-family: "PingFang SC";
      font-size: 0.75rem;
      font-style: normal;
      font-weight: 500;
      line-height: 1.5rem;
      text-align: left;
      padding: 0.375rem;

      .abname {
        color: var(--theme-color-huge);
        font-family: "PingFang SC";
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 400;
        line-height: 1.5rem;
        padding: 0.375rem;
      }
    }

    .operations {
      display: flex;
      margin-top: 0.375rem;
      margin-bottom: -0.375rem;
      cursor: pointer;
      gap: 0.625rem;

      .operation.regenerate {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        font-size: 0.75rem;
        font-weight: 400;

        a {
          color: var(--theme-color-huge);
        }

      }
    }

    .abstra {
      margin-top: 0.625rem;
      border-radius: 0.25rem;
      background: var(--theme-bg-color);
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1.5rem;
      padding: 0.375rem;
      white-space: pre-wrap;

      icon-svg {
        cursor: pointer;
      }
    }

    .abstract {}
  }

  &:has(> .inpand) {
    /* Safari */
    position: -webkit-sticky;
    position: sticky;
    top: 0;
  }
}

.inpand-hide {
  margin-bottom: 1rem;
  background-color: #FFF;
}
</style>
