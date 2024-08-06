<template>
  <div class="main">
    <div class="left-chat">
      <div class="qa">
        <div class="qa-header">
          <h1 class="qa-header-title">
            {{ t('page.knowledge.header.title') }}
          </h1>
          <el-input v-model="input" class="qa-header-input" :placeholder="t('page.knowledge.header.input')"
            @keydown.enter="search" :suffix-icon="Search" />
        </div>
      </div>

      <div class="qa-main">
        <div class="qa-main-create">
          <el-button type="primary" class="qa-main-create-button" @click="handleCreate">
            {{ t('page.knowledge.main.create') }}
          </el-button>
        </div>

        <div class="qa-main-list">
          <KnowledgeList :filter="input" @closeDocu="closeDocu" @loadData="loadInit" @stopLLM="stop" />
        </div>
      </div>
    </div>
    <div v-if="openPreview" class="main-chat-preview">
      <div class="know-docs-header" :class="docu.id ? 'ing' : ''">
        <div class="know-docs-header-title">
          {{ urlState?.docName }}
        </div>
        <div class="know-docs-header-button">
          <el-button v-if="!docu.id" type="primary" @click="changeDocu">{{ t('page.knowledge.pdfViewerQAButton')
            }}</el-button>
          <el-button v-else type="primary" @click="clearDocu">{{ t('page.knowledge.pdfViewerExitButton') }}</el-button>
        </div>
        <div class="know-docs-header-close">
          <el-button type="primary" text :title="t('page.knowledge.pdfViewerCloseButton')" @click="closeDocu">
            <template #icon>
              <icon-svg type="pk-knowclose" class="wh20"></icon-svg>
            </template>
          </el-button>
        </div>
      </div>
      <opener :uuid="uuid" :history="history" :sourceUrl="sourceUrl" />
    </div>
    <div id="scrollRef" ref="scrollRef" class="main-chat">
      <el-skeleton v-if="pageLoading" class="main-chat-content" animated>
        <template #template>
          <div class="main-chat-no-knowledge">
            <div class="main-chat-no-knowledgeLeft">
              <el-skeleton-item variant="image" style="width: 72px; height: 72px" />
            </div>
            <div class="main-chat-no-knowledgeRight" style="gap: 16px">
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" />
            </div>
          </div>
        </template>
      </el-skeleton>
      <template v-else>
        <div v-if="!knowList || knowList.length === 0 && chats.length === 0" class="main-chat-content">
          <div class="main-chat-no-knowledge">
            <div class="main-chat-no-knowledgeLeft">
              <img src="/images/GroupA.png" width="40" height="40" />
            </div>
            <div class="main-chat-no-knowledgeRight">
              <div class="main-chat-no-knowledgeTitle">
                {{ welcome.title }}
              </div>
              <div class="main-chat-no-knowledgeDetail" v-html="welcome.subtitle"></div>
              <div class="main-chat-no-knowledgeHint">
                {{ welcome.hint }}
              </div>
              <div class="main-chat-no-knowledgeButton">
                <img src="/images/pk-noknowledge.png" width="36" height="36" class="icon-svg" />
                <a class="font" @click="handleGo">
                  <p>
                    {{ t('page.knowledge.main.noKnowledgeHintDetail') }}
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="main-chat-content">
          <div class="main-chat-grow">
            <template v-if="chats.length === 0">
              <div class="main-chat-home-knowledge">
                <div class="main-chat-home-knowledgeLeft">
                  <img src="/images/GroupA.png" width="40" height="40" />
                </div>
                <div class="main-chat-home-knowledgeRight">
                  <div class="main-chat-home-knowledgeTitle">
                    {{ welcome.title }}
                  </div>
                  <div class="main-chat-home-knowledgeDetail" v-html="welcome.subtitle"></div>
                  <div class="main-chat-home-knowledgeHint">
                    {{ t('page.knowledge.main.knowledgeSelect') }}
                  </div>
                  <div class="main-chat-home-knowledgeButton">

                    <div class="knowledge-list" :class="{ active: knowActive(item), enable: item.enable }"
                      v-for="(item) in knowList" :key="item" @click="item.enable ? changeKnow(item) : false">
                      <el-tooltip :content="item.enable ? item.knowledgeName : t('page.knowledge.nodocs.hint')"
                        effect="light" placement="top">
                        <div class="flex">
                          <img src="/images/pk-knowledgeen.png" width="20" height="20" />
                          <span>{{ item.knowledgeName }}</span>
                        </div>
                      </el-tooltip>
                    </div>
                  </div>
                  <div class="split"></div>
                  <div class="main-chat-home-knowledgeUncertain">
                    {{ t('page.knowledge.main.noknowledge') }}
                  </div>
                  <el-tooltip :content="uncertain.knowledgeName" effect="light" placement="top">
                    <div class="main-chat-home-knowledgeUncertainButton" :class="{ active: knowActive(uncertain) }"
                      @click="changeKnow(uncertain)">
                      <img src="/images/pk-knowledgeno.png" width="20" height="20" />
                      <span>{{ uncertain.knowledgeName }}</span>
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </template>
            <template v-else>
              <div id="chatMessage" class="main-chat-message">
                <ElScrollbar ref="scrollbarRef">
                  <ChatMessage v-for="(chat, index) in chats" :key="index" :text="chat.text"
                    :created-at="chat.createdAt" :id="chat.id" :like="chat.like" :unlike="chat.unlike"
                    :feedback="chat.feedback" :prompt="chat.prompt" :docId="chat.docId" :docName="chat.docName"
                    :topk="chat.topk" :items="chat.items" :knowledgeId="chat.knowledgeId"
                    :knowledgeName="chat.knowledgeName" :knowledges="chat.knowledges" :know="know" :usedQA="chat.usedQA"
                    :knowList="knowList" :owner="chat.owner" :error="chat.error" :loading="chat.loading"
                    @handleChun="handleChun" @knowledgeThis="knowledgeThis" @regenerate="onRegenerate(index)"
                    @delete="handleDelete(index)" @like="onLike" @unlike="onUnlike" @feedback="onFeedback" />
                </ElScrollbar>
              </div>
            </template>
          </div>
          <div class="main-chat-footer mt-24">
            <div class="main-chat-footer-op">
              <div class="main-chat-footer-opNormal">
                <el-popover placement="top" :width="790" trigger="hover" ref="popRef" v-model="popnor">
                  <template #reference>
                    <icon-svg type="pk-normaldata" class="w20 h20"></icon-svg>
                  </template>
                  <h1 class="normal-datah1">{{ t('page.qa.main.footer.normalData') }}</h1>
                  <ElScrollbar class="normal-data" height="224">
                    <div class="normal-data-item" v-for="(item, index) in normalData" :key="'normal' + index">
                      <div class="normal-data-item-title" @click="normalDataInput(item)">
                        {{ item.content }}
                      </div>
                      <div class="normal-data-item-operation">
                        <div class="normal-data-operation-edit" @click="normalDataEdit(item)">
                          <icon-svg type="pk-editnormal" class="w20 h20"></icon-svg>
                        </div>
                        <div class="normal-data-operation-delete" @click="normalDataDelete(item)">
                          <icon-svg type="pk-deletenormal" class="w20 h20"></icon-svg>
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
                <icon-svg type="pk-deletelogs" class="iconsvg wh20"></icon-svg>
              </div>

              <div class="main-chat-footer-operation">
                <el-dropdown class="footer-font" trigger="click" placement="top">
                  <span class="el-dropdown-link">
                    <icon-svg type="pk-fontselect" class="iconsvg wh20"></icon-svg>
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
                        Default 14
                      </el-dropdown-item>
                      <el-dropdown-item :class="{ 'is-active': font === 12 }" @click="fontSelect(12)">
                        Minimum 12
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <div class="main-chat-footer-operation hide" @click="downloadLogs">
                <icon-svg type="pk-downloadlogs" class="iconsvg wh20"></icon-svg>
              </div>

              <div class="main-chat-footer-operation hide" @click="shareLogs">
                <icon-svg type="pk-sharelogs" class="iconsvg wh20"></icon-svg>
              </div>

              <div class="main-chat-footer-operation lang">
                <span class="span">{{ t('page.knowledge.lang.title') }}</span>
                <el-select v-model="lang">
                  <el-option v-for="item in LangOptions" :key="item.value" :label="item.label"
                    :value="item.value"></el-option>
                </el-select>
              </div>

              <div class="main-chat-footer-operation knowledge">
                <div v-if="docu.id" class="docu">
                  <div class="docu-name">
                    <el-tooltip :content="docu.name" effect="light" placement="top-start">
                      {{ docu.name }}
                    </el-tooltip>
                  </div>
                  <div class="docu-close" @click="clearDocu">
                    <icon-svg type="pk-knowclose" class="wh20"></icon-svg>
                  </div>
                </div>
                <div v-else class="know">
                  <el-popover width="400" popper-class="know-flag" placement="top-end" trigger="click" ref="popRef"
                    @blur="isKnowCard = false" @hide="isKnowCard = false">
                    <div class="card">
                      <div class="title">{{ t('page.knowledge.knowcard.title') }}</div>
                      <el-tag :type="knowActive(knowUncertain) ? 'primary' : 'success'"
                        @click="changeKnow(knowUncertain)">
                        <icon-svg v-if="knowActive(knowUncertain)" type="pk-knowth"></icon-svg>
                        <el-tooltip :content="knowUncertain.knowledgeName" effect="light" placement="top">
                          {{ knowUncertain.knowledgeName }}
                        </el-tooltip>
                      </el-tag>
                      <el-divider style="margin: 0" />
                      <div class="know-list">
                        <el-tag :type="knowActive(item) ? 'primary' : item.enable ? 'success' : 'info'"
                          @click="item.enable ? changeKnow(item) : false" v-for="(item) in knowList"
                          :key="item.knowledgeId">
                          <icon-svg v-if="knowActive(item)" type="pk-knowth"></icon-svg>
                          <el-tooltip :content="item.enable ? item.knowledgeName : t('page.knowledge.nodocs.hint')"
                            effect="light" placement="top">
                            {{ item.knowledgeName }}
                          </el-tooltip>
                        </el-tag>
                      </div>
                    </div>
                    <template #reference>
                      <div class="flex">
                        <el-tag class="active-know" type="primary" v-for="item in knowSelect" :key="item.id"
                          @click="showKnowCard">
                          <icon-svg type="pk-knowth"></icon-svg>
                          <el-tooltip :content="item.name" effect="light" placement="top-start">
                            {{ item.name }}
                          </el-tooltip>
                        </el-tag>
                        <div class="know-card" @click="showKnowCard">
                          <icon-svg v-show="!isKnowCard" type="pk-knowcard" class="wh20"></icon-svg>
                          <icon-svg v-show="isKnowCard" type="pk-knowup" class="wh20"></icon-svg>
                        </div>
                      </div>
                    </template>
                  </el-popover>
                </div>
              </div>
            </div>

            <div class="main-chat-footer-input">
              <el-input ref="inputRef" v-model="prompt" type="textarea" input-style="height: 3.375rem"
                :disabled="buttonStatus === 'prompting'" :placeholder="t('page.qa.main.footer.inputplaceholder')"
                :autosize="{ minRows: 1, maxRows: 4 }" @input="handleInput" @keypress.enter="handleEnter"
                @focus="handleFocus" @blur="handleBlur" />

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
      </template>
    </div>
    <el-dialog v-model="dialogNormalShow"
      :title="normal.id ? t('page.qa.main.footer.modifyNormalDataHint') : t('page.qa.main.footer.createNormalDataHint')"
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
    <el-dialog v-model="openChunkDialog" :title="urlState.docName">
      <el-scrollbar style="height: 60vh">
        <div class="chunk-content">
          <chunk-text :text="chunkFileWithURL"></chunk-text>
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { computed, reactive, ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from "vue-i18n";
import { ElForm, ElMessage, ElMessageBox, ElPopover } from 'element-plus';
import html2canvas from 'html2canvas';
import { Search } from '@element-plus/icons-vue';
import ALink from '@/components/ALink/index.vue';
import IconSvg from "@/components/IconSvg";
import { QAParamsType, QANormalParamsType } from './data.d';
import { StateType as KnowledgeStateType } from '@/store/knowledge';
import { StateType as GlobalStateType } from '@/store/global';
import { StateType as UserStateType, CurrentUser } from '@/store/user';
import KnowledgeList from '@/components/Chat/KnowledgeList.vue'
import ChatHint from '@/components/Chat/Hint.vue'
import ChatMessage from '@/components/Chat/KnowledgeMessage.vue'
import ChunkText from '@/components/Chat/ChunkText.vue'
import Opener from '@/components/Document/Opener.vue'
import { useChat } from '@/composables/useChat';
import useScroll from '@/composables/useScroll';
import useState from '@/composables/useState';
import { useWelcome } from '@/composables/usePrompt';
import { replaceDate } from '@/utils/date';
import { trimComma } from '@/utils/trim';
import { adjustInputFocus, adjustInputBlur, adjustMainRightScroll, eventMainRightScroll, removeEventMainScroll } from '@/utils/layout';
import {
  putQA, chatLLM, getLLM, clearLLM, stopLLM, queryAll, getPdfUrl, postQA, getQAList, getNormalData, queryKnowledge,
  addNormalData, updateNormalData, deleteNormalData, langby
} from './service';
import { queryList as documentKnowledges } from '../organizes/knows/service';
import { querySpeechList as queryWelcome } from '@/views/organizes/prompt/service';

const STORE_NAME = 'pk_knowledge'
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat(STORE_NAME);
const { scrollbarRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll();
const { getLocaleOutputLang } = useState()

let abortController = new AbortController();
let stopId = ""
let freetalkId = 0
const initLLMParams = {
  conversationType: 1,
  knowledgeId: undefined,
  docId: undefined,
  preConversationId: null,
  regenerate: {
    isRegenerate: false,
  },
  knowledgeScope: {
    basicAbility: 1,
    privateDatabase: 1,
  },
  config: {
    maxTokens: 2048,
    temperature: 0.1,
    topP: 0.95,
    stopSequence: '',
    repetitionPenalty: 0,
    frequencyPenalty: 0,
  }
}

const router = useRouter();
const { currentRoute } = router;
const store = useStore<{ pk_knowledge: KnowledgeStateType, global: GlobalStateType, user: UserStateType }>();
const { locale, t } = useI18n();
store.commit('global/setMenuEnable', true)

const isAdmin = computed(() => store.state.user.currentUser.roleId <= 2)
const welcome = ref({
  title: t('page.knowledge.main.noKnowledgeTitle'),
  subtitle: t('page.knowledge.main.noKnowledgeDetail'),
  hint: t('page.knowledge.main.noKnowledgeHint')
})
const pageLoading = ref(true);
const openWeb = ref(false);
const input = ref('')
const useContextOrNot = ref(false)
const normalData = ref<QANormalParamsType[]>([])
const dialogNormalShow = ref(false)
const normal = reactive<QANormalParamsType>({
  id: 0, content: ''
})
const normalForm = ref<typeof ElForm>()
const noMoreData = ref(false)
const llmLoading = ref(false)
const font = ref(14)
const pdfUrlWithURL = ref('')
const pdfLoading = ref(false)
const openPreview = computed(() => store.state.pk_knowledge.urlState.openPreview)
const pdfUrl = computed(() => store.state.pk_knowledge.pdfState.pdfUrl)
const sourceUrl = computed(() => store.state.pk_knowledge.urlState.url || '')
const chunkFileWithURL = ref('')
const chunkFileWithText = ref('')
const chunkFileWithFile = ref('')
const openChunkDialog = ref(false)
const downloadLoading = ref(false)
const popRef = ref<typeof ElPopover | null>(null)
const docu = reactive({})
const uncertain = { knowledgeId: '', knowledgeName: 'Uncertain' }
const know = reactive({ id: '', name: uncertain.knowledgeName })
const knowsSelected = ref<{ id: string; name: string; }[]>([])
const multipleSelected = computed(() => store.state.global.multipleOption) // 是否多选
const knowList = ref([])
const knowUncertain = ref(uncertain)
const isKnowCard = ref(false)
const lang = ref('')
const LangOptions = ref(getLocaleOutputLang())
const prompt = ref('') // 消息输入框
const inputRef = ref<HTMLElement | null>(null) // 消息输入框
const buttonStatus = ref('prompt') // 按钮状态
const buttonDisabled = computed(() => {
  return buttonStatus.value === 'prompting' || !prompt.value || prompt.value.length === 0
}) // 按钮是否禁用
const uuid = computed((): number | null => {
  const active = store.state.pk_knowledge.active
  return active
})
const history = computed(() => store.state.pk_knowledge.history)

// 消息列表
const chats = computed(() => {
  const history = store.state.pk_knowledge.history.find(item => item.uuid === uuid.value)
  if (history) {
    return history.chats
  }

  return store.state.pk_knowledge.chats
})

const urlState = computed(() => store.state.pk_knowledge.urlState)

const pdfViewer = computed(() => { return `${process.env.VUE_APP_PDF_VIEWER}?file=${encodeURIComponent(pdfUrlWithURL.value)}&pagemode=none` })

const normalRules = reactive({
  content: [
    { required: true, message: t('page.qa.normalData.placeholder'), trigger: 'blur' }
  ]
})

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
  await handleStop()
  store.commit('pk_knowledge/addHistory', { uuid: null, title: 'New Chat', isEdit: false, createdAt: replaceDate(new Date()) })
  store.commit('pk_knowledge/saveActive', { uuid: null })
  store.commit('pk_knowledge/saveHistory', { uuid: null })
  closeDocu()
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

const normalDataInput = (item: QANormalParamsType) => {
  prompt.value = item.content || ''
  popRef.value && popRef.value.hide()
}

const normalDataEdit = async (item: QANormalParamsType) => {
  normal.id = item.id
  normal.content = item.content || ''
  dialogNormalShow.value = true
}

const normalDataDelete = async (item: QANormalParamsType) => {
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
    if (Len <= 2 && uuid.value === null) {
      try {
        const qa = JSON.parse(lines[0])
        if (qa.scope) {
          pushHistoryStore(qa)
        }
      } catch (e) {
        console.error(e)
      }
      return
    }
    if (Len > 0) {
      answer = ''
      for (let i = 0; i < Len; i++) {
        const line = lines[i]
        chunk = JSON.parse(line)
        if (chunk.stopId) {
          stopId = chunk.stopId
          continue
        }
        if ('conversationId' in chunk) {
          freetalkId = chunk.conversationId
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
const pushHistoryStore = (qa) => {
  store.commit('pk_knowledge/updateHistory', { type: 'updateId', uuid: uuid.value, id: qa.id, name: qa.name })
  store.commit('pk_knowledge/saveActive', { uuid: qa.id })
}
let lastText = ''
const fetchChatWithLLM = async (lastText, message, index, options) => {
  const query = {
    knowledgeId: know.id
  }
  if (docu.id) {
    query.conversationType = 1
    query.docId = docu.id
    query.knowledgeId = trimComma(docu.knowledgeId)
  } else {
    if (know.id === '') {
      query.conversationType = 3
    } else {
      query.conversationType = 2
    }
  }
  const res = await chatLLM({
    ...initLLMParams,
    ...query,
    sessionId: uuid.value,
    lang: lang.value || 'zh-cn',
    query: message,
    ...options,
    prompt: ''
  }, abortController.signal, onDownloadProgress)
  if (res && typeof res === 'string') {
    const lines = res.trimEnd().split('\n')
    if (uuid.value === null) {
      if (lines.length > 0) {
        const qa = JSON.parse(lines[0])
        if (qa.scope) {
          pushHistoryStore(qa)
        }
      }
    }
    const data = JSON.parse(lines.pop())
    const { id, docId, docName, knowledgeId, knowledgeName, items, knowledges, conversationId, usedQA, topk } = data
    store.commit('pk_knowledge/saveHistory', { uuid: uuid.value })
    const conversation = conversationId
    const prompt = options.prompt || message
    updateChatSome(uuid.value, chats.value.length - 1, { id, prompt, conversation, usedQA, docId, docName, knowledgeId, knowledgeName, items, knowledges, topk, loading: false })
    if (uuid.value) {
      putQA({ id: uuid.value })
    }
    scrollToBottomIfAtBottom()
    setTimeout(() => { scrollToBottom() }, 400)
    return
  }
  updateChatSome(uuid.value, index, { loading: false })
}

const getKnowledgeListWith = (knowledges) => {
  let knowledgeJson: any = [uncertain]
  try {
    if (knowledges) {
      knowledgeJson = JSON.parse(knowledges)
      knowledgeJson = knowledgeJson.map(item => {
        if (item.knowledge_id === '') {
          return uncertain
        } else {
          return {
            knowledgeId: item.knowledge_id,
            knowledgeName: item.knowledge_name
          }
        }
      })
      if (knowledgeJson.length === 0) knowledgeJson = [uncertain]
    }
  } catch (error) {
    console.error(error)
  }

  return knowledgeJson
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
  options.preConversationId = null
  let ch = chat || chats.value[chats.value.length - 1]
  if (ch) {
    options.preConversationId = ch.knowledgeId === know.id ? ch.conversation : null
  }


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
  if (regenerateOrNot) {
    options = { ...options, regenerate: { isRegenerate: true } }
  }
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

  // 更新llm回答
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

const handleGo = () => {
  if (isAdmin.value) {
    router.push({ path: '/organize/knowledge' })
    return
  }
  ElMessage.warning('Please contact the administrator to create the  knowledge base')
}

const handleSubmit = () => {
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
  store.commit('pk_knowledge/deleteChat', index)
}

const handleEnter = () => {
  handleSubmit()
}

const stop = async (chat) => {
  const { uuid } = chat
  if (buttonStatus.value === 'prompting') {
    // abortController.abort()
    buttonStatus.value = 'prompt'
    await stopLLM({ sessionId: uuid, stopId })
    setTimeout(loadLLM, 100)
    // await loadLLM()
  }
}

const handleStop = async () => {
  if (buttonStatus.value === 'prompting') {
    // abortController.abort()
    buttonStatus.value = 'prompt'
    await stopLLM({ sessionId: uuid.value, stopId })
    setTimeout(loadLLM, 100)
    // await loadLLM()
  }
}

const deleteLogs = async () => {
  ElMessageBox.confirm(t('page.qa.main.operation.deleteLogs'), t('page.qa.main.operation.hint'), {
    confirmButtonText: t('page.qa.main.confirmButton'),
    cancelButtonText: t('page.qa.main.cancelButton'),
    type: t('page.qa.main.deleteType')
  }).then(async () => {
    await clearLLM({ id: uuid.value })
    store.commit('pk_knowledge/clearChatByUuid', { uuid: uuid.value })
    ElMessage.success(t('page.qa.main.operation.successMessageLogs'))
    await nextTick()
    adjustMainRightScroll(60)
  }).catch(() => {
  })
}

const fontSelect = async (ft: number) => {
  font.value = ft
  if (typeof ft === 'number') {
    const textPreview = document.documentElement.style.getPropertyValue('--text-preview')
    document.documentElement.style.setProperty('--text-preview', ft + 'px')
    ElMessage.success(t('page.qa.main.operation.successMessageFont'))
  }
}

const downloadLogs = async () => {
  if (downloadLoading.value) { return }
  ElMessageBox.confirm(t('page.knowledge.download.hintDetail'), t('page.knowledge.download.hint'), {
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
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = img
      link.setAttribute('download', 'chat.png')
      if (typeof link.download === 'undefined') {
        link.setAttribute('target', '_blank')
      }
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href)
      downloadLoading.value = false
      ElMessage.success(t('page.qa.main.exportSuccess'))
    } catch (error) {
      downloadLoading.value = false
      ElMessage.error(t('page.qa.main.exportError'))
    }
  }).catch(() => {
    downloadLoading.value = false
  })
}

const shareLogs = () => {

}

const showKnowCard = () => {
  isKnowCard.value = !isKnowCard.value
}

const MAX_LENGTH = 5
const changeKnow = (kn: any) => {
  if (multipleSelected.value) {
    if (kn.knowledgeId === uncertain.knowledgeId) {
      knowsSelected.value = []
      know.id = kn.knowledgeId
      know.name = kn.knowledgeName
    } else {
      const find = knowsSelected.value.find(item => item.id === kn.knowledgeId)
      if (find) {
        knowsSelected.value = knowsSelected.value.filter(item => item.id !== kn.knowledgeId)
      } else {
        if (knowsSelected.value.length >= MAX_LENGTH) {
          ElMessage.warning(t('page.knowledge.multiple.knowLimit', { count: MAX_LENGTH }))
          return
        }
        knowsSelected.value.push({
          id: kn.knowledgeId,
          name: kn.knowledgeName
        })
      }
      know.id = knowsSelected.value.map(item => item.id).join(',')
      know.name = knowsSelected.value.map(item => item.name).join('、')
    }
  } else {
    know.id = kn.knowledgeId
    know.name = kn.knowledgeName
    isKnowCard.value = false
  }
}

const knowSelect = computed(() => {
  if (multipleSelected.value) {
    if (knowsSelected.value.length === 0) {
      return [{
        id: uncertain.knowledgeId,
        name: uncertain.knowledgeName
      }]
    } else {
      return knowsSelected.value
    }
  } else {
    return [{ ...know }]
  }
})

const knowActive = (kn: any) => {
  if (multipleSelected.value) {
    if (kn.knowledgeId === uncertain.knowledgeId) {
      return knowsSelected.value.length === 0
    } else {
      const find = knowsSelected.value.find(item => item.id === kn.knowledgeId)
      return find ? true : false
    }
  } else {
    return know.id === kn.knowledgeId
  }
}

const knowledgeThis = (k, id) => {
  if (multipleSelected.value) {
    knowsSelected.value = [{
      id: k.knowledgeId,
      name: k.knowledgeName
    }]
  }
  know.id = k.knowledgeId
  know.name = k.knowledgeName
  const chat = chats.value.find(item => item.id === id)
  if (chat) {
    onConversation(true, chat)
  }
}

const getChunks = (index: number) => {
  const chunkIndex = chunkFileWithText.value.indexOf('{"chunk":' + index + '}')
  if (chunkIndex >= 0) {
    const nIndex = chunkFileWithText.value.indexOf('{"chunk":' + (index + 1) + '}')
    if (nIndex > chunkIndex) {
      chunkFileWithURL.value = chunkFileWithText.value.substring(chunkIndex + ('{"chunk":' + index + '}-->').length, nIndex - 4)
    } else {
      chunkFileWithURL.value = chunkFileWithText.value.substring(chunkIndex + ('{"chunk":' + index + '}-->').length)
    }
  } else {
    chunkFileWithURL.value = chunkFileWithText.value
  }
  chunkFileWithURL.value = chunkFileWithURL.value?.replace(/<!--\{.*\}-->/g, '')
}
const handleChun = async (chunk: any) => {
  chunkFileWithFile.value = chunk.text
  chunkFileWithURL.value = chunk.text
  openChunkDialog.value = true
}

const closeDocu = () => {
  docu.id = ''
  docu.name = ''
  store.commit('pk_knowledge/changeUrlState', { openPreview: false, url: '', docId: '' })
}

const changeDocu = () => {
  docu.id = store.state.pk_knowledge.urlState.docId
  docu.name = store.state.pk_knowledge.urlState.docName
  docu.knowledgeId = store.state.pk_knowledge.urlState.knowledgeId
}

const clearDocu = () => {
  docu.id = 0
  docu.name = ''
  docu.knowledgeId = ''
}

const loadHistory = async () => {
  const res = await getQAList({ scope: 2 })
  if (res && res.data && res.data.length > 0) {
    const history = res.data.map(item => {
      return {
        uuid: item.id,
        docId: item.docId,
        docName: item.docName,
        title: item.name,
        isEdit: false,
        createdAt: item.updateTime,
        chats: []
      }
    })
    store.commit('pk_knowledge/loadHistory', history)
  }
}

const loadNormalData = async () => {
  const res = await getNormalData()
  if (res && res.data && res.data.length >= 0) {
    normalData.value = res.data
  }
}

const loadInit = async (chat) => {
  noMoreData.value = false
  pageLoading.value = true
  await handleStop()
  store.commit('pk_knowledge/saveActive', chat)
  noMoreData.value = false
  await loadLLM('add')
  pageLoading.value = false
  removeScroll()
  injectScroll()
  store.commit('pk_knowledge/changeUrlState', { openPreview: false, url: '', docId: '' })
  clearDocu()
  await nextTick()
  adjustMainRightScroll(60)
  scrollToBottom()
}

const loadLLM = async (type = 'add') => {
  if (uuid.value === null) return
  if (llmLoading.value) return
  llmLoading.value = true
  const createTime = type === 'update' && chats.value.length > 0 ? chats.value[0].createdAt : ''
  const res = await getLLM({ sessionId: uuid.value, page: 5, createTime: createTime })
  if (res && res.data.length > 0) {
    const data: any = []
    for (const item of res.data) {
      const knowledges = item.knowledges
      data.push({
        createdAt: item.createTime,
        id: 0,
        text: item.query,
        owner: 'me',
        error: false,
        loading: false,
        like: item.score === 1,
        unlike: item.score === 2,
        feedback: item.comment,
        prompt: '',
        usedQA: item.usedQA,
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
        conversation: item.conversationId,
        usedQA: item.usedQA,
        topk: item.topk,
        docId: item.docId,
        docName: item.docName,
        knowledgeId: item.knowledgeId,
        knowledgeName: item.knowledgeName,
        items: item.items,
        knowledges
      })
    }
    if (type === 'update') {
      store.commit('pk_knowledge/updateChatsByUuid', { uuid: uuid.value, data })
    } else {
      store.commit('pk_knowledge/addChatsByUuid', { uuid: uuid.value, data })
    }
  }
  if (res && res.data.length < 5) {
    noMoreData.value = true
  }
  llmLoading.value = false
  scrollToBottom()
}

const loadWelcome = async (defaultLang) => {
  const res = await queryWelcome({ scope: 4, language: defaultLang })
  if (res && res.data && res.data.length > 0) {
    welcome.value = res.data[0]
    welcome.value.hint = welcome.value.hint || t('page.knowledge.main.noKnowledgeHint')
  } else {
    welcome.value = {
      title: t('page.knowledge.main.noKnowledgeTitle'),
      subtitle: t('page.knowledge.main.noKnowledgeDetail'),
      hint: t('page.knowledge.main.noKnowledgeHint')
    }
  }
}

const knowledgeList = async () => {
  const query = router.currentRoute.value.query
  const res = await queryAll()
  if (res && res.data) {
    res.data.map(item => {
      knowList.value.push({
        knowledgeId: item.knowledgeId,
        knowledgeName: item.knowledgeName,
        enable: item.documentCount > 0,
      })
      store.commit('pk_knowledge/saveKnowledge', knowList.value)
      if (query && query.knowledgeId === item.knowledgeId) {
        know.id = item.knowledgeId
        know.name = item.knowledgeName
        know.enable = item.documentCount > 0
        if (multipleSelected.value) {
          knowsSelected.value.push({
            id: item.knowledgeId,
            name: item.knowledgeName,
            enable: item.documentCount > 0
          })
        }
      }
    })
  }
}

const langList = async () => {
  const result = await langby()
  if (result && result.data && result.data.length > 0) {
    LangOptions.value = result.data.map(item => {
      return {
        label: item.dictLabel,
        value: item.dictValue
      }
    })
    LangOptions.value.unshift({
      label: 'Default',
      value: ''
    })
  }
}


const onDocumentScroll = (e) => {
  const scrollTop = e.target.scrollTop || e.target.scrollingElement.scrollTop || e.target.documentElement.scrollTop
  if (scrollTop <= 40 && !noMoreData.value) {
    loadLLM('update')
    window.document.removeEventListener('scroll', onDocumentScroll)
  }
}

const onScroll = async (e) => {
  const scrollTop = e.target.scrollTop
  const scrollHeight = e.target.scrollHeight
  const clientHeight = e.target.clientHeight

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
onMounted(async () => {
  await loadHistory()
  await loadNormalData()
  if (uuid.value) {
    await loadLLM('add')
  }
  await loadWelcome(defaultLang.value)
  await knowledgeList()
  await langList()
  pageLoading.value = false
  injectScroll()
  scrollToBottom()
  adjustMainRightScroll(60)
  eventMainRightScroll(60)
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
  removeEventMainScroll(60)
  removeScroll()
  if (buttonStatus.value === 'prompting') {
    abortController.abort()
  }
  closeDocu()
})
watch(() => store.state.pk_knowledge.pdfState.openPreview, async (newVal, oldVal) => {
  if (newVal) {
    console.log(newVal)
  }
})
let loadTime = 1
const loadPdf = async (url: string) => {
  pdfLoading.value = true
  pdfUrlWithURL.value = ''
  try {
    const blob = await getPdfUrl({ url })
    pdfUrlWithURL.value = URL.createObjectURL(blob)
  } catch (e) {
    console.error(e)
  } finally {
    pdfLoading.value = false
  }
}
watch(() => sourceUrl.value, async (newVal, oldVal) => {
  if (!openPreview.value) return
  adjustMainRightScroll(60)
})
</script>
<style lang="scss" scoped>
.qa-header::v-deep(.el-input__wrapper) {
  border-radius: 1.5rem;
  background: var(--theme-bg-colorSpan);
}

.qa-header::v-deep(.el-input__inner) {
  height: fit-content;
}

.main-chat-footer::v-deep(.el-textarea) {
  margin: 0 0.375rem;
}

.main-chat-footer-input::v-deep(.el-textarea__inner) {
  height: 3.375rem;
  color: var(--theme-color-text);
  border: 0;
  box-shadow: none;
  resize: none;
  font-size: 0.875rem;
  padding: 0.375rem;
}

.main-chat-footer-input::v-deep(.el-button--primary).is-disabled {
  border-radius: 50%;
  border: 0.0625rem solid;
  background: none;
  padding: 0;
}

.main-chat-footer-input::v-deep(.el-button--primary) {
  border-radius: 50%;
  border: 0.0625rem solid;
  background: none;
  padding: 0;
}

.main-chat-footer-button::v-deep(.el-icon) {
  width: auto;
  height: auto;
}


::v-deep(.is-active) {
  color: var(--theme-color-huge);
}

.know-flag {
  .card {
    display: flex;
    flex-flow: column;
    gap: 1rem;

    ::v-deep(.el-tag) {
      width: fit-content;
    }

    ::v-deep(.el-tag__content) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 360px;
    }

    ::v-deep(.el-tag--success) {
      color: var(--theme-color-text);
      cursor: pointer;
      background: var(--theme-bg-colorSpan);
      ;

      &:hover {
        background: var(--theme-bg-colorHover);
      }
    }

    .know-list {
      display: flex;
      gap: 0.625rem;
      align-items: center;
      justify-content: start;
      flex-flow: row wrap;
    }

    .know-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
}
</style>
<style lang="scss">
@import "@/assets/css/chat/media.scss";
</style>
<style lang="scss" scoped>
@import "@/assets/css/chat/global.scss";
@import "@/assets/css/chat/media.scss";

.w20 {
  width: 1.25rem;
}

.h20 {
  height: 1.25rem;
}

.wh20 {
  width: 1.25rem;
  height: 1.25rem;
}

.main {
  .left-chat {}

  .main-chat-preview {
    display: flex;
    flex-flow: column;
    height: 100%;

    .know-docs-header {
      display: flex;
      align-items: center;
      background-color: #FFF7E8;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 1rem 1rem 0 0;
      gap: 0.625rem;
      padding: 0.625rem;

      .know-docs-header-title {
        flex: 1;
        overflow: hidden;
        word-break: break-all;
      }

      .know-docs-header-button {
        overflow: hidden;
      }

      .know-docs-header-close {}
    }

    .know-docs-header.ing {
      background-color: var(--theme-bg-colorSpan);
    }

    iframe {
      width: unset;
      height: 89%;
    }
  }

  .main-chat {
    border-radius: 1rem;
    background-color: #fff;

    .main-chat-no-knowledge {
      margin-top: 3.375rem;
      display: flex;
      height: 100%;
      justify-content: center;

      .main-chat-no-knowledgeTitle {
        font-size: 1.625rem;
        font-weight: 600;
      }

      .main-chat-no-knowledgeDetail {
        margin-top: 1rem;
        color: #4E5969;
        font-size: 1rem;
        font-weight: 400;
      }

      .main-chat-no-knowledgeHint {
        margin-top: 2rem;
        font-size: 0.875rem;
        font-weight: 400;
      }

      .main-chat-no-knowledgeButton {
        display: flex;
        margin-top: 1rem;
        width: 50%;
        align-items: center;
        font-size: 0.75rem;
        font-weight: 400;
        border-radius: 0.625rem;
        background: #FFF;
        gap: 0.625rem;
        padding: 0.875rem 0 0.875rem 1.75rem;

        a {
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--theme-color-text);

          &:hover {
            color: var(--theme-color-huge);
          }
        }

        ::v-deep(.svg-icon) {
          width: 2.25rem;
          height: 2.25rem;
        }
      }

      &Left {
        display: flex;
        margin-right: 0.75rem;

      }

      &Right {
        display: flex;
        flex: 1;
        flex-flow: column;
        height: fit-content;
        border-radius: 0 1rem 1rem 1rem;
        background: var(--theme-bg-colorSpan);
        padding: 2rem 1.5rem 1.5rem 1.5rem;

      }
    }

    .main-chat-home-knowledge {
      --bg-color: --theme-color-huge;
      margin-top: 3.375rem;
      display: flex;
      height: 100%;

      .flex {
        display: flex;
        align-items: center;
        gap: 1rem;

        span {
          width: 5.625rem;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
          white-space: nowrap;
        }
      }

      .main-chat-home-knowledgeTitle {
        font-size: 1.625rem;
        font-weight: 600;
      }

      .main-chat-home-knowledgeDetail {
        margin-top: 1rem;
        color: #4E5969;
        font-size: 1rem;
        font-weight: 400;
      }

      .main-chat-home-knowledgeHint {
        margin-top: 2rem;
        font-size: 0.875rem;
        font-weight: 400;
      }

      .main-chat-home-knowledgeButton {
        display: flex;
        flex-wrap: wrap;

        .knowledge-list {
          margin: 1rem 1rem 0 0;
          margin-left: 0;
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          font-weight: 400;
          border: 0.0625rem solid;
          border-color: #FFF;
          border-radius: 0.625rem;
          padding: 1rem;
          gap: 1rem;
          background: var(--theme-bg-noEnable);

          &:hover {
            background: var(--theme-bg-noEnable);
          }
        }

        .knowledge-list.enable {
          cursor: pointer;
          background: #FFF;

          &:hover {
            background: var(--el-color-primary-light-9);
          }
        }

        .active {
          color: var(--bg-color);
          background: var(--el-color-primary-light-9);
          border: 0.0625rem solid;
          border-color: var(--el-color-primary);
        }

        ::v-deep(.svg-icon) {
          width: 1.375rem;
          height: 1.375rem;
        }

      }

      .main-chat-home-knowledgeUncertain {
        font-size: 0.875rem;
        font-weight: 400;
      }

      .active {
        color: var(--bg-color);
        background: var(--el-color-primary-light-9) !important;
        border: 0.0625rem solid;
        border-color: var(--el-color-primary);
      }

      .main-chat-home-knowledgeUncertainButton {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 400;
        width: fit-content;
        border-radius: 0.625rem;
        background: #FFF;
        padding: 1rem;
        gap: 1rem;

        ::v-deep(.svg-icon) {
          width: 1.375rem;
          height: 1.375rem;
        }

        span {
          width: 5.625rem;
        }

        &:hover {
          background: var(--el-color-primary-light-9);
        }

      }

      &Left {
        display: flex;
        margin-right: 0.75rem;

      }

      &Right {
        display: flex;
        flex: 1;
        flex-flow: column;
        height: fit-content;
        border-radius: 0 1rem 1rem 1rem;
        background: var(--theme-bg-colorSpan);
        padding: 2rem 1.5rem 1.5rem 1.5rem;
      }
    }

    .main-chat-footer-operation.lang {
      display: flex;
      width: 12.4375rem;
      gap: 0.5rem;

      ::v-deep(.el-select__wrapper) {
        background: var(--theme-bg-colorSpan);
        box-shadow: none;
      }

      .span {
        display: flex;
        align-items: center;
        width: 6.1875rem;
        white-space: nowrap;
      }
    }

    .main-chat-footer-operation.knowledge {
      display: flex;
      flex: 1;
      flex-direction: row-reverse;

      .docu {
        display: flex;
        border-radius: 0.25rem;
        background: #FFF7E8;
        gap: 0.375rem;
        align-items: center;

        .docu-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 5.625rem;
        }

        .docu-close {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
        }
      }

      .know {
        display: flex;
        gap: 0.375rem;
        align-items: center;

        .flex {
          display: flex;
          align-items: center;
          gap: 0.25rem;

          ::v-deep(.el-tag) {
            cursor: pointer;
          }
        }

        .active-know {
          border-radius: 0.25rem;
          max-width: 6rem;
          color: var(--theme-color-huge);

          ::v-deep(.el-tag__content) {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

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
