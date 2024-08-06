<template>
  <div class="main">
    <div class="main-top">
      <div class="main-nav-back">
        <a-link to="/organize/document">
          {{ t('page.organizes.preview.back') }}
        </a-link>
        <span class="main-nav-title">
          {{ document.name }}
        </span>
        <a @click="openConfirm" class="color-huge mr16">
          Guidelines
        </a>
        <el-button type="primary" @click="confirm">
          {{ t('page.organizes.preview.confirm') }}
        </el-button>
      </div>
    </div>
    <div class="main-preview">
      <div class="main-preview-pdf">
        <div class="main-preview-pdf-tabs">
          <div class="main-preview-pdf-tab">
            <div class="tab-pn" :class="tabP === 'render' ? 'active' : ''" @click="changeTabP('render')">
              {{ t('page.organizes.preview.render') }}
            </div>
            <div class="tab-pn tab-pnp hide" :class="tabP === 'splitP' ? 'active' : ''" @click="changeTabP('splitP')">
              {{ t('page.organizes.preview.splitP') }}
            </div>
          </div>
          <div v-if="tabP === 'splitP'" class="tab-split">
            <div class="tab-md">
              <el-select v-model="splitMethod" @click="handleSplitMethod">
                <el-option v-for="item in splitMethods" :key="item" :label="item" :value="item" />
              </el-select>
            </div>
            <div class="tab-md">
              <el-button type="primary" @click="handleSplitPreview">
                {{ t('page.organizes.preview.splitPreview') }}
              </el-button>
            </div>
          </div>
        </div>
        <div v-show="tabP === 'render'" class="main-preview-pdf-viewer">
          <opener id="pdfPreview" :uuid="uuid" :history="history" :sourceUrl="sourceUrl" />
        </div>
        <div v-show="tabP !== 'render'" class="main-preview-pdf-editor">
          <div class="preview" id="editorSplit">
            <textarea class="none" v-text="splitMarkdown"></textarea>
          </div>
        </div>
      </div>
      <div class="main-preview-editor">
        <div class="preview" id="editor">
          <textarea class="none" v-text="markdown"></textarea>
        </div>
      </div>
    </div>
    <el-dialog v-model="showConfirm" width="50%" title="Guidelines" :close-on-click-modal="false"
      :close-on-press-escape="false" :close-on-click-wrapper="false">
      <div class="preview-guilde">
        <iframe :src="pdfGuilde"></iframe>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
declare global {
  interface Window {
    editormd: any;
    getSelection: () => Selection | null;
  }
}
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import ALink from '@/components/ALink/index.vue'
import Opener from '@/components/Document/Opener.vue'
import { query, verify } from './service'
import { getPdfUrl, getMdFile } from '../../document/service'

import { useI18n } from "vue-i18n";

const route = useRoute()
const router = useRouter()

const { t } = useI18n();

const showConfirm = ref(false)
const uuid = ref("uuid")
const history = ref({})
const sourceUrl = ref('')
const pdfGuilde = computed(() => process.env.VUE_APP_PDF_VIEWER + '?file=' + encodeURIComponent('/preview/Document Verification Guidelines.pdf') + '&pagemode=none')
const openConfirm = () => {
  showConfirm.value = true
}
const docId = router.currentRoute.value.params.id
const splitMethod = ref(t('page.organizes.preview.defaultSplitMethods'))
const splitMethods = ref([t('page.organizes.preview.splitMethods')])
const handleSplitPreview = async () => {
  editorSplit.previewing()
}
const handleSplitMethod = async () => {

}
const document = ref({
  name: '文件'
})
const tabP = ref('render')
const pdfUrl = ref('')
const pdfViewer = computed(() => process.env.VUE_APP_PDF_VIEWER + '?file=' + encodeURIComponent(pdfUrl.value) + '&pagemode=none')

const markdown = ref('')
const splitMarkdown = ref('')
const autoHeight = () => {
  const windHeight = window.document.documentElement.clientHeight - 110;
  editor.height(windHeight)
}
const splitAutoHeight = () => {
  const windHeight = window.document.documentElement.clientHeight - 182;
  editorSplit.height(windHeight)
  editorSplit.state.preview && editorSplit.previewing()
  setTimeout(() => {
    if (!editorSplit.state.preview) {
      editorSplit.previewing()
    }
  }, 600)
}
const loadPdf = () => {
}
const startListen = ref(false)
let editorSplit: any = null
let editor: any = null
let initSplit: boolean = false

const changeTabP = (tanPstr: string) => {
  tabP.value = tanPstr
  if (tanPstr === 'splitP') {
    splitAutoHeight()
    initSplitEditor()
  }
}
const unsetChatMessage = () => {

}
const initSplitEditor = () => {
  editorSplit = window.editormd('editorSplit', {
    path: '/preview/editormd/lib/',
    htmlDecode: 'style,script,iframe',
    watch: false,
    toolbar: true,
    searchReplace: true,
    markdown: splitMarkdown.value,
    placeholder: '',
    toolbarIcons: () => {
      return ['preview']
    },
    onload: () => {
      splitAutoHeight()
    },
    onpreviewing: () => {
      listenSelectText()
    }
  })
}

const listenSelectText = () => {
  if (startListen.value) return
  const preview = editorSplit.preview
  startListen.value = true

  preview.on('mouseup', (event) => {
    const selectTxt = (window as any).getSelection().toString().trim()
    if (selectTxt.length > 0) {
      //
    } else {
      unsetChatMessage()
    }
  })

  window.addEventListener('mousedown', (event: any) => {
    if (event.target.id === 'btnChatMessage' || event.target.id === 'editormd-preview' || event.target.id === 'editormd-preview') {
      //
    } else {
      //
    }
  })
}

