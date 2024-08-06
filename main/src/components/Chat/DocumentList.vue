<template>
  <el-scrollbar>
    <div class="list-chat">
      <template v-if="!lists.length">
        <div class="list-chat-nodata">
          <img :src="prefix + 'images/nodata.svg'" width="176px" height="115px" />
          {{ t('page.document.list.nodata') }}
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) in lists" :key="index">
          <a class="list-chat-item" :class="isActive(item.uuid) && 'active'" @click="handleSelect(item)">
            <div v-if="!item.isEdit" class="list-chat-item-desc">
              <div class="list-chat-item-icon">
                <icon-svg :type="iconType(item)" class="w24 h24"></icon-svg>
              </div>
              <div class="list-chat-item-online" :class="isError(item) ? 'loading' : ''">
                <div class="list-chat-item-onlineT">
                  <el-tooltip :content="item.name" effect="light" placement="bottom-start" :show-arrow="false">
                    {{ item.name }}
                  </el-tooltip>
                </div>
                <div v-if="!isError(item)" class="list-chat-item-onlineD">
                  {{ item.createdAt }}
                </div>
                <div v-else class="list-chat-item-onlineD">
                  <el-tooltip :content="title(item)" effect="light" placement="bottom-start" :show-arrow="false">
                    <icon-svg type="pk-docerror" class="wh"></icon-svg>
                  </el-tooltip>
                  {{ t('page.document.error.parser-hint') }}
                </div>
              </div>
            </div>
            <div v-else class="list-chat-item-title">
              <div class="list-chat-item-icon">
                <icon-svg :type="iconType(item)" class="w24 h24"></icon-svg>
              </div>
              <div class="list-chat-item-online" :class="isLoading(item) ? 'loading' : ''">
                <div class="list-chat-item-onlineT">
                  <el-input class="input" v-model="item.name" @blur="handleEnter(item, false)"
                    @keypress.enter="handleEnter(item, false)" @keydown.esc="handleCancel(item, false)"
                    :placeholder="t('page.document.list.inputHolder')" />
                </div>
                <div v-if="!isError(item)" class="list-chat-item-onlineD">
                  {{ item.createdAt }}
                </div>
                <div v-else class="list-chat-item-onlineD">
                  <el-tooltip :content="item.name" effect="light" placement="bottom-start" :show-arrow="false">
                    <icon-svg type="pk-docerror" class="wh20"></icon-svg>
                  </el-tooltip>
                  {{ t('page.document.error.parser-hint') }}
                </div>
              </div>
            </div>

            <div v-if="isActive(item.uuid)" class="list-chat-item-op">
              <template v-if="!item.isEdit">
                <el-button class="list-chat-item-opU" @click="handleInput(item, true, $event)">
                  <icon-svg type="pk-edit" class="wh20"></icon-svg>
                </el-button>
                <el-button class="list-chat-item-opD" @click="handleDeleteDebounce(item, $event)">
                  <icon-svg type="pk-delete" class="wh20"></icon-svg>
                </el-button>
              </template>
            </div>
          </a>
        </div>
      </template>
    </div>
  </el-scrollbar>
</template>
<script setup lang="ts">
import { computed, defineProps, defineEmits, onMounted, onUnmounted } from "vue"
import { ElButton, ElScrollbar, ElInput, ElMessageBox, ElMessage } from 'element-plus'
import { debounce } from "@/utils/functions"
import { useI18n } from 'vue-i18n'
import { useStore } from "vuex";
import { getPkTypeWithName } from "@/utils/file";
import { StateType as DocumentStateType } from '@/store/document';
import { postDocument, updateDocument, deleteDocument, postCompare, updateCompare, deleteCompare } from "@/views/document/service";
import IconSvg from '@/components/IconSvg'
import useState from "@/composables/useState";
import { adjustLayoutLeftScroll, eventLayoutLeftScroll, removeEventLeftScroll } from '@/utils/layout'

const { t } = useI18n()
const store = useStore<{ pk_document: DocumentStateType }>();

const props = defineProps<{ filter: string }>()

const { STATE_NEXT } = useState()
interface Emits {
  (ev: 'loadData', obj: { uuid: string }): void
  (ev: 'stopLLM', obj: { uuid: string }): void
}

const emit = defineEmits<Emits>()

const prefix = computed(() => process.env.VUE_APP_PUBLIC_HREF)

const lists = computed(() => {
  const history = store.state.pk_document.history
  if (props.filter) {
    const l = history.filter((item) => {
      return item?.name.includes(props.filter)
    })
    return l
  } else {
    return history
  }
})

const active = computed(() => store.state.pk_document.active)

const handleSelect = async ({ uuid }) => {
  if (isActive(uuid)) {
    return
  }

  if (active.value) {
    store.commit('pk_document/updateHistory', { uuid: active.value, type: 'update', isEdit: false })
  }

  emit('loadData', { uuid })
}

