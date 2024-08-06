<template>
  <div class="opener">
    <div v-if="docsType !== 'pdf' || history?.conversationType === 'compare'" class="document-header">
      <div v-if="history?.conversationType === 'compare'" class="compare-docs">
        <el-select class="compare-docs-select" v-model="docuId" @change="handleCompareDocsChange">
          <el-option v-for="item in history.docs" :key="item.docId" :label="item.docName"
            :value="item.docId"></el-option>
        </el-select>
      </div>
      <div class="zoom-operation">
        <div class="zoom-in" @click="zoomIn">
          <icon-svg type="pk-zoomin"></icon-svg>
        </div>
        <div class="zoom-out" @click="zoomOut">
          <icon-svg type="pk-zoomout"></icon-svg>
        </div>
      </div>
      <div v-show="false" class="page-operation">
        <div class="prev-page">
        </div>
        <div class="serpate">
          /
        </div>
        <div class="next-page">
        </div>
      </div>
      <div class="download-operation">
        <div class="download" @click="downloadFile">
          <icon-svg type="pk-downloadlogs"></icon-svg>
        </div>
      </div>
    </div>
    <div class="document-opener preview">
      <div v-if="sourceUrlWithURL === ''" class="pdf-loading canvas" v-loading="sourceUrlWithURL === ''"
        :element-loading-text="history?.parserState === 4 ? 'Failed' : 'Loading'"></div>
      <div ref="docxRef" class="docx-preview canvas" v-show="docsType === 'docx'"></div>
      <iframe class="preview canvas" v-if="docsType === 'pdf'" v-loading="pdfLoading" id="pdfPreview"
        :src="pdfViewer"></iframe>
      <div id="textRef" class="text-preview canvas" ref="textRef" v-show="docsType === 'md'">
        <textarea class="hide" v-text="textPreview"></textarea>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, toRefs, defineProps, defineEmits, onUnmounted, defineComponent, PropType, WritableComputedRef } from "vue";
import IconSvg from "@/components/IconSvg";
import { getFileTypeWithName } from "@/utils/file";
import { StateType as DocumentStateType } from '@/store/document';
import useState from '@/composables/useState';
import { getPdfUrl, getMdFile } from '@/views/document/service';
import { renderAsync } from 'docx-preview'
import { getLocale } from "@/utils/i18n";

interface History {
  conversationType: string
  docs: any[]
  parserState: number
}

interface Props {
  uuid: string
  sourceUrl: string
  history: History
  urlStateDocId?: string
}

