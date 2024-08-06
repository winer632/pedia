<template>
  <div class="main">
    <div class="left-chat">
      <div class="qa">
        <div class="qa-header">
          <h1 class="qa-header-title">
            {{ t('page.qa.header.title') }}
          </h1>
          <el-input v-model="input" class="qa-header-input" :placeholder="t('page.qa.header.input')"
            @keydown.enter="search" :suffix-icon="Search" />
        </div>
      </div>

      <div class="qa-main">
        <div class="qa-main-create">
          <el-button type="primary" class="qa-main-create-button" @click="handleCreate">
            {{ t('page.qa.main.create') }}
          </el-button>
        </div>

        <div class="qa-main-list">
          <ChatList :filter="input" @loadData="loadInit" @stopLLM="stop" />
        </div>
      </div>
    </div>
    <div id="scrollRef" ref="scrollRef" class="main-chat">
      <el-skeleton v-if="pageLoading" class="main-chat-content" animated>
        <template #template>
          <div class="main-chat-grow">
            <div class="main-chat-nodata">
              <div class="main-chat-nodata-left">
                <el-skeleton-item variant="image" width="72" height="72" style="width: 72px; height: 72px" />
              </div>
              <div class="main-chat-nodata-right" style="width: 100%; gap: 16px">
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
      <template v-else>
        <div class="main-chat-content">
          <div class="main-chat-grow">
            <template v-if="chats.length === 0">
              <div class="main-chat-nodata">
                <div class="main-chat-nodata-left">
                  <span>
                    <img src="/images/GroupA.png" width="40" height="40" />
                  </span>
                </div>
                <div class="main-chat-nodata-right">
                  <div class="main-chat-nodata-title">
                    {{ welcome.title }}
                  </div>
                  <div class="main-chat-nodata-detail" v-html="welcome.subtitle">
                  </div>
                  <div class="main-chat-nodata-hint">
                    <div>{{ welcome.hint }}</div>
                    <el-row class="mt-8">
                      <el-col :class="{ 'mb-16': index < 1 }" :span="12" v-for="(r, index) in promptList"
                        :key="'r' + index">
                        <a class="full" @click="handlePrompt(r)">
                          <ChatHint :class="`chat-hint${index % 2}`" :title="r.title" :desc="r.description" prompt="">
                            <template #icon>
                              <img :src="r.icon" width="24" height="24" />
                            </template>
                          </ChatHint>
                        </a>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div id="chatMessage" class="main-chat-message">
                <ElScrollbar ref="scrollbarRef">
                  <ChatMessage v-for="(chat, index) in chats" :key="index" :text="chat.text"
                    :created-at="chat.createdAt" :id="chat.id" :like="chat.like" :unlike="chat.unlike"
                    :feedback="chat.feedback" :owner="chat.owner" :urls="chat.urls" :error="chat.error"
                    :loading="chat.loading" @regenerate="onRegenerate(index)" @delete="handleDelete(index)"
                    @like="onLike" @unlike="onUnlike" @feedback="onFeedback" />
                </ElScrollbar>
              </div>
            </template>
          </div>
          <div class="main-chat-footer mt-24">
            <div class="main-chat-footer-op">
              <div class="main-chat-footer-opNormal">
                <el-popover placement="top-start" :width="790" trigger="hover" ref="popRef" v-model="popnor">
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
                <icon-svg type="pk-deletelogs" class="iconsvg w20 h20"></icon-svg>
              </div>
              <div class="main-chat-footer-operation">
                <el-dropdown class="footer-font" popper-class="dropDownStyle" trigger="click" placement="top">
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
                <icon-svg type="pk-downloadlogs" class="iconsvg w20 h20"></icon-svg>
              </div>

              <div class="main-chat-footer-operation hide" @click="shareLogs">
                <icon-svg type="pk-sharelogs" class="iconsvg w20 h20"></icon-svg>
              </div>

              <div class="main-chat-footer-opWeb">
                {{ t('page.qa.main.footer.web') }}
                <el-switch v-model="openWeb" />
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
  </div>