const handleEdit = async ({ uuid, name, conversationType }, isEdit: boolean, event?: MouseEvent) => {
  event?.stopPropagation()
  if (uuid) {
    const updateLocale = conversationType === 'compare' ? updateCompare : updateDocument
    const res = await updateLocale({ id: uuid, docId: uuid, name })
    store.commit('pk_document/updateHistory', { uuid, type: 'update', docName: name, isEdit })
    ElMessage.success(t('page.qa.main.modifySuccess'))
  } else {
    const postLocale = conversationType === 'compare' ? postCompare : postDocument
    const res: any = await postLocale({ name })
    const id: number = res.data.id
    store.commit('pk_document/updateHistory', { uuid: id, type: 'add', isEdit })
    ElMessage.success(t('page.qa.main.createSuccess'))
  }
}

const handleInput = ({ uuid }, isEdit: boolean, event?: MouseEvent) => {
  if (uuid) {
    store.commit('pk_document/updateHistory', { uuid, type: 'update', isEdit })
  }
}

const handleDelete = async ({ uuid, conversationType }, event?: MouseEvent | TouchEvent) => {
  event?.stopPropagation()
  let ids: string[] = []
  if (conversationType !== 'compare') {
    lists.value.forEach(item => {
      if (item.docIds && item.docIds.includes(uuid)) {
        ids.push(item.uuid)
      }
    })
  }
  let hintDetail = t('page.qa.main.deleteHintDetail')
  if (ids.length > 0) {
    hintDetail = t('page.qa.main.deleteHintDocsDetail')
  }
  ElMessageBox.confirm(hintDetail, t('page.qa.main.deleteHint'), {
    confirmButtonText: t('page.qa.main.confirmButton'),
    cancelButtonText: t('page.qa.main.cancelButton'),
    type: t('page.qa.main.deleteType')
  }).then(async () => {
    const deleteLocale = conversationType === 'compare' ? deleteCompare : deleteDocument
    await deleteLocale({ docIds: uuid, ids: uuid })
    emit('stopLLM', { uuid })
    store.commit('pk_document/deleteHistory', { uuid })
    if (conversationType !== 'compare') {
      if (ids && ids.length > 0) {
        await deleteCompare({ ids: ids.join(',') })
      }
      ids.forEach(id => {
        store.commit('pk_document/deleteHistory', { uuid: id })
      })
    }
  }).catch(() => {
  })
}

const iconType = (item: any) => {
  if (item.conversationType === 'compare') return 'pk-compareh'
  return getPkTypeWithName(item.sourceUrl || item.name)
}

const handleDeleteDebounce = debounce(handleDelete, 600)

let cancel = false
let enter = false
const handleEnter = async ({ uuid, name, conversationType }, isEdit: boolean) => {
  if (cancel) {
    cancel = false
    return
  }
  if (enter) return
  enter = true
  await handleEdit({ uuid, name, conversationType }, isEdit)
  enter = false
}

const handleCancel = ({ uuid }, isEdit: boolean) => {
  cancel = true
  if (uuid) {
    store.commit('pk_document/updateHistory', { uuid, type: 'update', isEdit })
  }
}

const title = (item) => {
  if (item.parserState === STATE_NEXT.TOKEN_EXCEED) {
    return t('page.document.preview.error-exceed')
  } else if (item.parserState === STATE_NEXT.TOKEN_LIMIT) {
    return t('page.document.preview.error-zero')
  }
  return t('page.document.preview.error-parser')
}

const isError = (item) => {
  return item.parserState === STATE_NEXT.ERROR || item.parserState === STATE_NEXT.TOKEN_EXCEED || item.parserState === STATE_NEXT.TOKEN_LIMIT
}

const isLoading = (item) => {
  return item.parserState === STATE_NEXT.NOT_READY || item.parserState === STATE_NEXT.START || item.parserState === STATE_NEXT.RUNNING
}

const isActive = (uuid: number) => {
  return active.value === uuid
}

onMounted(() => {
  setTimeout(() => adjustLayoutLeftScroll())
  eventLayoutLeftScroll()
})

onUnmounted(() => {
  removeEventLeftScroll()
})
</script>
<style scoped>
.list-chat-item-op>>>.el-button {
  margin-left: 0;
  padding: 0;
}

.list-chat-item-title>>>.el-button {
  margin-left: 0;
}
</style>
<style lang="scss" scoped>
@import "@/assets/css/chat/list.scss";

.w24 {
  width: 24px;
}

.h24 {
  height: 24px;
}

.list-chat-item-online.loading {
  .list-chat-item-onlineT {
    color: #f11;
  }

  .list-chat-item-onlineD {
    color: #f11;
  }
}

.list-chat-item-desc {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.list-chat-item-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.list-chat-item {
  width: 16rem;
}

.active {
  .list-chat {
    &-item {
      &-online {}

      &-onlineT {
        width: 10.25rem !important;
      }
    }
  }
}
</style>
