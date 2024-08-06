import { ref } from 'vue'
import { queryDocument, postDocument, summary } from '@/views/document/service'
import { ElMessage, ElLoading } from 'element-plus'
import { useStore } from "vuex";
import { useI18n } from 'vue-i18n'

export function useUpload(loadAbstract, handleEnable) {
  const { t } = useI18n()
  const store = useStore<{ pk_document: any }>();
  let loading
  let timer: number = 0
  const interval = async () => {
    if (timer) {
      clearInterval(timer)
      timer = 0
    }
    timer = setInterval(async () => {
      const state = store.state.pk_document.urlState.status
      const uuid = store.state.pk_document.active
      if (state <= 2 && uuid) {
        try {
          let res = await queryDocument({ docId: uuid })
          if (res && res.data) {
            if (res.data.parserState > 2) {
              store.commit('pk_document/changeUrlState', { url: res.data.sourceFile, status: res.data.parserState, docId: res.data.docId })
              store.commit('pk_document/changePdfState', { pdfUrl: res.data.pdfFile, status: res.data.state })
              store.commit('pk_document/updateHistory', { uuid, state: res.data.parserState, sourceUrl: res.data.sourceFile, type: 'update', createdAt: res.data.createTime })
              clearInterval(timer)
              handleEnable()
              res = await summary({ docId: res.data.docId })
              loadAbstract(res)
            }
          }
        } catch (error) {
          clearInterval(timer)
          console.log(error)
        }
      } else {
        clearInterval(timer)
      }
    }, 5000)
  }
  const httpRequest = async (option) => {
    const file = option.file
    const fd = new FormData()
    fd.append('file', file)

    const res = await postDocument(fd)
    if (res && res.data) {
      if (res.data.code === 1 || res.data.code === 5) {
        ElMessage.error(t('page.document.upload.dupl'))
      } else {
        store.commit('pk_document/addHistory', { uuid: res.data.docId, name: file.name, docId: res.data.docId, sourceUrl: res.data.sourceFile, pdfUrl: res.data.pdfFile, state: 1, isEdit: false, createdAt: res.data.updateTime })
        store.commit('pk_document/changeUrlState', { openPreview: true, url: res.data.sourceFile, status: res.data.parserState, docId: res.data.docId })
        store.commit('pk_document/changePdfState', { openPreview: true, pdfUrl: '', status: res.data.parserState })
        store.commit('pk_document/saveActive', { uuid: res.data.docId, status: res.data.parserState })
        if (res.data.parserState === 3) {
          handleEnable()
          loadAbstract({
            loading: true,
            data: {
              id: 0,
              digest: '',
              summarize: '',
              question: ''
            }
          })
          const resp = await summary({ docId: res.data.docId })
          loadAbstract(resp)
          loading.close()
        } else if (res.data.parserState <= 2) {
          interval()
          loadAbstract({
            loading: true,
            data: {
              id: 0,
              digest: '',
              summarize: '',
              question: ''
            }
          })
        }
        ElMessage.success(t('app.global.upload.success'))
      }
      loading.close()
      return res.data.doc_id
    }

    loading.close()
    ElMessage.error(t('app.global.upload.fail') + res.msg)
    return null
  }

  const beforeUpload = (file) => {
    const FILE_M = 50 * 1024 * 1024;
    const fileSize = file.size
    const fileName = file.name
    const fileType = file.name.split('.').pop()
    if (fileSize > FILE_M) {
      ElMessage.error(t('app.global.upload.limit'))
      return false
    }
    if (!['docx', 'pdf', 'md'].includes(fileType)) {
      ElMessage.error('Error Type')
      return false
    }
    if (fileName.match(/\[|\]|\^|\$|￥/g)) {
      ElMessage.error('The file name contains special characters, please try again')
      return false
    }
    loading = ElLoading.service({ target: '.upload-loading' })
  }

  const handleExceed = () => {
    ElMessage.error(t('app.global.upload.exceed'))
  }

  return {
    interval,
    httpRequest,
    beforeUpload,
    handleExceed
  }
}