</template>
<script lang="ts" setup>
import { computed, reactive, ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from "vue-i18n";
import { ElForm, ElMessage, ElMessageBox, ElPopover } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import IconSvg from "@/components/IconSvg";
import { QAParamsType, QANormalParamsType } from './data.d';
import { StateType as QAStateType } from '@/store/qa';
import { StateType as GlobalStateType } from '@/store/global';
import ChatList from '@/components/Chat/List.vue'
import ChatHint from '@/components/Chat/Hint.vue'
import ChatMessage from '@/components/Chat/Message.vue'
import { useChat } from '@/composables/useChat';
import useScroll from '@/composables/useScroll';
import usePrompt, { useWelcome } from '@/composables/usePrompt';
import { replaceDate } from '@/utils/date';
import { adjustInputFocus, adjustInputBlur, adjustMainRightScroll, eventMainRightScroll, removeEventMainScroll } from '@/utils/layout';
import { putQA, chatLLM, getQAList, getNormalData, addNormalData, updateNormalData, deleteNormalData, promptList as queryPrompt, getLLM, clearLLM, stopLLM } from './service';
import { querySpeechList as queryWelcome } from '@/views/organizes/prompt/service';

const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat();
const { scrollbarRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll();

let abortController = new AbortController();
let stopId = ""
let freetalkId = 0

const router = useRouter();
const { currentRoute } = router;
const store = useStore<{ pk_qa: QAStateType, global: GlobalStateType }>();
const { locale, t } = useI18n();
store.commit('global/setMenuEnable', true)

const pageLoading = ref(true);
const openWeb = ref(false);
const input = ref('')
const useContextOrNot = ref(false)
const promptList = ref([
  {
    icon: '/images/general-story.svg',
    title: '生成故事', description: '根据你的内容帮你生成一篇故事', prompt: '根据你的内容帮你生成一篇故事'
  }, {
    icon: '/images/general-notify.svg', title: '写邮件', description: '根据你的内容帮你发送一份文件', prompt: '根据你的内容帮你发送一份文件'
  }, {
    icon: '/images/general-code.svg', title: '生成代码', description: '根据你的内容帮你生成一串代码', prompt: '根据你的内容帮你生成一串代码'
  }, {
    icon: '/images/general-daily.svg', title: '写文章', description: '根据你的内容帮你写一篇文章', prompt: '根据你的内容帮你写一篇文章'
  }
])
const welcome = ref({
  'title': t('page.qa.main.nodata.title'),
  'subtitle': t('page.qa.main.nodata.detail'),
  'hint': t('page.qa.main.nodata.hint')
})
const normalData = ref<QANormalParamsType[]>([])
const dialogNormalShow = ref(false)
const normal = reactive<QANormalParamsType>({
  id: 0, content: ''
})
const normalForm = ref<typeof ElForm>()
const noMoreData = ref(false)
const llmLoading = ref(false)
const font = ref(14)
const popRef = ref<typeof ElPopover | null>(null)
const prompt = ref('') // 消息输入框
const inputRef = ref<HTMLElement | null>(null) // 消息输入框
const buttonStatus = ref('prompt') // 按钮状态
const buttonDisabled = computed(() => {
  return buttonStatus.value === 'prompting' || !prompt.value || prompt.value.length === 0
}) // 按钮是否禁用
const uuid = computed((): number | null => {
  const active = store.state.pk_qa.active
  return active
})
const history = computed(() => store.state.pk_qa.history)

// 消息列表
const chats = computed(() => {
  const history = store.state.pk_qa.history.find(item => item.uuid === uuid.value)
  if (history) {
    return history.chats
  }

  return store.state.pk_qa.chats
})

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
  const history = store.state.pk_document.history.find(item => item.uuid === null)
  if (history) {
    return
  }
  await handleStop()
  store.commit('pk_qa/addHistory', { uuid: null, title: 'New Chat', isEdit: false, createdAt: replaceDate(new Date()) })
  store.commit('pk_qa/saveActive', { uuid: null })
  store.commit('pk_qa/saveHistory', { uuid: null })
  await nextTick()
  adjustMainRightScroll()
}

// 发送消息
const handlePrompt = async (it) => {
  prompt.value = it.prompt
  onConversation(false, {}, true)
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
const pushHistoryStore = (qa: any) => {
  store.commit('pk_qa/updateHistory', { type: 'updateId', uuid: uuid.value, id: qa.id, name: qa.name })
  store.commit('pk_qa/saveActive', { uuid: qa.id })
}
let lastText = ''
const fetchChatWithLLM = async (lastText, message, index, options) => {
  const res = await chatLLM({
    sessionId: uuid.value,
    query: message,
    webSearch: openWeb.value,
    webCounts: 8,
    maxNewTokens: 2048,
    prompt: '',
    ...options
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
    const { id, conversationId, urls } = data
    let urlsJson = []
    try {
      if (urls && openWeb.value) {
        urlsJson = JSON.parse(urls)
      }
    } catch (e) {
      console.error(e)
    }
    store.commit('pk_qa/saveHistory', { uuid: uuid.value })
    const prompt = options.prompt || message
    updateChatSome(uuid.value, chats.value.length - 1, { id, prompt, conversationId, urls: urlsJson, loading: false })
    if (uuid.value) {
      putQA({ id: uuid.value, })
    }
    scrollToBottomIfAtBottom()
    setTimeout(() => { scrollToBottom() }, 400)
    return
  }
  scrollToBottomIfAtBottom()
  buttonStatus.value = 'prompt'
  updateChatSome(uuid.value, index, { loading: false })
}

const onConversation = async (regenerateOrNot = false, chat = null, promptOrNot = false) => {
  let message = prompt.value
  if (regenerateOrNot) {
    message = chat?.prompt ?? ''
  }
  const history: any = []
  if (useContextOrNot.value) {
    for (let i = 0; i < chats.value.length; i += 2) {
      history.push(
        [
          chats.value[i].text,
          chats.value[i + 1].text.split('\n\n数据来源：\n\n')[0]
        ]
      )
    }
  }

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
  options.temperature = 0.7
  try {
    lastText = ''
    freetalkId = 0
    if (promptOrNot) {
      options.prompt = message
      message = ''
    }
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

  const prompted = chat?.prompted ?? false
  if (prompted) {
    handlePrompt(chat)
    return
  }
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

  options.temperature = 0.7
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
  store.commit('pk_qa/deleteChat', index)
}

const handleEnter = () => {
  handleSubmit()
}

const handleInput = () => {

}

const stop = async (chat) => {
  const { uuid } = chat
  setTimeout(() => adjustMainRightScroll(), 0)
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
    store.commit('pk_qa/clearChatByUuid', { uuid: uuid.value })
    ElMessage.success(t('page.qa.main.operation.successMessageLogs'))
    await nextTick()
    adjustMainRightScroll()
  }).catch(() => {
    ElMessage.error(t('page.qa.main.operation.cancelMessageLogs'))
  })
}

const fontSelect = (ft: number) => {
  font.value = ft
  if (typeof ft === 'number') {
    document.documentElement.style.setProperty('--text-preview', ft + 'px')
    ElMessage.success(t('page.qa.main.operation.successMessageFont'))
  }
}

const downloadLogs = async () => {
}

const shareLogs = async () => {
}

const loadPrompt = async (defaultLang) => {
  const res = await queryPrompt({ language: defaultLang })
  if (res && res.data && res.data.length > 0) {
    promptList.value = res.data.map(it => {
      it.prompt = it.content
      return it
    })
  }
}

const loadWelcome = async (defaultLang) => {
  const res = await queryWelcome({ scope: 1, language: defaultLang })
  if (res && res.data.length > 0) {
    welcome.value = res.data[0]
    welcome.value.hint = welcome.value.hint || t('page.qa.main.nodata.hint')
  } else {
    welcome.value = {
      title: t('page.qa.main.nodata.title'),
      subtitle: t('page.qa.main.nodata.detail'),
      hint: t('page.qa.main.nodata.hint')
    }
  }
}

const loadHistory = async () => {
  const res = await getQAList({ scope: 1 })
  if (res && res.data && res.data.length > 0) {
    const history = res.data.map(item => {
      return {
        uuid: item.id,
        title: item.name,
        isEdit: false,
        createdAt: item.updateTime,
        chats: []
      }
    })
    store.commit('pk_qa/loadHistory', history)
  }
}

const loadNormalData = async () => {
  const res = await getNormalData()
  if (res && res.data && res.data.length >= 0) {
    normalData.value = res.data
  }
}

const loadInit = async (chat) => {
  pageLoading.value = true
  await handleStop()
  store.commit('pk_qa/saveActive', chat)
  noMoreData.value = false
  await loadLLM()
  pageLoading.value = false
  await nextTick()
  adjustMainRightScroll()
  removeScroll()
  injectScroll()
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
      let urls = []
      try {
        urls = JSON.parse(item.urls)
      } catch (error) {
        console.error(error)
      }
      data.push({
        createdAt: item.createTime,
        id: 0,
        text: item.query || item.prompt,
        owner: 'me',
        error: false,
        loading: false,
        like: item.score === 1,
        unlike: item.score === 2,
        feedback: item.comment,
        prompt: item.prompt,
        conversationId: item.conversationId,
      })
      data.push({
        createdAt: item.createTime,
        id: item.id,
        text: item.answer,
        owner: 'llm',
        error: false,
        loading: false,
        prompted: !!item.query,
        like: item.score === 1,
        unlike: item.score === 2,
        feedback: item.comment,
        prompt: item.query || item.prompt,
        urls: urls,
        conversationId: item.conversationId,
      })
    }
    if (type === 'update') {
      store.commit('pk_qa/updateChatsByUuid', { uuid: uuid.value, data })
    } else {
      store.commit('pk_qa/addChatsByUuid', { uuid: uuid.value, data })
    }
  }
  if (res && res.data.length < 5) {
    noMoreData.value = true
  }
  llmLoading.value = false
  scrollToBottom()
}