interface Emits {
  (ev: 'handleCompareDocsChange', statu: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { history } = toRefs(props)
const docuId = ref(props.urlStateDocId)
const sourceUrlWithURL = ref('')
const docsType = computed(() => getFileTypeWithName(props.sourceUrl))
const pdfLoading = ref(false)
const docxRef = ref(null)
const textRef = ref(null)
const textPreview = ref('')
const urlLoading = ref(false)
const pdfViewer = computed(() => process.env.VUE_APP_PDF_VIEWER + '?file=' + encodeURIComponent(sourceUrlWithURL.value) + '&pagemode=none')
const handleCompareDocsChange = async (valu) => {
  let find = history.value?.docs?.find(item => item.docId === valu)
  if (find) {
    emit('handleCompareDocsChange', {
      docId: valu,
      url: find.sourceFile,
      status: find.parserState,
    })
  }
}

let scale = 1

const zoomIn = () => {
  scale = scale + 0.1
  scale = scale > 3 ? 3 : scale
  let url = sourceUrlWithURL.value
  if (getFileTypeWithName(url) === 'md') {
    scale = scale > 1.1 ? 1.1 : scale
  }
  setZoom()
}
const zoomOut = () => {
  scale = scale - 0.1
  scale = scale < 0.1 ? 0.1 : scale
  setZoom()
}
const downloadFile = async () => {
  let url = sourceUrlWithURL.value
  if (getFileTypeWithName(url) === 'md') {
    const data = await getMdFile({ url })
    url = URL.createObjectURL(new Blob([data], { type: 'text/plain' }))
  }
  const a = document.createElement('a')
  a.href = url
  a.download = props.sourceUrl.split('/').pop()
  a.click()
}

const setZoom = () => {
  const zoom = document.querySelector('.preview')
  zoom.style.setProperty('--zoom-scale', scale)
}
onMounted(async () => {
  if (props.uuid && props.sourceUrl) {
    loadSource(props.uuid, props.sourceUrl)
  }
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
let loadTime: number = 1
let editor: any = null

const loadSource = async (uuidTemp: string, url: string) => {
  urlLoading.value = true
  loadTime++
  try {
    sourceUrlWithURL.value = ''
    if (getFileTypeWithName(url) === 'md') {
      const data = await getMdFile({ url })
      if (uuidTemp && uuidTemp !== props.uuid) return
      textPreview.value = data
      sourceUrlWithURL.value = url
      textRef.value.innerHTML = '';
      editor = window.editormd.markdownToHTML('textRef', {
        markdown: data,
        htmlDecode: "style,script,iframe",
        tocm: true,
        emoji: true,
        taskList: true,
        tex: true,
        flowChart: false,
        sequenceDiagram: false,
      })
      urlLoading.value = false
      return
    }
    const blob = await getPdfUrl({ url })
    if (uuidTemp !== props.uuid) return
    sourceUrlWithURL.value = URL.createObjectURL(blob)
    urlLoading.value = false
    if (getFileTypeWithName(url) === 'docx') {
      renderAsync(blob, docxRef.value, null, {
        inWrapper: true, // 启动围绕文档内容包装器
        ignoreWidth: false, // 禁止页面渲染宽度
        ignoreHeight: false, // 禁止页面渲染高度
        ignoreFonts: true, // 字体渲染
        breakPages: true, // 启用分页
        ignoreLastRenderedPageBreak: false, // 禁止元素
        experimental: false, // 禁用实验性功能
        trimXmlDeclaration: true, // XML删除
        debug: false,
      })
    }
  } catch (error) {
    const { response } = error
    let status: number = 200
    if (response && response.status) {
      status = ~~response.status
    }
    sourceUrlWithURL.value = ''
  }
}
watch(() => props.sourceUrl, async (newVa, oldVa) => {
  if (newVa && newVa !== oldVa) {
    loadTime = 1
    await loadSource(props.uuid, newVa)
    docuId.value = props.urlStateDocId
  }
  if (newVa === '') sourceUrlWithURL.value = ''
  scale = 1
  setZoom()
})
</script>
<style lang="scss" scoped>
:root {
  --zoom-scale: 1
}

.compare-docs {
  width: 200px;
  z-index: 4;
}

.opener {
  display: flex;
  flex-flow: column;
  width: 100%;
}

.document-header {
  margin: 0.375rem 0.625rem 0.625rem 0.625rem;
  display: flex;
  gap: 1.25rem;

  ::v-deep(svg) {
    width: 1.25rem;
    height: 1.25rem;
  }

  .zoom-operation {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.625rem;

    .zoom-in {
      cursor: pointer;
    }

    .zoom-out {
      cursor: pointer;
    }
  }

  .page-operation {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.625rem;
  }

  .download-operation {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    align-items: center;

    .download {
      cursor: pointer;
    }
  }
}

.document-opener {
  max-width: 50vw;
  margin: 0 0.625rem 0.625rem 0.625rem;
  overflow: auto;

  &:has(iframe) {
    margin-top: 0.625rem;
    overflow: hidden;
  }

  .text-preview {
    width: fit-content;
    transform: scale(var(--zoom-scale));
    transform-origin: top;
  }

  .docx-preview {
    max-width: 40vw;
    transform: scale(var(--zoom-scale));
    transform-origin: top;
    height: 100vh;

    ::v-deep(.docx-wrapper) {
      align-items: flex-start;
      width: fit-content;
      background: #fff;
      padding-top: 0;
      padding: 0pt;

      section {
        margin: 10px;
      }
    }
  }

  iframe {
    border: 0;
    width: 100%;
  }

  .pdf-loading {
    width: calc(40vw - 50px);
    height: calc(100% - 1.5rem);
    position: absolute;
    z-index: 1;

    ::v-deep(.el-loading-mask) {
      border-radius: 1.5rem;
    }
  }

  .parser-loading {
    width: 100%;
  }
}
</style>
