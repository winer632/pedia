<template>
  <div class="chat-message" :class="owner === 'me' ? 'reverse' : ''">
    <div class="chat-message-header">
      <img :src="props.owner === 'me' ? '/images/GroupQ.png' : '/images/GroupA.png'" width="40" height="40" />
    </div>
    <div class="chat-message-body">
      <div class="chat-message-body-text" :class="owner !== 'me' ? 'chat-message-body-pytext' : ''">
        <div class="this-knowledge this-qaknowledge" v-if="qaKnow.knowledge_base && props.usedQA">
          <el-tag type="primary"><icon-svg type="pk-knowQA" class="qa-icon"></icon-svg>{{ qaKnow.knowledge_base
            }}</el-tag>
        </div>
        <template v-else>
          <div class="this-doc" v-if="docThis && docId && owner !== 'me'">
            <el-tag type="primary">{{ docName }}</el-tag>
          </div>
          <template v-else-if="knowledgeThis.length && id && owner !== 'me'">
            <div class="this-knowledge">
              <el-tag type="primary" v-for="item in knowledgeThis" :key="item">{{ item }}</el-tag>
            </div>
          </template>
        </template>
        <ChatText ref="textRef" :owner="owner" :error="error" :text="reText" :loading="loading" :as-raw-text="asRawText"
          :UUID="id" :activeIndex="activeIndex" :activeId="activeId" @handleChunk="handleChunk" />
        <div v-if="(knowledgesBy && knowledgesBy.length === 0 || docThis) && docs.length > 0" class="this-docs">
          <div class="docs-list" v-for="(item, index) in docs" :key="index">
            <template v-if="!docThis">
              <div class="doc-refer" :class="{ active: activeIndex === index }">
                <div v-if="item.knowledge_base" class="doc-knowledge">
                  {{ item.knowledge_base }}
                </div>
                <el-tooltip :content="item.doc_name" effect="light" placement="top-start">
                  <a href="javascript:;" @click="handleDoc(item, index)" class="name">{{ item.doc_name }}</a>
                </el-tooltip>
              </div>
            </template>
            <el-tag class="chunk-index" :class="{ active: activeId === id_index && activeIndex === index }"
              type="primary" v-for="(id, id_index) in item.chunks" :key="id.chunk_id"
              @click="handleChunk(index, id_index)">[ {{ id.index
              }} ]</el-tag>
          </div>
        </div>
        <template v-if="!props.usedQA">
          <div v-if="!knowledgeThis.length && id && owner !== 'me'" class="chat-message-knowledge">
            <div class="knowledge-list" v-for="(k, index) in knowledgesBy" :key="index">
              <el-button v-if="k.knowledgeId !== ''" :type="k.knowledgeId === know?.id ? 'primary' : 'default'"
                :disabled="k.disabled" @click="handleKnowledge(k)">{{ k.knowledgeName }}</el-button>
            </div>
          </div>
        </template>
        <template v-else-if="qaKnow.doc_name">
          <div class="this-docs">
            <div class="docs-list">
              <div class="doc-refer">
                <el-tooltip :content="qaKnow.doc_name" effect="light" placement="top-start">
                  {{ qaKnow.doc_name }}
                </el-tooltip>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-if="id" class="chat-message-footer">
        <template v-if="props.owner === 'me' || knowledgesBy[0]?.knowledgeId === '' || knowledgeId === 'All'">
        </template>
        <template v-else>
          <el-button type="text" @click="like">
            <template #default>
              <icon-svg v-if="!localLike" type="pk-like" class="wh18 hover"></icon-svg>
              <icon-svg v-else type="pk-liked" class="wh18 hover"></icon-svg>
            </template>
          </el-button>
          <el-button type="text" @click="unlike">
            <template #default>
              <icon-svg v-if="!localUnlike" type="pk-unlike" class="wh18 hover"></icon-svg>
              <icon-svg v-else type="pk-unliked" class="wh18 hover"></icon-svg>
            </template>
          </el-button>
          <el-button v-if="!localFeedback" type="text" @click="feedback">
            <template #default>
              <icon-svg type="pk-feedback" class="wh18 hover"></icon-svg>
            </template>
          </el-button>
          <el-button type="text" @click="handleSelect('clipboard')">
            <template #default>
              <icon-svg v-if="!localCopied" type="pk-copy" class="wh18 hover"></icon-svg>
              <icon-svg v-else type="pk-copied" class="wh18 hover"></icon-svg>
            </template>
          </el-button>
          <div class="chat-message-footer-right">
            <div class="chat-message-footer-rightr">
              <el-button type="text" @click="handleRegenerate">{{ t('page.qa.message.regenerate') }}</el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <el-dialog v-model="dialogFeedbackShow" :title="feedbackTitle" width="25rem">
      <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackRef">
        <el-form-item>
          <span class="span" v-for="text in defaultTextList" :key="text" @click="defaultText(text)">{{ text }}</span>
        </el-form-item>
        <el-form-item label="" props="value">
          <el-input v-model="feedbackForm.value" type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFeedbackShow = false">{{ t('page.qa.main.cancelButton') }}</el-button>
          <el-button type="primary" @click="feedbackSubmit">{{ t('page.qa.main.submitButton') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, reactive, defineProps, defineEmits, watch, onMounted } from 'vue'
import { ElForm, ElButton, ElMessage } from 'element-plus'
import ChatText from './Text.vue'
import { copyToClip } from '@/utils/clipboard'
import { queryKnowledge, query as queryDocument, putLike, putUnlike, putFeedback, putAsText } from '@/views/knowledge/service'
import { useI18n } from 'vue-i18n'
import IconSvg from '@/components/IconSvg'
import { StateType as KnowledgeStateType } from '@/store/knowledge'
import { useStore } from "vuex"

const { t } = useI18n()
const store = useStore<{ pk_knowledge: KnowledgeStateType }>();

interface Props {
  id?: number;
  createdAt?: string
  text?: string
  owner?: string
  error?: boolean
  loading?: boolean
  like?: boolean
  unlike?: boolean
  feedback?: boolean
  usedQA?: boolean
  topk?: string
  docId?: string
  docName?: string
  knowledgeId?: string
  knowledgeName?: string
  items?: string
  knowledges?: string
  know: any
  knowList: any[]
}

interface Emits {
  (ev: 'handleChun', chunk: number): void
  (ev: 'knowledgeThis'): void
  (ev: 'regenerate'): void
  (ev: 'delete'): void
  (ev: 'like', id: number): void
  (ev: 'unlike', id: number): void
  (ev: 'feedback', id: number, payload: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const asRawText = ref(props.owner === 'me')
const messageRef = ref<HTMLElement | null>(null)
const dialogFeedbackShow = ref(false)
const feedbackTitle = ref(t('page.qa.message.feedback'))
const defaultTextList = ref(t('page.qa.message.feedbackList').split(','))
const feedbackRef = ref<typeof ElForm | null>(null)
const feedbackForm = reactive({
  value: ''
})
const activeIndex = ref(-1)
const activeId = ref(-1)

const Uncertain = {
  knowledgeId: '',
  knowledgeName: 'uncertain',
  disabled: false
}
const feedbackRules = reactive({
  value: [{ required: true, message: t('page.qa.message.feedbackPlaceholder'), trigger: 'blur' }]
})

const chunkArray = computed(() => {
  const match = props.text?.match(/(\[)ref_\d+(\])/g)
  if (match) {
    return [...new Set(match)]
  }
  const matchN = props.text?.match(/chunk id \d+/g)
  if (matchN) {
    return [...new Set(matchN)]
  }

  return []
})
const chunkText = computed(() => {
  return chunkArray.value.map(item => {
    return Number(item.replaceAll(/[^0-9]/ig, ''))
  })
})
const qaKnow = computed(() => {
  if (props.usedQA) {
    if (JSONTopk.value.length > 0) {
      return JSONTopk.value[0]
    }
  }
  return {}
})
const JSONTopk = computed(() => {
  try {
    if (props.topk) {
      return Object.values(JSON.parse(props.topk))
    }
  } catch (e) {
    console.error(e)
  }
  return []
})
const JSONItems = computed(() => {
  try {
    if (props.items) {
      return JSON.parse(props.items)
    }
  } catch (e) {
    console.error(e)
  }
  return []
})
const docs = computed(() => {
  if (JSONTopk.value.length === 0) return []
  const chunks = chunkText.value.map(item => {
    return JSONTopk.value[item - 1] || null
  })
  const merge = {}
  let index = 1;
  for (let i = 0; i < chunkText.value.length; i++) {
    if (!chunks[i]) continue
    const doc_id = chunks[i].doc_id
    const knowledge_base = chunks[i].knowledge_base
    if (merge[doc_id]) {
      merge[doc_id].knowledge_base = merge[doc_id].knowledge_base.includes(knowledge_base) ? merge[doc_id].knowledge_base : merge[doc_id].knowledge_base + '/' + knowledge_base
      merge[doc_id].ref = merge[doc_id].ref + chunkText.value[i] + '|'
      merge[doc_id].chunks.push({ index, chunk_id: chunks[i].chunk_id, text: chunks[i].text })
    } else {
      merge[doc_id] = { ...chunks[i], chunks: [{ index, chunk_id: chunks[i].chunk_id, text: chunks[i].text }], ref: chunkText.value[i] + '|' }
      merge[doc_id].knowledge_base = knowledge_base || ''
    }
    index++
  }
  return Object.values(merge)
})

const reText = computed(() => {
  let text = props.text?.replace(/<br\/>|<br>/g, '\n') || t('page.qa.answer.error')
  const match = text.match(/(\n.*\[\d+\]+.*$)/)
  if (match && match.length > 0) {
    text = text.replace(match[0], '')
  }
  for (let index = 0; index < docs.value.length; index++) {
    const chunks = docs.value[index].chunks
    const ref = docs.value[index].ref.split('|')
    const title = (docs.value[index].knowledge_base || '') + ': ' + (docs.value[index].doc_name || '')
    for (let r = 0; r < chunks.length; r++) {
      const id_index = chunks[r].index
      text = text.replaceAll(`[ref_${ref[r]}]`, `<span class="el-index" data-title="${title}" data-id="${index}" data-index-id="${r}">[ ${id_index} ]</span>`)
    }
  }
  return text.replace(/\[ref_\d+\]/g, '')
})
const rawText = computed(() => {
  let text = props.text?.replace(/<br\/>|<br>/g, '\n') || t('page.qa.answer.error')
  return text.replace(/\[ref_\d+\]/g, '')
})
const localLike = computed(() => props.like)
const localUnlike = computed(() => props.unlike)
const localFeedback = computed(() => props.feedback)
const localCopied = computed(() => false)

const knowledgeThis = computed(() => {
  if (props?.knowledgeName && props?.knowledgeName.length > 0) {
    const knowledgeNames = props.knowledgeName.split(',').filter(item => item)
    return knowledgeNames
  }

  return []
})

const knowledgesBy = computed(() => {
  if (props?.knowledges && props.knowledges.length > 0) {
    let JSONKnowledges = []
    try {
      JSONKnowledges = JSON.parse(props.knowledges)
    } catch (e) {
      console.error(e)
    }
    if (JSONKnowledges.length > 0) {
      return JSONKnowledges.map((item) => {
        if (item.knowledge_id === '') {
          return Uncertain
        }
        return {
          knowledgeId: item.knowledge_id,
          knowledgeName: item.knowledge_name,
          disabled: props.knowList?.find(it => it.knowledgeId === item.knowledge_id) ? false : true
        }
      }).filter(item => item.knowledgeId !== '')
    }
  }

  if (docs.value.length > 0 || docThis.value || knowledgeThis.value.length) return []

  return [Uncertain]
})

const docThis: any = computed(() => props.docName)

const handleDocThis = async () => {
  const res = await queryDocument(props.docId)
  store.commit('pk_knowledge/changePdfState', {
    docId: res.data.docId,
    docName: res.data.docName,
    openPreview: true,
    pdfUrl: res.data.pdfFile,
    sourceFile: res.data.sourceFile,
    chunkFile: res.data.chunkFile
  })
}

const documentDelete = 'The document has been unpublished or deleted'
const handleDoc = async (doc, index) => {
  if (doc.doc_id) {
    try {
      if (props.knowledgeId) {
        const id = findKnowIdWith(doc)
        if (!id) {
          ElMessage.error('This document is not available in the knowledge base.')
          return
        }
        const know = await queryKnowledge({ id })
        if (know && ~~know.code === 200) {
          const documents = know.data?.knowledgeDocuments
          let find = false
          if (documents && documents.length > 0) {
            documents.forEach(item => {
              if (item.documentId === doc.doc_id) {
                find = true
              }
            })
          }
          if (!find) {
            ElMessage.error('This document is not available in the knowledge base.')
            return
          }
        }
      }
      const res = await queryDocument(doc.doc_id)
      if (res && ~~res.code !== 200) {
        ElMessage.error(documentDelete)
      } else if (res && res.data) {
        store.commit('pk_knowledge/changeUrlState', {
          docId: doc.doc_id,
          docName: doc.doc_name,
          knowledgeId: findKnowIdWith(doc),
          openPreview: true,
          url: res.data.sourceFile,
          sourceFile: res.data.sourceFile,
          chunkFile: res.data.chunkFile
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  activeIndex.value = ~~index
}

const handleChunk = async (index: number, id_index: number) => {
  const chunk: any = docs.value[index]
  const idIndex: any = chunk.chunks[id_index]
  if (chunk.doc_id) {
    if (props.knowledgeId) {
      const id = findKnowIdWith(chunk)
      if (!id) {
        ElMessage.error('This document is not available in the knowledge base.')
        return
      }
      const know = await queryKnowledge({ id })
      if (know && ~~know.code === 200) {
        const documents = know.data?.knowledgeDocuments
        let find = false
        if (documents && documents.length > 0) {
          documents.forEach(item => {
            if (item.documentId === chunk.doc_id) {
              find = true
            }
          })
        }
        if (!find) {
          ElMessage.error('This document is not available in the knowledge base.')
          return
        }
      }
    }
    const res = await queryDocument(chunk.doc_id)
    if (res && ~~res.code !== 200) {
      ElMessage.error(documentDelete)
    } else if (res && res.data) {
      store.commit('pk_knowledge/changeUrlState', {
        docId: chunk.doc_id,
        docName: chunk.doc_name,
        chunkId: idIndex.chunk_id,
        knowledgeId: findKnowIdWith(chunk),
        openPreview: true,
        url: res.data.sourceFile,
        sourceFile: res.data.sourceFile,
        chunkFile: res.data.chunkFile
      })
      chunk.chunk_id = idIndex.chunk_id
      chunk.text = idIndex.text
      emit('handleChun', chunk)
    }
  }
  activeIndex.value = ~~index
  activeId.value = ~~id_index
}

const findKnowIdWith = (chunk) => {
  const knowledgeNames = props.knowledgeName?.split(',')
  const knowledgeIds = props.knowledgeId?.split(',')
  const knowledge_base = chunk.knowledge_base.split('/')[0]
  const findIndex = knowledgeNames?.findIndex(name => name === knowledge_base)
  if (findIndex === undefined || findIndex === -1) {
    return undefined
  }
  return knowledgeIds && knowledgeIds[findIndex]
}

const like = async () => {
  if (props.id && !props.like) {
    await putLike({ id: props.id, score: 1 })
    emit('like', props.id)
    ElMessage.success(t('page.qa.main.likeSuccess'))
  }
}

const unlike = async () => {
  if (props.id && !props.unlike) {
    await putUnlike({ id: props.id, score: 2 })
    emit('unlike', props.id)
    ElMessage.success(t('page.qa.main.globalSuccess'))
  }
}

const feedback = async () => {
  if (props.id && !props.feedback) {
    dialogFeedbackShow.value = true
  }
  feedbackForm.value = ''
}

const feedbackSubmit = async () => {
  try {
    const valid = feedbackRef.value?.validate()
    if (!valid) return
    await putFeedback({ id: props.id, comment: feedbackForm.value })
    emit('feedback', props.id || 0, feedbackForm.value)
    ElMessage.success(t('page.qa.main.submitSuccess'))
    dialogFeedbackShow.value = false
  } catch (error) {
    dialogFeedbackShow.value = false
    console.log(error)
  }
}

const asText = async () => {
  asRawText.value = !asRawText.value
}

const defaultText = (text: string) => {
  feedbackForm.value = text
}

const handleSelect = (key: 'clipboard' | 'delete' | 'asText') => {
  switch (key) {
    case 'clipboard':
      handleClipboard()
      break
    case 'delete':
      emit('delete')
      break
    case 'asText':
      asRawText.value = !asRawText.value
      break
  }
}

const handleKnowledge = (knowledge: any) => {
  console.log(knowledge)
  emit('knowledgeThis', knowledge, props.id)
}

const handleRegenerate = () => {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}

const handleClipboard = async () => {
  try {
    await copyToClip(rawText.value || '')
    ElMessage.success(t('page.qa.main.copySuccess'))
  } catch (error) {
    ElMessage.error(t('page.qa.main.copyError'))
  }
}

onMounted(async () => {
})

watch(() => props.docId, async () => {
})

</script>
<style lang="scss" scoped>
::v-deep(.el-textarea__inner) {
  color: var(--theme-color-text);
}

.chat-message {
  display: flex;
  margin-top: 0.625rem;
  gap: 0.625rem;

  &-header {
    display: flex;
  }

  &-body {
    display: flex;
    max-width: 38.875rem;
    flex-direction: column;
    overflow: hidden;

    .chat-message-footer {
      display: flex;
      gap: 0.625rem;

      ::v-deep(.el-button) {
        margin-left: 0;
      }

      &-right {
        width: 100%;

        .chat-message-footer-rightr {
          ::v-deep(.el-button) {
            color: var(--theme-color-huge);
            font-size: 0.75rem;
            font-style: normal;
            font-weight: 400;
          }

          color: var(--theme-color-huge);
          display: flex;
          justify-content: flex-end;
        }
      }
    }

    .this-doc {
      margin: 0.625rem 0.625rem 0 0.625rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      ::v-deep(.el-tag) {
        background: var(--theme-bg-colorChunk);
        color: var(--theme-color-text);
      }
    }

    .this-knowledge {
      margin: 0.625rem 0.625rem 0 0.625rem;
      display: flex;
      flex-flow: wrap;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      gap: 0.625rem;

      ::v-deep(.el-tag) {
        background: var(--theme-bg-colorChunk);
        color: var(--theme-color-text);
      }
    }

    .this-qaknowledge {
      .qa-icon {
        margin-right: 0.5rem;
      }

      ::v-deep(.el-tag) {
        background: var(--theme-bg-colorQA);
      }
    }

    .this-docs {
      margin-bottom: 0.625rem;
      display: flex;
      flex-flow: column wrap;

      .docs-list {
        margin-top: 0.625rem;
        margin-left: 0.625rem;
        display: flex;
        flex-flow: row nowrap;
        color: var(--theme-color-huge);
        max-width: 37.5625rem;
        align-items: center;
        justify-content: flex-start;
        font-size: 0.75rem;
        font-weight: 400;
        gap: 0.625rem;
        overflow: hidden;

        .doc-refer {
          display: flex;
          padding: 0.0625rem;
          gap: 0.625rem;
          overflow: hidden;
        }

        .doc-refer.active {
          background: var(--theme-bg-enableHive);
          font-weight: 600;
        }

        .index {
          display: flex;
          width: 0.5rem;
          height: 1.25rem;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
        }

        .doc-knowledge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: fit-content;
          cursor: pointer;

          &::after {
            content: ':';
          }
        }

        .name {
          width: fit-content;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          border-radius: 0.125rem;
          white-space: nowrap;

          &:hover {
            color: var(--theme-color-huge);
          }
        }

        .chunk-index {
          cursor: pointer;
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
          color: var(--theme-color-huge);
          border-radius: 0.125rem;
          background: var(--theme-color-blur);
          padding: 0 11px;
        }

        .chunk-index.active {
          background: var(--theme-bg-enableHive);
          font-weight: 600;
        }
      }
    }

    .chat-message-knowledge {
      margin-left: 0.625rem;
      margin-bottom: 0.625rem;
      display: flex;
      flex-flow: row wrap;
      gap: 0.625rem;

      .knowledge-list {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        overflow: hidden;
        gap: 0.25rem;

        ::v-deep(.el-button) {
          margin-left: 0;
          margin-right: 0.5rem;
        overflow: hidden;

          span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    &-pytext {

      background: var(--theme-bg-colorSpan);
      border-radius: 0 0.625rem 0.625rem 0.625rem;

      .this {
        padding: 0.0625rem;
      }
    }

  }

  .wh18 {
    width: 1.125rem;
    height: 1.125rem;
  }

  .md16 {
    margin-bottom: 0.625rem;
  }

  .hover {

    &:hover {
      color: var(--theme-color-huge);
      background: var(--theme-bg-colorHover);
    }
  }

  .span {
    margin-top: 0.375rem;
    margin-right: 1.25rem;
    color: var(--theme-color-font);
    border-radius: 0.25rem;
    background: var(--theme-bg-colorSpan);
    padding: 0.375rem 0.375rem;

    &:hover {
      color: var(--theme-color-huge);
      background: var(--theme-bg-colorHover);
    }
  }

}

.chat-message.reverse {
  flex-direction: row-reverse;
}
</style>