const onDocumentScroll = async (e) => {
  const scrollTop = e.target.scrollTop || e.target.documentElement.scrollTop || e.target.body.scrollTop

  if (scrollTop <= 40 && !noMoreData.value) {
    await loadLLM('update')
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
  window.document.removeEventListener('scroll', onDocumentScroll)
  scrollbarRef.value?.wrapRef.removeEventListener('scroll', onScroll)
}

const { defaultLang } = usePrompt(loadPrompt);
const { defaultLang: lang } = useWelcome(loadWelcome);
onMounted(async () => {
  await loadHistory()
  await loadNormalData()
  pageLoading.value = false
  if (uuid.value) {
    await loadLLM('add')
  }
  await loadPrompt(defaultLang.value)
  await loadWelcome(lang.value)
  injectScroll()
  scrollToBottom()
  adjustMainRightScroll()
  eventMainRightScroll()
  inputRef.value?.focus()
})

onUnmounted(() => {
  removeEventMainScroll()
  removeScroll()
  if (buttonStatus.value === 'prompting') {
    abortController.abort()
  }
})
</script>
<style scoped>
.qa-header::v-deep(.el-input__wrapper) {
  border-radius: 1.5rem;
  background: var(--theme-bg-colorSpan);
}

.qa-header::v-deep(.el-input__inner) {
  height: fit-content;
}

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
@import "@/assets/css/chat/reset.scss";

.w20 {
  width: 1.25rem;
}

.h20 {
  height: 1.25rem;
}

.main {
  .left-chat {

    .qa-header {

      &-title {}

      &-input {}

    }

    .qa-main {

      &-create-button {}

      .qa-main-list {}
    }
  }

  .main-chat {
    width: 100%;
    border-radius: 1rem;
    background-color: #FFF;
    overflow: hidden;
    overflow-y: auto;
    display: flex;
    justify-content: center;

    &-content {
      margin-left: 1.25rem;
      display: flex;
      flex-direction: column;

      .main-chat-nodata {

        &-title {}

        &-detail {}

        &-hint {}
      }

      .main-chat-message {

        &-loading {}
      }

      .main-chat-footer {

        &-op {}

        &-input {
          margin-top: 0.625rem;
          display: flex;
          height: auto;
          border-radius: 0.5rem;
          border: 0.0625rem solid var(--theme-color-blur);

          .main-chat-footer-button {}
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
