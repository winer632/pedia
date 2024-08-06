<template>
  <el-scrollbar>
    <div class="list-chat">
      <template v-if="!lists.length">
        <div class="list-chat-nodata">
          <img :src="prefix + 'images/nodata.svg'" width="176px" height="115px" />
          {{ t('page.qa.list.nodata') }}
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) in lists" :key="index">
          <a class="list-chat-item" :class="isActive(item.uuid) && 'active'" @click="handleSelect(item)">
            <div v-if="!item.isEdit" class="list-chat-item-online">
              <div class="list-chat-item-onlineT">
                <el-tooltip :content="item.title" effect="light" placement="bottom-start" :show-arrow="false">
                  {{ item.title }}
                </el-tooltip>
              </div>
              <div class="list-chat-item-onlineD">
                {{ item.createdAt }}
              </div>
            </div>
            <div v-else class="list-chat-item-title">
              <div class="list-chat-item-onlineT">
                <el-input class="input" v-model="item.title" @blur="handleEnter(item, false, $event)"
                  @keydown.enter="handleEnter(item, false, $event)" @keydown.esc="handleCancel(item, false)"
                  :placeholder="t('page.qa.list.inputHolder')" />
              </div>
              <div class="list-chat-item-onlineD">
                {{ item.createdAt }}
              </div>
            </div>

            <div v-if="isActive(item.uuid) && item.uuid" class="list-chat-item-op">
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
import { ElButton, ElIcon, ElScrollbar, ElInput, ElMessageBox, ElMessage } from 'element-plus'
import { debounce } from "@/utils/functions"
import { useI18n } from 'vue-i18n'
import IconSvg from "@/components/IconSvg"
import { useStore } from "vuex";
import { StateType as QAStateType } from '@/store/qa';
import { postQA, putQA, deleteQA } from "@/views/qa/service";
import { adjustLayoutLeftScroll, eventLayoutLeftScroll, removeEventLeftScroll } from '@/utils/layout'

const { t } = useI18n()
const store = useStore<{ pk_qa: QAStateType }>();

const props = defineProps<{ filter: string }>()

interface Emits {
  (ev: 'loadData', obj: { uuid: string }): void
  (ev: 'stopLLM', obj: { uuid: string }): void
}

const emit = defineEmits<Emits>()

const prefix = computed(() => process.env.VUE_APP_PUBLIC_HREF)

const lists = computed(() => {
  const history = store.state.pk_qa.history
  if (props.filter) {
    const l = history.filter((item) => {
      return item.title.includes(props.filter)
    })
    return l.filter((item) => { return item.uuid })
  } else {
    return history.filter((item) => { return item.uuid })
  }
})

const active = computed(() => store.state.pk_qa.active)

const handleSelect = async ({ uuid }) => {
  if (isActive(uuid)) {
    return
  }

  if (active.value) {
    store.commit('pk_qa/updateHistory', { uuid: active.value, type: 'update', isEdit: false })
  }

  emit('loadData', { uuid })
}

const handleEdit = async ({ uuid, title }, isEdit: boolean, event?: MouseEvent | TouchEvent) => {
  event?.stopPropagation()
  if (uuid) {
    const res = await putQA({ id: uuid, name: title })
    store.commit('pk_qa/updateHistory', { uuid, type: 'update', title, isEdit })
    ElMessage.success(t('page.qa.main.modifySuccess'))
  } else {
    const res: any = await postQA({ name: title, scope: 1 })
    const id: number = ~~res.data.id
    store.commit('pk_qa/updateHistory', { uuid: id, type: 'add', isEdit, createdAt: res.data.createTime })
    store.commit('pk_qa/saveActive', { uuid: id })
    ElMessage.success(t('page.qa.main.submitSuccess'))
  }
}

const handleInput = ({ uuid }, isEdit: boolean, event?: MouseEvent) => {
  if (uuid) {
    store.commit('pk_qa/updateHistory', { uuid, type: 'update', isEdit })
  }
}

const handleDelete = async ({ uuid }, event?: MouseEvent | TouchEvent) => {
  event?.stopPropagation()
  ElMessageBox.confirm(t('page.qa.main.deleteHintDetail'), t('page.qa.main.deleteHint'), {
    confirmButtonText: t('page.qa.main.confirmButton'),
    cancelButtonText: t('page.qa.main.cancelButton'),
    type: t('page.qa.main.deleteType')
  }).then(async () => {
    await deleteQA({ ids: '' + uuid, scope: 1 })
    emit('stopLLM', { uuid })
    store.commit('pk_qa/deleteHistory', { uuid })
    ElMessage.success(t('page.qa.main.deleteSuccess'))
  }).catch(() => {
  })
}

const handleDeleteDebounce = debounce(handleDelete, 600)

let cancel = false
let enter = false
const handleEnter = async (item, isEdit: boolean, event?: TouchEvent) => {
  if (cancel) {
    cancel = false
    return
  }
  if (enter) return
  enter = true
  await handleEdit(item, isEdit, event)
  enter = false
}

const handleCancel = ({ uuid }, isEdit: boolean) => {
  cancel = true
  if (uuid) {
    store.commit('pk_qa/updateHistory', { uuid, type: 'update', isEdit })
  }
}

const isActive = (uuid: number) => {
  return active.value === uuid
}

onMounted(() => {
  adjustLayoutLeftScroll()
  eventLayoutLeftScroll()
})

onUnmounted(() => {
  removeEventLeftScroll()
})
</script>
<style scoped>
.list-chat-item-title::v-deep(.el-button) {
  margin-left: 0;
}

.list-chat-item-op::v-deep(.el-button) {
  margin-left: 0;
  border: 0;
  padding: 0 10px;
}
</style>
<style scoped lang="scss">
@import "@/assets/css/chat/list.scss";

.w20 {
  width: 1.25rem;
}

.h20 {
  width: 1.25rem;
}

.list-chat {
  .list-chat-nodata {}

  .list-chat-item {

    .list-chat-item-online {

      .list-chat-item-onlineT {}

      .list-chat-item-onlineD {}
    }

    .list-chat-item-title {}
  }

  .list-chat-item.active {

    .list-chat-item-online {

      .list-chat-item-onlineT {
        width: 11.375rem;
      }

      .list-chat-item-onlineD {}
    }

    .list-chat-item-op {

      .list-chat-item-opU {}

      .list-chat-item-opD {}

    }
  }
}
</style>
