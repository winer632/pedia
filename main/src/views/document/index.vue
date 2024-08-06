<template>
  <div class="main">
    <div class="left-chat">
      <div class="qa">
        <div class="qa-header">
          <h1 class="qa-header-title">
            {{ t('page.document.header.title') }}
          </h1>
          <el-input v-model="input" class="qa-header-input" :placeholder="t('page.document.header.input')"
            @keyup.enter="search" :suffix-icon="Search" />
        </div>
      </div>

      <div class="qa-main">
        <div class="qa-main-create">
          <el-upload ref="uploadRef" :accept="'.pdf,.xlsx,.docx,.md'" :show-file-list="false" drag :limit="1"
            :before-upload="beforeUpload" :http-request="httpRequestAndClear" :on-exceed="handleExceed"
            class="upload-loading">
            <div class="qa-main-create-one">
              <div class="icon">
                <span class="iconsvg">
                  <icon-svg type="pk-plus"></icon-svg>
                </span>
                <span class="text">
                  {{ t('page.document.main.create') }}
                </span>
              </div>
              <div class="desc">
                {{ t('page.document.main.createDesc') }}
              </div>
            </div>
          </el-upload>
          <div class="qa-main-create-know hide">
            <div class="icon">
              <span class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path
                    d="M1.77075 2.83333C1.77075 2.44213 2.08788 2.125 2.47909 2.125H6.72909L8.49992 4.25H14.5208C14.912 4.25 15.2291 4.56712 15.2291 4.95833V14.1667C15.2291 14.5579 14.912 14.875 14.5208 14.875H2.47909C2.08788 14.875 1.77075 14.5579 1.77075 14.1667V2.83333Z"
                    stroke="#4E5969" stroke-width="1.2" stroke-linejoin="round" />
                  <path
                    d="M8.5001 7.08301L9.29449 8.82296L11.1948 9.04081L9.78544 10.334L10.1655 12.2085L8.5001 11.2678L6.8347 12.2085L7.21476 10.334L5.80542 9.04081L7.7057 8.82296L8.5001 7.08301Z"
                    stroke="#4E5969" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="text">
                {{ t('page.document.main.knowledge') }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="openCompare" class="qa-main-create-compare qa-main-create">
          <div class="qa-main-create-one flex" @click="handleOpenCompare">
            <div class="icon">
              <span class="iconsvg">
                <icon-svg type="pk-compare"></icon-svg>
              </span>
              <span class="text">
                {{ t('page.document.main.compare') }}
              </span>
            </div>
            <div class="desc">
              {{ t('page.document.main.compareDesc') }}
            </div>
          </div>
        </div>

        <div class="qa-main-list">
          <DocumentList :filter="input" @loadData="loadInit" @stopLLM="stop" />
        </div>
      </div>
    </div>
    <div v-if="!openPreview" class="main-chat main-chat-empty">
      <div class="main-chat-empty-nodata">
        <div class="main-chat-empty-left">
          <img src="/images/GroupA.png" width="40" height="40">
        </div>
        <div class="main-chat-empty-right">
          <div class="main-chat-empty-title">
            {{ welcome.title }}
          </div>
          <div class="main-chat-empty-desc">
            {{ welcome.subtitle }}
          </div>
          <div class="main-chat-empty-hint">
            {{ welcome.hint }}
          </div>
          <div class="main-chat-empty-uploadList">
            <div class="main-chat-empty-document" v-for="item in uploads" :key="item.icon">
              <el-upload ref="uploadReffer" :accept="'.pdf,.xlsx,.docx,.md'" :show-file-list="false" drag :limit="1"
                :before-upload="beforeUpload" :http-request="httpRequestAndClear" :on-exceed="handleExceed"
                class="upload-loading">
                <div class="icon">
                  <img :src="item.icon" />
                </div>
                <div class="title">
                  <p class="text">
                    {{ t(item.text) }}
                  </p>
                  <p class="desc">
                    {{ t(item.description) }}
                  </p>
                </div>
              </el-upload>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="openPreview && parserLoading" class="main-chat-loading">
      <div v-if="history?.parserState <= STATE_NEXT.RUNNING" class="icon">
        <icon-svg type="pk-loading"></icon-svg>
      </div>
      <div v-if="history?.parserState <= STATE_NEXT.RUNNING" class="text">
        {{ t('page.document.preview.parserLoading') }}
      </div>
      <div v-if="history?.parserState <= STATE_NEXT.RUNNING" class="desc">
        {{ t('page.document.preview.parserDesc') }}
      </div>
      <div v-if="history?.parserState === STATE_NEXT.TOKEN_EXCEED" class="desc">
        {{ t('page.document.preview.error-parser') }}
      </div>
      <div v-if="history?.parserState === STATE_NEXT.TOKEN_EXCEED" class="desc">
        {{ t('page.document.preview.error-exceed') }}
      </div>
      <div v-if="history?.parserState === STATE_NEXT.TOKEN_LIMIT" class="desc">
        {{ t('page.document.preview.error-parser') }}
      </div>
      <div v-if="history?.parserState === STATE_NEXT.TOKEN_LIMIT" class="desc">
        {{ t('page.document.preview.error-zero') }}
      </div>
      <div v-if="history?.parserState === STATE_NEXT.ERROR" class="desc">
        {{ t('page.document.preview.error-parser') }}
      </div>
      <div v-if="history?.parserState === STATE_NEXT.ERROR" class="desc">
        {{ t('page.document.preview.error-parser') }}
      </div>
    </div>
    <div v-if="openPreview && !parserLoading" class="main-chat-preview">
      <opener :uuid="uuid" :history="history" :sourceUrl="sourceUrl" :urlStateDocId="urlStateDocId"
        @handleCompareDocsChange="handleCompareDocsChange" />
    </div>
    <div v-show="uuid && !parserLoading" id="scrollRef" ref="scrollRef" class="main-chat">
      <el-skeleton v-if="pageLoading" class="main-chat-content" animated>
        <template #template>
          <div class="main-chat-grow">
            <div class="main-chat-message main-chat-no-message">
              <div class="main-chat-no-messageLeft">
                <el-skeleton-item variant="image" style="width: 72px; height: 72px;" />
              </div>
              <div class="main-chat-no-messageRight" style="gap: 16px">
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
      <div v-show="!pageLoading" class="main-chat-content">
        <div class="main-chat-grow">
          <div id="chatMessage" class="main-chat-message">
            <div class="expand" v-if="abExpand"></div>
            <div v-else class="inpand">
              <div class="iconabtext" style="background: url(/images/hide.svg) no-repeat top center;"
                @click="showAbExpand">
                {{ t('page.document.abstract.hide') }}<icon-svg type="pk-inpand"></icon-svg>
              </div>
            </div>
            <el-scrollbar ref="scrollbarRef">
              <template v-if="uuid">
                <document-abstract v-if="history.conversationType !== 'compare'" :id="documentAdLogsId"
                  :history="history" :historyAbstract="historyAbstract" :abExpand="abExpand"
                  @refreshAbstract="refreshAbstract" @regenerateAb="regenerateAb" @showAbExpand="showAbExpand" />
                <ChatMessage v-for="(chat, index) in chats" :key="index" :text="chat.text" :created-at="chat.createdAt"
                  :conversationType="history.conversationType" :id="chat.id" :topk="chat.topk" :like="chat.like"
                  :unlike="chat.unlike" :feedback="chat.feedback" :owner="chat.owner" :error="chat.error"
                  :loading="chat.loading" @handleClick="handleClick" @regenerate="onRegenerate(index)"
                  @delete="handleDelete(index)" @like="onLike" @unlike="onUnlike" @feedback="onFeedback" />
                <div v-if="chats.length === 0" class="main-chat-no-message">
                  <div class="main-chat-no-messageLeft">
                    <img src="/images/GroupA.png" width="40" height="40" />
                  </div>
                  <div class="main-chat-no-messageRight">
                    <div class="main-chat-no-messageTitle">
                      {{ welcomeStart.title }}
                    </div>
                    <div class="main-chat-no-messageDesc">
                      {{ welcomeStart.subtitle }}
                    </div>
                  </div>
                </div>
              </template>
            </el-scrollbar>
          </div>
        </div>
        <div class="main-chat-footer mt-24">
          <div v-if="questionList && questionList.length > 0" class="question hide">
            <div class="label">
              {{ t('page.document.abstract.question') }}
            </div>
            <div class="question-list" :title="question" v-for="question in questionList" :key="question"
              @click="handlePrompt(question)">
              {{ question }}
            </div>
          </div>
          <div class="main-chat-footer-op">
            <div class="main-chat-footer-opNormal">
              <el-popover placement="top" :width="790" trigger="hover" ref="popRef" v-model="popnor">
                <template #reference>
                  <icon-svg type="pk-normaldata" class="iconsvg w20 h20"></icon-svg>
                </template>
                <h1 class="normal-datah1">{{ t('page.qa.main.footer.normalData') }}</h1>
                <ElScrollbar class="normal-data" height="224">
                  <div class="normal-data-item" v-for="(item, index) in normalData" :key="'normal' + index">
                    <div class="normal-data-item-title" @click="normalDataInput(item)">
                      {{ item.content }}
                    </div>
                    <div class="normal-data-item-operation">
                      <div class="normal-data-operation-edit" @click="normalDataEdit(item)">
                        <icon-svg type="pk-editnormal" class="iconsvg"></icon-svg>
                      </div>
                      <div class="normal-data-operation-delete" @click="normalDataDelete(item)">
                        <icon-svg type="pk-deletenormal" class="iconsvg"></icon-svg>
                      </div>
                    </div>
                  </div>
                </ElScrollbar>
                <div class="normal-data-item">
                  <icon-svg type="pk-addplus"></icon-svg>
                  <a class="normal-data-item-add" @click="normalDataAdd">
                    {{ t('page.qa.main.footer.createNormalData') }}
                  </a>
                </div>
              </el-popover>
            </div>

            <div class="main-chat-footer-operation" @click="deleteLogs">
              <icon-svg type="pk-deletelogs" class="iconsvg w20 h20"></icon-svg>
            </div>
            <div class="main-chat-footer-operation">
              <el-dropdown class="footer-font" trigger="click" placement="top">
                <span class="el-dropdown-link">
                  <icon-svg type="pk-fontselect" class="iconsvg w20 h20"></icon-svg>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :class="{ 'is-active': font === 18 }" @click="fontSelect(18)">
                      Maximum 18
                    </el-dropdown-item>
                    <el-dropdown-item :class="{ 'is-active': font === 16 }" @click="fontSelect(16)">
                      Large 16
                    </el-dropdown-item>
                    <el-dropdown-item :class="{ 'is-active': font === 14 }" @click="fontSelect(14)">
                      Defaut 14
                    </el-dropdown-item>
                    <el-dropdown-item :class="{ 'is-active': font === 12 }" @click="fontSelect(12)">
                      Minimum 12
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="main-chat-footer-operation hide" @click="downloadLogs">
              <icon-svg type="pk-downloadlogs" class="iconsvg w20 h20"></icon-svg>
            </div>
            <div class="main-chat-footer-operation hide" @click="shareLogs">
              <icon-svg type="pk-sharelogs" class="iconsvg w20 h20"></icon-svg>
            </div>

          </div>

          <div class="main-chat-footer-input">
            <el-input ref="inputRef" v-model="prompt" type="textarea" input-style="height: 3.375rem"
              :disabled="disabled || buttonStatus === 'prompting'"
              :placeholder="t('page.qa.main.footer.inputplaceholder')" :autosize="{ minRows: 1, maxRows: 4 }"
              @keypress.enter="handleEnter" @focus="handleFocus" @blur="handleBlur" />

            <div class="main-chat-footer-button">
              <el-button v-if="buttonStatus === 'prompt'" type="primary" :disabled="buttonDisabled"
                @click="handleSubmit">
                <template #icon>
                  <icon-svg v-if="buttonDisabled" type="pk-prompt" class="main-chat-footer-promptwh"></icon-svg>
                  <icon-svg v-else type="pk-prompting" class="main-chat-footer-promptwh"></icon-svg>
                </template>
              </el-button>
              <el-button v-else-if="buttonStatus === 'prompting'" type="primary" @click="handleStop">
                <template #icon>
                  <icon-svg type="pk-stopre" class="main-chat-footer-promptwh"></icon-svg>
                </template>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="dialogNormalShow"
      :title="normal.id ? t('page.qa.main.modifyNormalDataHint') : t('page.qa.main.footer.modifyNormalDataHint')"
      width="500">
      <el-form :model="normal" :rules="normalRules" ref="normalForm" label-width="10">
        <el-form-item label="" prop="content">
          <el-input maxlength="100" type="textarea" v-model="normal.content"
            :placeholder="t('page.qa.normalData.placeholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogNormalShow = false">{{ t('page.qa.main.cancelButton') }}</el-button>
          <el-button type="primary" @click="handleNormalSubmit">{{ t('page.qa.main.confirmButton') }}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="openChunkDialog" :title="history?.docName">
      <el-scrollbar style="height: 60vh">
        <div class="chunk-content">
          <chunk-text :text="chunkFileWithURL"></chunk-text>
        </div>
      </el-scrollbar>
    </el-dialog>
    <compare-dialog v-model="openCompareDialog" @handleCreateCompare="handleCreateCompare" />
  </div>
</template>
<script lang="ts" setup>
import { computed, reactive, ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from "vue-i18n";
import { ElForm, ElMessage, ElMessageBox, ElPopover } from 'element-plus';
import html2canvas from 'html2canvas';
import { Search } from '@element-plus/icons-vue';
import IconSvg from "@/components/IconSvg";
import { getFileTypeWithName } from "@/utils/file";
import { DocumentParamsType, DocumentNormalParamsType } from "./data.d";
import { StateType as DocumentStateType } from '@/store/document';
import { StateType as GlobalStateType } from '@/store/global';
import DocumentAbstract from '@/components/Chat/DocumentAbstract.vue'
import DocumentList from '@/components/Chat/DocumentList.vue'
import ChatMessage from '@/components/Chat/DocumentMessage.vue'
import ChunkText from '@/components/Chat/ChunkText.vue'
import CompareDialog from '@/components/Document/CompareDialog.vue'
import CompareList from '@/components/Document/CompareList.vue'
import Opener from '@/components/Document/Opener.vue'
import { useChat } from '@/composables/useChat';
import useScroll from '@/composables/useScroll';
import { useUpload } from "@/composables/useUpload";
import { useWelcome } from '@/composables/usePrompt';
import useState from '@/composables/useState';
import { replaceDate } from '@/utils/date';
import { adjustInputFocus, adjustInputBlur, adjustMainRightScroll, eventMainRightScroll, removeEventMainScroll } from '@/utils/layout';
import {
  chatLLM, getLLM, clearLLM, stopLLM, getDocumentList, updateDocument,
  queryDocument, getPdfUrl, getMdFile, deleteDocument, getNormalData, addNormalData, updateNormalData, deleteNormalData, getAbstract, summary, regenerateAbstract,
  addCompare, updateCompare, queryCompareList, chatCompareLLM, getCompareLLM, clearCompareLLM, stopCompareLLM,
} from './service';
import { querySpeechList as queryWelcome } from '@/views/organizes/prompt/service';

const STORE_NAME = 'pk_document'

const historyAbstract = reactive({
  id: '',
  abstract: '',
  summary: '',
  question: '',
  score: -1,
  comment: '',
  loading: false
})
const loadAbstractRes = (res) => {
  if ('loading' in res) {
    historyAbstract.loading = res.loading
    return
  }
  if (res && uuid.value !== res.data.docId) return
  if (res && res.data) {
    historyAbstract.id = res.data.id
    historyAbstract.abstract = res.data.digest
    historyAbstract.summary = res.data.summarize
    historyAbstract.question = res.data.question
    historyAbstract.score = res.data.score
    historyAbstract.comment = res.data.comment
  }
  pageLoading.value = false
  historyAbstract.loading = false
}
const disabled = ref(false)
const handleEnable = () => {
  disabled.value = false
}

const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat(STORE_NAME);
const { scrollbarRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll();
const { interval, httpRequest, beforeUpload, handleExceed } = useUpload(loadAbstractRes, handleEnable);
const { STATE_NEXT } = useState();

const uploadRef = ref()
const uploadReffer = ref()

let abortController = new AbortController();
let stopId = ""
let freetalkId = 0
const initLLMParams = {
  docId: '',
  preConversationId: null,
  maxNewTokens: 2048,
  temperature: 0.1,
  regenerate: {
    isRegenerate: false,
  },
  knowledgeScope: {
    basicAbility: 1,
    privateDatabase: 1
  },
  config: {
    topP: 0.95,
    stopSequence: '',
    repetitionPenalty: 0,
    frequencyPenalty: 0,
  }
}

const router = useRouter();
const { currentRoute } = router;
const store = useStore<{ pk_document: DocumentStateType, global: GlobalStateType }>();
const { t } = useI18n();
store.commit('global/setMenuEnable', true)

const openWeb = ref(false);
const input = ref('')
const useContextOrNot = ref(false)
const uploads = ref([
  {
    icon: process.env.VUE_APP_PUBLIC_HREF + 'images/docx.png',
    iconsvg: 'pk-documentupload',
    text: 'page.document.main.create',
    description: 'page.document.main.createDesc',
    enable: true
  },
])
const fromKnow =
{
  icon: process.env.VUE_APP_PUBLIC_HREF + 'images/knowledge.png',
  text: 'page.document.main.knowledge',
  description: 'page.document.main.knowledgeDesc',
  enable: false
}
const normalData = ref<DocumentNormalParamsType[]>([])
const dialogNormalShow = ref(false)
const normal = reactive<DocumentNormalParamsType>({
  id: 0, content: ''
})

const openCompare = computed(() => store.state.global.openDocumentCompare)
const pageLoading = ref(true)
const normalForm = ref<typeof ElForm>()
const noMoreData = ref(false)
const llmLoading = ref(false)
const font = ref(14)
const popnor = ref(false)
const documentAdLogsId = ref(0)
const abExpand = ref(true)
const popRef = ref<typeof ElPopover | null>(null)
const downloadLoading = ref(false)
const openCompareDialog = ref(false)
const compareList = ref<any[]>([])
const prompt = ref('') // 消息输入框
const inputRef = ref<HTMLElement | null>(null) // 消息输入框
const buttonStatus = ref('prompt') // 按钮状态
const buttonDisabled = computed(() => {
  return buttonStatus.value === 'prompting' || !prompt.value || prompt.value.length === 0
}) // 按钮是否禁用
const uuid = computed((): number | null | undefined => {
  const active = store.state.pk_document.active
  return active
})
const history = computed(() => store.state.pk_document.history.find(item => item.uuid === uuid.value))

// 消息列表
const chats = computed(() => {
  const history = store.state.pk_document.history.find(item => item.uuid === uuid.value)
  if (history) {
    return history.chats
  }

  return []
})

const welcome = ref({
  title: t('page.document.empty.title'),
  subtitle: t('page.document.empty.desc'),
  hint: t('page.document.empty.hint')
})
const welcomeStart = ref({
  title: t('page.document.start.title'),
  subtitle: t('page.document.start.desc')
})
const sourceUrlWithURL = ref(store.state.pk_document.urlState.urlWithRes || '')
const openPreview = computed(() => { return store.state.pk_document.urlState.openPreview })
const parserLoading = computed(() => {
  return store.state.pk_document.urlState.status <= STATE_NEXT.RUNNING || store.state.pk_document.urlState.status === STATE_NEXT.ERROR || store.state.pk_document.urlState.status === STATE_NEXT.TOKEN_EXCEED || store.state.pk_document.urlState.status === STATE_NEXT.TOKEN_LIMIT
})
const sourceUrl = computed(() => store.state.pk_document.urlState.url || '')
const urlStateDocId = computed(() => store.state.pk_document.urlState.docId)
const fileType = computed(() => getFileTypeWithName(store.state.pk_document.urlState.url))
const pdfUrlWithURL = ref(store.state.pk_document.pdfState.pdfUrlWithRes || '')
const pdfLoading = ref(false)
const pdfUrl = computed(() => { return store.state.pk_document.pdfState.pdfUrl })
const chunkFileWithURL = ref('')
const openChunkDialog = ref(false)

const pdfViewer = computed(() => process.env.VUE_APP_PDF_VIEWER + '?file=' + encodeURIComponent(sourceUrlWithURL.value) + '&pagemode=none')

const questionList = computed(() => {
  const list = historyAbstract.question?.split('\n')
  return list
})

const normalRules = reactive({
  content: [
    { required: true, message: t('page.qa.normalData.placeholder'), trigger: 'blur' }
  ]
})

const refreshAbstract = (abstract) => {
  historyAbstract.score = abstract.score
  historyAbstract.comment = abstract.comment
}

const regenerateAb = async () => {
  historyAbstract.loading = true
  try {
    let res: any = {}
    if (historyAbstract.id) {
      res = await regenerateAbstract({ id: historyAbstract.id, docId: urlStateDocId.value })
    } else {
      res = await summary({ docId: urlStateDocId.value })
    }
    if (res && res.data) {
      historyAbstract.id = res.data.id
      historyAbstract.abstract = res.data.digest
      historyAbstract.summary = res.data.summarize
      historyAbstract.question = res.data.question
      historyAbstract.score = res.data.score
      historyAbstract.comment = res.data.comment
    }
  } catch (error) {
    console.error(error)
  }
  historyAbstract.loading = false
}

const showAbExpand = () => {
  abExpand.value = true
  scrollbarRef.value.wrapRef.scrollTop = 0
}

const httpRequestAndClear = async (option) => {
  disabled.value = true
  try {
    adjustMainRightScroll()
    await httpRequest(option)
    setTimeout(() => adjustMainRightScroll(), 0)
  } catch (error) {
    console.error(error)
  }
  uploadRef.value?.clearFiles()
  uploadReffer.value?.clearFiles()
}

// 搜索
const search = ($event) => {
  $event.stopPropagation();
  const key = $event.key
  if (key && key === "Enter") {
    console.log("enter")
  }
}

// 创建对话
const handleCreate = async () => {
  store.commit('pk_document/addHistory', { uuid: null, title: '', isEdit: true, createdAt: replaceDate(new Date()) })
}

// 创建文档对比
const handleCreateCompare = async (docs: any[]) => {
  const docIds = docs.map(item => item.docId).join(',')
  const name = docs.map(item => item.docName).join('/')
  const res = await addCompare({ docIds, name })

  store.commit('pk_document/addHistory', { uuid: res.data.id, name: res.data.name, conversationType: 'compare', docIds: res.data.docIds, docs, state: 4, createdAt: res.data.updateTime })
  store.commit('pk_document/changeUrlState', { openPreview: true, url: docs[0].sourceFile, status: docs[0].parserState, docId: docs[0].docId })
  store.commit('pk_document/saveActive', { uuid: res.data.id, status: STATE_NEXT.READY })
  openCompareDialog.value = false
}

// 打开文档对比
const handleOpenCompare = () => {
  openCompareDialog.value = true
}

// 发送消息
const handlePrompt = async (it) => {
  prompt.value = it
  onConversation(false)
  prompt.value = ''
}

const handleNormalSubmit = async () => {
  try {
    const valid = await normalForm.value?.validate()
    if (!valid) {
      return
    }
    const { id, content } = normal
    if (id) {
      await updateNormalData({ id, content })
    } else {
      await addNormalData({ content })
    }
    await loadNormalData()
  } catch (error) {
    console.log(error)
  } finally {
    dialogNormalShow.value = false
  }
}

const normalDataInput = (item: DocumentNormalParamsType) => {
  prompt.value = item.content || ''
  popRef.value && popRef.value.hide()
}

const normalDataEdit = async (item: DocumentNormalParamsType) => {
  normal.id = item.id
  normal.content = item.content || ''
  dialogNormalShow.value = true
}

const normalDataDelete = async (item: DocumentNormalParamsType) => {
  ElMessageBox.confirm(t('page.qa.main.deleteHintDetail'), t('page.qa.main.deleteHint'), {
    confirmButtonText: t('page.qa.main.confirmButton'),
    cancelButtonText: t('page.qa.main.cancelButton'),
    type: t('page.qa.main.deleteType')
  }).then(async () => {
    await deleteNormalData(item)
    await loadNormalData()
  }).catch(() => {
  })
}

const normalDataAdd = () => {
  normal.id = 0
  normal.content = ''
  dialogNormalShow.value = true
}
const onDownloadProgress = (processEvent) => {
  const xhr = processEvent.event.target
  const { responseText } = xhr
  const lines = responseText.trimEnd().split('\n')
  let chunk: any = {}
  let answer = ''
  let loading = false
  try {
    const Len = lines.length
    if (Len > 0) {
      answer = ''
      for (let i = 0; i < Len; i++) {
        const line = lines[i]
        chunk = JSON.parse(line)
        if (chunk.stopId) {
          stopId = chunk.stopId
          continue
        }
        if ('freetalkId' in chunk) {
          freetalkId = chunk.freetalkId
          loading = false
          break
        }
        if (chunk.answer) {
          answer += chunk.answer
        }
        if (chunk.finish_reason === 'sensitive') {
          answer += t('page.qa.message.error')
        }
      }
      if (answer) {
        updateChatSome(uuid.value, chats.value.length - 1, {
          createdAt: replaceDate(new Date()),
          text: answer,
          owner: 'llm',
          error: false,
          loading,
        })
        lastText = answer
      }

      scrollToBottomIfAtBottom()
    }
  } catch (error) {
    console.log(error)
  }
}
const onLike = async (id: number) => {
  const index = chats.value.findIndex(item => item.id === id)
  if (index !== -1) {
    updateChatSome(uuid.value, index, { like: true, unlike: false })
  }
}
const onUnlike = async (id: number) => {
  const index = chats.value.findIndex(item => item.id === id)
  if (index !== -1) {
    updateChatSome(uuid.value, index, { like: false, unlike: true })
  }
}
const onFeedback = async (id: number, feedback: string) => {
  const index = chats.value.findIndex(item => item.id === id)
  if (index !== -1) {
    updateChatSome(uuid.value, index, { feedback })
  }
}
let lastText = ''
const fetchChatWithLLM = async (lastText, message, index, options) => {
  const chatLLMWithLocale = history.value?.conversationType === 'compare' ? chatCompareLLM : chatLLM
  const res = await chatLLMWithLocale({
    ...initLLMParams,
    docId: history.value.docId,
    documentCompareId: history.value.uuid,
    query: message,
    ...options
  }, abortController.signal, onDownloadProgress)
  if (res && typeof res === 'string') {
    const lines = res.trimEnd().split('\n')
    const data = JSON.parse(lines.pop())
    const { id, topk, freetalkId } = data
    store.commit('saveHistory', { uuid: uuid.value })
    const conversationId = freetalkId
    updateChatSome(uuid.value, chats.value.length - 1, { id, prompt: message, conversationId, topk, loading: false })
    if (uuid.value && uuid.value === history.value?.uuid) {
      const updateLocale = history.value?.conversationType === 'compare' ? updateCompare : updateDocument
      await updateLocale({ id: uuid.value, docId: uuid.value, name: history.value.name })
    }
    scrollToBottomIfAtBottom()
    setTimeout(() => { scrollToBottom() }, 400)
    return
  }
  buttonStatus.value = 'prompt'
  updateChatSome(uuid.value, index, { loading: false })
}

const onConversation = async (regenerateOrNot = false, chat = null) => {
  let message = prompt.value
  if (regenerateOrNot) {
    message = chat?.prompt ?? ''
  }
  const history: any = []

  if (!message || message.length === 0) {
    return
  }

  if (buttonStatus.value === 'prompting') {
    return
  }
  let options: any = {}
  options.preFreetalkId = chats.value.length > 0 ? chats.value[chats.value.length - 1]?.conversationId : null

  addChat(uuid.value, {
    id: 0,
    createdAt: replaceDate(new Date()),
    text: message,
    owner: 'me',
    error: false,
    conversation: null,
    options: {
      prompt: message,
      options: null,
    }
  })

  scrollToBottom()

  buttonStatus.value = 'prompting'
  prompt.value = ''

  const lastContext = {}

  addChat(uuid.value, {
    id: 0,
    createdAt: replaceDate(new Date()),
    text: t('page.qa.main.llm.hint'),
    loading: true,
    owner: 'llm',
    error: false,
    conversation: null,
    options: {
      prompt: message,
      options: options,
    }
  })

  scrollToBottom()

  abortController = new AbortController()
  try {
    lastText = ''
    freetalkId = 0
    await fetchChatWithLLM(lastText, message, chats.value.length - 1, options)
  } catch (error: any) {
    const errorMessage = error?.message

    if (errorMessage === 'canceled') {
      updateChatSome(uuid.value, chats.value.length - 1, { loading: false })
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(uuid.value, chats.value.length - 1)
    if (currentChat?.text && currentChat.text.length > 0) {
      updateChatSome(uuid.value, chats.value.length - 1, {
        text: currentChat.text + '\n\n' + errorMessage,
        error: true,
        loading: false,
      })
      return
    }

    updateChat(uuid.value, chats.value.length - 1, {
      createdAt: replaceDate(new Date()),
      text: errorMessage,
      owner: 'llm',
      error: true,
      loading: false,
      conversation: null,
      options: {
        prompt: message,
        options: options
      }
    })
    scrollToBottomIfAtBottom()
  } finally {
    buttonStatus.value = 'prompt'
  }
}

const onRegenerate = async (index: number) => {
  if (buttonStatus.value === 'prompting') {
    return
  }

  const chat = chats.value[index]
  const message = chat?.prompt ?? ''

  const newOr = true
  if (newOr) {
    onConversation(true, chat)
    return
  }

  let options: any = {}

  if (chat.options) {
    options = { ...chat.options }
  }

  buttonStatus.value = 'prompting'

  updateChat(uuid.value, index, {
    createdAt: replaceDate(new Date()),
    text: '',
    owner: 'llm',
    error: false,
    loading: true,
    conversation: null,
    options: {
      prompt: message,
      options: options
    }
  })

  try {
    lastText = ''
    await fetchChatWithLLM(lastText, message, index, options)
  } catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(uuid.value, index, { loading: false })
      return
    }

    const errorMessage = error?.message ?? t('page.qa.error')

    updateChat(uuid.value, index, {
      createdAt: replaceDate(new Date()),
      text: errorMessage,
      owner: 'llm',
      error: true,
      loading: false,
      conversation: null,
      options: {
        prompt: message,
        options: options
      }
    })
  } finally {
    buttonStatus.value = 'prompt'
  }
}

const handleSubmit = () => {
  if (disabled.value) return
  onConversation()
}

const handleFocus = () => {
  adjustInputFocus()
}
const handleBlur = () => {
  adjustInputBlur()
}

const handleExport = () => {
  if (buttonStatus.value === 'prompting') {
    return
  }
}

const handleDelete = (index: number) => {
  store.commit('pk_document/deleteChat', index)
}

const handleEnter = () => {
  handleSubmit()
}

const stop = async (chat) => {
  const { uuid } = chat
  if (buttonStatus.value === 'prompting') {
    // abortController.abort()
    buttonStatus.value = 'prompt'
    const stopLLMWithLocale = history.value?.conversationType === 'compare' ? stopCompareLLM : stopLLM
    await stopLLMWithLocale({ sessionId: uuid, stopId })
    setTimeout(loadLLM, 100)
    // await loadLLM()
  }
}

const handleStop = async () => {
  if (buttonStatus.value === 'prompting') {
    // abortController.abort()
    buttonStatus.value = 'prompt'
    const stopLLMWithLocale = history.value?.conversationType === 'compare' ? stopCompareLLM : stopLLM
    await stopLLMWithLocale({ sessionId: uuid.value, stopId })
    setTimeout(loadLLM, 100)
    // await loadLLM()
  }
}

const deleteLogs = async () => {
  if (disabled.value) return
  ElMessageBox.confirm(t('page.qa.main.operation.deleteLogs'), t('page.qa.main.operation.hint'), {
    confirmButtonText: t('page.qa.main.confirmButton'),
    cancelButtonText: t('page.qa.main.cancelButton'),
    type: t('page.qa.main.deleteType')
  }).then(async () => {
    const clearLLMWithLocale = history.value?.conversationType === 'compare' ? clearCompareLLM : clearLLM
    await clearLLMWithLocale({ docId: history.value.docId, documentCompareId: history.value.uuid })
    store.commit('pk_document/clearChatByUuid', { uuid: uuid.value })
    ElMessage.success(t('page.qa.main.deleteSuccess'))
  }).catch(() => {
  })
}

const fontSelect = (ft: number) => {
  if (disabled.value) return
  font.value = ft
  if (typeof ft === 'number') {
    const textPreview = document.documentElement.style.getPropertyValue('--text-preview')
    document.documentElement.style.setProperty('--text-preview', ft + 'px')
    ElMessage.success(t('page.qa.main.operation.successMessageFont'))
  }
}

const downloadLogs = async () => {
  if (disabled.value) return
  if (downloadLoading.value) return
  ElMessageBox.confirm(t('page.qa.main.operation.deleteLogs'), t('page.qa.main.operation.hint'), {
    confirmButtonText: t('page.qa.main.confirmButton'),
    cancelButtonText: t('page.qa.main.cancelButton'),
    type: t('page.qa.main.deleteType')
  }).then(async () => {
    try {
      downloadLoading.value = true
      const element = document.getElementById('chatMessage')
      const canvas = await html2canvas(element, {
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: 716,
        height: 1000,
      })
      const img = canvas.toDataURL('image/png')
      const tempLink = document.createElement('a')
      tempLink.style.display = 'none'
      tempLink.href = img
      tempLink.setAttribute('download', 'chat.png')
      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank')
      }
      document.body.appendChild(tempLink)
      tempLink.click()
      document.body.removeChild(tempLink)
      window.URL.revokeObjectURL(tempLink.href)
      downloadLoading.value = false
      ElMessage.success(t('page.qa.main.exportSuccess'))
    } catch (error) {
      downloadLoading.value = false
      ElMessage.error(t('page.qa.main.exportError'))
    }
  }).catch(() => {
  })
}

const shareLogs = () => {
  if (disabled.value) return

}

const handleClick = async (doc: any) => {
  try {
    chunkFileWithURL.value = doc.text.replace(/<!--\{.*\}-->/g, '')
    openChunkDialog.value = true
    openChunkDialog.value = true
  } catch (error) {
    console.log(error)
  }
}

const handleCompareDocsChange = async (valu) => {
  let find = history.value?.docs?.find(item => item.docId === valu.docId)
  if (find) {
    store.commit('pk_document/changeUrlState', valu)
  }
}

const loadAbstract = async () => {
  historyAbstract.id = ''
  historyAbstract.abstract = ''
  historyAbstract.summary = ''
  historyAbstract.question = ''
  const docId = urlStateDocId.value
  const res = await getAbstract({ docId })
  if (urlStateDocId.value !== docId) return
  if (res && res.data) {
    historyAbstract.id = res.data.id
    historyAbstract.abstract = res.data.digest
    historyAbstract.summary = res.data.summarize
    historyAbstract.question = res.data.question
    historyAbstract.score = res.data.score
    historyAbstract.comment = res.data.comment
  }
}

const loadWelcome = async (defaultLang) => {
  const res = await queryWelcome({ scope: 2, language: defaultLang })
  if (res && res.data && res.data.length > 0) {
    welcome.value = res.data[0]
    welcome.value.hint = welcome.value.hint || t('page.document.empty.hint')
  } else {
    welcome.value = {
      title: t('page.document.empty.title'),
      subtitle: t('page.document.empty.desc'),
      hint: t('page.document.empty.hint')
    }
  }
}

const loadWelcomeStart = async (defaultLang) => {
  let res = null
  if (history.value?.conversationType === 'compare') {
    res = await queryWelcome({ scope: 5, language: defaultLang })
  } else {
    res = await queryWelcome({ scope: 3, language: defaultLang })
  }
  if (res && res.data && res.data.length > 0) {
    welcomeStart.value = res.data[0]
  } else {
    welcomeStart.value = {
      title: t('page.document.start.title'),
      subtitle: t('page.document.start.desc')
    }
  }
}

const loadCompareHistory = async () => {
  const history: any[] = []
  const res = await queryCompareList()
  if (res && res.data && res.data.length > 0) {
    res.data.forEach(it => {
      if (it.docs && it.docs.length > 0) {
        history.push({
          uuid: it.id,
          conversationType: 'compare',
          name: it.name,
          docs: it.docs,
          docIds: it.docIds,
          parserState: it.docs[0].parserState,
          sourceUrl: it.docs[0].sourceFile,
          isEdit: false,
          createdAt: it.updateTime || it.createTime,
          chats: []
        })
      }
    })
  }
  return history
}

const loadDocumentHistory = async () => {
  const res = await getDocumentList()
  if (res && res.data && res.data.length) {
    return res.data.map(item => {
      return {
        uuid: item.docId,
        docId: item.docId,
        name: item.docName,
        conversationType: 'doc',
        state: item.state,
        parserState: item.parserState,
        sourceUrl: item.sourceFile,
        pdfUrl: item.pdfFile,
        chunkFile: item.chunkFile,
        isEdit: false,
        createdAt: item.updateTime || item.createTime,
        chats: []
      }
    })
  }
  return []
}

const loadHistory = async () => {
  const h = await loadCompareHistory()
  const d = await loadDocumentHistory()
  const history: any[] = [...h, ...d].sort((a, b) => b.createdAt > a.createdAt ? 1 : -1)
  store.commit('pk_document/loadHistory', history)
}

const loadNormalData = async () => {
  const res = await getNormalData()
  if (res && res.data && res.data.length >= 0) {
    normalData.value = res.data
  }
}
const loadInit = async (chat) => {
  noMoreData.value = false
  historyAbstract.loading = true
  abExpand.value = true
  pageLoading.value = true
  pdfUrlWithURL.value = ''
  await handleStop()
  store.commit('pk_document/saveActive', chat)
  handleEnable()
  await loadAbstract()
  loadAbstractRes({ loading: false })
  pageLoading.value = false
  noMoreData.value = false
  adjustMainRightScroll()
  removeScroll()
  injectScroll()
  await loadLLM('add')
}
const loadLLM = async (type = 'add') => {
  if (llmLoading.value) return
  llmLoading.value = true
  const createTime = type === 'update' && chats.value.length > 0 ? chats.value[0].createdAt : ''
  const getLLMWithLocale = history.value?.conversationType === 'compare' ? getCompareLLM : getLLM
  const res = await getLLMWithLocale({ documentCompareId: history.value?.uuid, docId: history.value?.docId, page: 5, createTime: createTime })
  if (res && res.data) {
    const data: any = []
    for (const item of res.data) {
      data.push({
        createdAt: item.createTime,
        id: 0,
        text: item.query,
        owner: 'me',
        error: false,
        loading: false,
        like: item.score === 1,
        unlike: item.score === 2,
        prompt: '',
        conversationId: item.freetalkId,
      })
      data.push({
        createdAt: item.createTime,
        id: item.id,
        text: item.answer,
        owner: 'llm',
        error: false,
        loading: false,
        like: item.score === 1,
        unlike: item.score === 2,
        feedback: item.comment,
        prompt: item.query,
        conversationId: item.freetalkId,
        topk: item.topk,
      })
    }
    if (type === 'update') {
      store.commit('pk_document/updateChatsByUuid', { uuid: uuid.value, data })
    } else {
      store.commit('pk_document/addChatsByUuid', { uuid: uuid.value, data })
    }
  }
  if (res.data && res.data.length < 5) {
    noMoreData.value = true
  }
  scrollToBottom()
  llmLoading.value = false
}

const onDocumentScroll = async (e) => {
  const scrollTop = e.target.scrollTop || e.target.scrollingElement.scrollTop || e.target.documentElement.scrollTop
  const scrollHeight = e.target.scrollHeight
  const clientHeight = e.target.clientHeight
  if (scrollTop <= 40 && !noMoreData.value) {
    await loadLLM('update')
    window.document.removeEventListener('scroll', onDocumentScroll)
  }
}

const onScroll = async (e) => {
  const scrollTop = e.target.scrollTop
  const scrollHeight = e.target.scrollHeight
  const clientHeight = e.target.clientHeight
  const abstractDom = window.document.querySelector('.main-chat-abstract')
  const top = abstractDom?.scrollHeight > clientHeight ? abstractDom?.scrollHeight + 20 : abstractDom?.scrollHeight + 20

  if (scrollTop > Math.abs(top)) {
    abExpand.value = false
  }

  if (scrollTop < 20 &&
    scrollTop < 20 &&
    !noMoreData.value
  ) {
    await loadLLM('update')
  }
}

const injectScroll = () => {
  window.document.addEventListener('scroll', onDocumentScroll)
  setTimeout(() => scrollbarRef.value?.wrapRef.addEventListener('scroll', onScroll), 1000)
}

const removeScroll = () => {
  window.document.addEventListener('scroll', onDocumentScroll)
  scrollbarRef.value?.wrapRef.addEventListener('scroll', onScroll)
}

const { defaultLang } = useWelcome(loadWelcome)
const { defaultLang: lang } = useWelcome(loadWelcomeStart)
onMounted(async () => {
  await loadHistory()
  await loadNormalData()
  pageLoading.value = false
  if (uuid.value) {
    await loadAbstract()
    await loadLLM()
  }
  await loadWelcome(defaultLang.value)
  await loadWelcomeStart(lang.value)
  injectScroll()
  adjustMainRightScroll()
  eventMainRightScroll()
  inputRef.value?.focus()
  const script = document.createElement('script')
  script.src = '/preview/editormd/lib/marked.min.js'
  document.body.appendChild(script)
  const scriptPrettify = document.createElement('script')
  scriptPrettify.src = '/preview/editormd/lib/prettify.min.js'
  document.body.appendChild(scriptPrettify)
  const flow = document.createElement('script')
  flow.src = '/preview/editormd/lib/flowchart.min.js'
  document.body.appendChild(flow)
})

onUnmounted(() => {
  removeEventMainScroll()
  removeScroll()
  if (buttonStatus.value === 'prompting') {
    abortController.abort()
  }
})
let loadTime = 1
const loadPdf = async (uuidTemp: string, url: string) => {
  pdfLoading.value = true
  loadTime++
  try {
    const blob = await getPdfUrl({ url })
    if (uuidTemp !== uuid.value) return
    pdfUrlWithURL.value = URL.createObjectURL(blob)
    pdfLoading.value = false
    store.commit('pk_document/savePdfUrl', { pdfUrlWithRes: pdfUrlWithURL.value })
  } catch (error) {
    const { response } = error
    let status: number = 200
    if (response && response.status) {
      status = ~~response.status
    }
    if (status === 404 && loadTime <= 100 && pdfUrl.value) {
      setTimeout(async () => { await loadPdf(uuidTemp, pdfUrl.value) }, 4000)
      return
    }
    pdfUrlWithURL.value = ''
    console.log(error)
  }
}
watch(() => sourceUrl.value, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    loadAbstract()
  }
})
watch(() => uuid.value, async () => {
  if (history.value?.conversationType !== 'compare' && uuid.value && parserLoading.value) {
    interval()
  }
})
watch(() => history.value?.conversationType, async () => {
  history.value && await loadWelcomeStart(lang.value)
})
</script>
<style scoped>
.main-chat-footer-input>>>.el-textarea {
  margin: 0 0.375rem;
}