window.addEventListener('resize', () => {
  autoHeight()
  splitAutoHeight()
})

const confirm = async () => {
  ElMessageBox.confirm(t("page.organizes.preview.document"), t("page.organizes.preview.titleH"), {
    confirmButtonText: t("page.organizes.docus.buttonSubmit"),
    cancelButtonText: t("page.organizes.docus.buttonCancel"),
    type: 'warning'
  }).then(async () => {
    const markdownContent = editor.getValue()
    await verify({ docId, markdownContent })
    router.push('/organize/document')
  }).catch(() => {
  })
}

const init = () => {
  initSplitEditor()
  editor = window.editormd('editor', {
    path: '/preview/editormd/lib/',
    htmlDecode: 'style,script,iframe',
    watch: false,
    toolbar: true,
    codeFold: true,
    searchReplace: true,
    toolbarIcons: () => {
      return window.editormd.toolbarModes.full.concat(["customIcon"])
    },
    toolbarIconsClass: {
      customIcon: "fa-paste"
    },
    toolbarIconTexts: {
      customIcon: '从草稿箱加载',
    },
    lang: {
      toolbar: {
        customIcon: '从草稿箱加载'
      }
    },
    toolbarHeaders: {
      customIcon: () => {
        editor.CodeAutoSaveGetCache()
      }
    },
    onresize: () => {
    },
    onload: () => {
      window.editormd.loadPlugin('/preview/editormd/lib/plugins/code-auto-save/code-auto-save', () => {
        editor.CodeAutoSave()
      })
      autoHeight()
      loadPdf()
    }
  })
}
onMounted(async () => {
  try {
    if (docId && docId.length > 10) {
      const res = await query(docId)
      if (res && res.data) {
        document.value = res.data
        document.value.name = res.data.docName
        splitMarkdown.value = document.value.markdownContent
        if (document.value.sourceFile) {
          let url = document.value.mdFile
          sourceUrl.value = document.value.sourceFile
          const mdFile = await getMdFile({ url })
          markdown.value = mdFile
        }
      }
    }
  } catch (e) {
    ElMessage.error(e)
  }
  window.document.getElementById('pdfPreview').style.height = window.document.documentElement.clientHeight - 200 + 'px'
  init()
})
</script>
<style lang="scss">
@import "@/assets/css/chat/media.scss";
</style>
<style lang="scss" scoped>
@import "@/assets/css/chat/organize/global.scss";
@import "@/assets/css/chat/media.scss";

.mr16 {
  margin: 0 1rem 0 0;
}

.preview-guilde {
  width: 100%;
  height: 70vh;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}

.hide {
  display: none !important;
}

.main {
  flex: 1;
  overflow: hidden;
  height: auto;
}

.main-top {
  .main-nav-back {
    display: flex;
    align-items: center;
    width: 100%;

    a {
      color: var(--theme-color-detail);
    }
  }

  .main-nav-title {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--theme-color-text);
    font-style: normal;
    font-size: 1.125rem;
    font-weight: 600;
  }
}

.main-preview {
  margin: 0 0.625rem;
  display: flex;
  width: 100%;
  gap: 0.625rem;

  &-pdf {
    display: flex;
    flex-flow: column;
    width: calc(50vw - 2.625rem);
    height: calc(100vh - 6.875rem);
    border-radius: 1rem;
    background: var(--theme-bg-color);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.15);
    flex: 1;

    .main-preview-pdf-tabs {
      display: flex;

      .tab-split {
        margin-right: 1rem;
        flex: 1;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.625rem;

        ::v-deep(.el-select) {
          width: 10rem;
        }
      }
    }

    .main-preview-pdf-tab {
      margin: 0.875rem 1.25rem 0.625rem;
      display: flex;
      align-items: center;
      height: 2.25rem;
      border-radius: 0.25rem;
      border: 0.0625rem solid var(--theme-color-blur);
      background: #FFF;
      padding-left: 0.625rem;
      padding-right: 0.625rem;

      .tab-pn {
        display: flex;
        padding: 0 0.625rem;
        justify-content: center;
        align-items: center;
        height: 1.75rem;
        cursor: pointer;
      }

      .tab-pnp {
        flex: 1;
        padding: 0 0;
      }

      .tab-pn.active {
        color: var(--theme-color-huge);
        border-radius: 0.125rem;
        background: rgba(20, 28, 235, 0.10);
      }
    }

    .main-preview-pdf-tab.active {
      border-radius: 0.125rem;
      background: var(--C-3, rgba(134, 190, 50, 0.20));
      background: var(--C-3, rgba(20, 28, 235, 0.10));
    }

    .main-preview-pdf-viewer {
      width: 100%;
      border-top: 0.0625rem solid var(--theme-color-blur);

      ::v-deep(iframe) {
        height: 70vh;
        width: calc(100% - 10px);
      }

      iframe {
        width: 100%;
        border: 0;
        border-radius: 0 0 1rem 1rem;
      }
    }
  }

  .layout-right-footer {
    padding: 0.75rem 0 0.75rem;
  }

  .none {
    display: none;
  }

  &-editor {
    width: 50vw;
    flex: 1;
    margin-right: 1.25rem;
    border-radius: 1rem;

    .preview {
      width: 100%;
      height: 100%;
      border-radius: 1rem;
      background: #F7F8FA;

    }
  }
}
</style>