.main-chat-footer-input>>>.el-textarea__inner {
  height: 3.375rem;
  color: var(--theme-color-text);
  border: 0;
  box-shadow: none;
  resize: none;
  font-size: 0.875rem;
  padding: 0.375rem;
}

.main-chat-footer-input>>>.el-button--primary.is-disabled {
  border-radius: 50%;
  border: 0.0625rem solid;
  background: none;
  padding: 0;
}

.main-chat-footer-input>>>.el-button--primary {
  border-radius: 50%;
  border: 0.0625rem solid;
  background: none;
  padding: 0;
}

.main-chat-footer-button>>>.el-icon {
  width: auto;
  height: auto;
}

.qa-header>>>.el-input__wrapper {
  border-radius: 1.5rem;
  background: var(--theme-bg-colorSpan);
}

::v-deep(.is-active) {
  color: var(--theme-color-huge);
}
</style>
<style lang="scss">
@import "@/assets/css/chat/media.scss";
</style>
<style lang="scss" scoped>
@import "@/assets/css/chat/global.scss";
@import "@/assets/css/chat/media.scss";

.hide {
  display: none !important;
}

.w20 {
  width: 1.25rem;
}

.h20 {
  height: 1.25rem;
}

.main {
  .left-chat {
    .qa-main-create {
      display: flex;
      gap: 0.625rem;

      ::v-deep(.upload-loading) {
        flex: 1;
      }

      ::v-deep(.el-upload-dragger) {
        padding: 0;
      }

      &-one {
        color: #FFF;
        flex: 1;
        border-radius: 0.5rem;
        border: 0.0625rem solid var(--theme-color-huge);
        background: var(--theme-color-huge);

        .icon {
          display: flex;
          margin-top: 1rem;
          align-items: center;
          justify-content: center;

          .iconsvg {
            width: 1.5rem;
          }
        }

        .desc {
          margin: 0.625rem;
          font-family: "PingFang SC";
          font-size: 0.625rem;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          white-space: pre-wrap;
        }
      }

      &-know {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 5.875rem;
        border-radius: 0.5rem;
        background: var(--theme-bg-colorSpan);


      }
    }

    .qa-main-create-compare {
      margin-top: 0.625rem;
      display: flex;
      cursor: pointer;

      .flex {
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        border: 0.0625rem solid var(--theme-color-medium);
        background: var(--theme-color-medium);
        height: 5rem;
      }

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .main-chat-empty {}

  .main-chat-preview {
    border-radius: 1rem;
    background-color: #fff;

    .parser-loading {}
  }

  .main-chat {
    width: 100%;
    border-radius: 1rem;
    background-color: #fff;

    &-content {
      margin: 0;

      .main-chat-message {
        margin: 0 1rem 1rem 1rem;

        .expand {
          margin-top: 1rem;
        }

        .inpand {
          display: flex;
          width: 100%;
          height: 2.9625rem;
          justify-content: center;
          background: none;

          .iconabtext {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 159px;
            filter: drop-shadow(0px 1px 4.5px rgba(0, 0, 0, 0.10));
          }
        }
      }
    }
  }

  .main-chat-abstract {}

  .main-chat-message {}

  &-chat-no-message {
    display: flex;

    &Left {
      display: flex;
      margin-top: 1rem;
      margin-right: 0.75rem;
    }

    &Right {
      margin-top: 1rem;
      display: flex;
      flex: 1;
      flex-flow: column;
      height: fit-content;
      border-radius: 0 1rem 1rem 1rem;
      background: var(--theme-bg-colorSpan);
      padding: 1rem;
    }

    &Title {
      color: var(--theme-color-text);
      font-size: 1.625rem;
      font-weight: 600;
      line-height: 1.5rem;
    }

    &Desc {
      margin-top: 1rem;
      color: var(--theme-color-detail);
      font-size: 1rem;
      font-weight: 400;
    }
  }

  .main-chat-footer {
    margin: 0 1.25rem;
    position: relative;
    top: -1rem;
  }

  .question {
    margin: 0.625rem;
    display: flex;
    gap: 0.625rem;
    overflow: hidden;

    .question-list {
      display: flex;
      cursor: pointer;
      width: 10vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .main-chat-loading {
    border-radius: 1rem;
    background: #FFF;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    .icon {
      ::v-deep(svg) {
        width: 4.5rem;
        height: 4.5rem;
      }
    }

    .text {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      top: -5.5rem;
      right: -3.75rem;
      color: var(--el-color-primary);
      border: 0.0625rem solid var(--el-color-primary);
      border-radius: 1.25rem;
      background: rgba(20, 28, 235, 0.10);
      height: 1.75rem;
      width: 4.125rem;
    }

    .desc {
      display: flex;
      justify-content: center;
      color: #86909C;
      font-size: 14px;
      font-weight: 400;
    }
  }


  .main-chat-empty {
    display: flex;
    justify-content: center;
    gap: 1rem;

    &-nodata {
      display: flex;
      width: 46.8125rem;
      margin-top: 3.75rem;
    }

    &-left {
      display: flex;
      margin-right: 0.75rem;
    }

    &-right {
      display: flex;
      flex: 1;
      flex-flow: column;
      height: fit-content;
      border-radius: 0 1rem 1rem 1rem;
      background: var(--theme-bg-colorSpan);
      padding: 1rem;
    }

    &-title {
      color: var(--theme-color-text);
      font-size: 1.625rem;
      font-weight: 600;
      line-height: 1.5rem;
      min-width: 5rem;
    }

    &-desc {
      margin-top: 1rem;
      color: var(--theme-color-detail);
      font-size: 1rem;
      font-weight: 400;
    }

    &-hint {
      margin-top: 1.75rem;
    }



    &-document {
      display: flex;
      align-items: center;
      margin-top: 1rem;
      border-radius: 0.5rem;

      ::v-deep(.upload-loading) {
        flex: 1;

        p {
          text-align: left;
        }

        .icon {
          padding-right: 0;
        }
      }

      ::v-deep(.el-upload-dragger) {
        display: flex;
        align-items: center;
        border: none;
        padding: 0;
        padding-left: 0.625rem;
      }

      .icon {
        img {
          width: 2.25rem;
          height: 2.25rem;
        }
      }

      .title {
        margin: 1rem;
        font-family: "PingFang SC";
        font-size: 1rem;
        font-style: normal;
        font-weight: 500;

        .text {
          margin: unset;
        }

        .desc {
          margin: unset;
          margin-top: 1rem;
        }
      }

      .desc {
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 400;
        white-space: pre-wrap;
      }
    }
  }

  .title {
    font-size: 1.75rem;
    margin-top: 0;
    margin-bottom: 1.875rem;
    text-align: center;
    color: rgba(0, 0, 0, .85);
  }

  .submit {
    width: 100%;
  }
}
</style>
