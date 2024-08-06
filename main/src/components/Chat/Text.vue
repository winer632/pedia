<template>
  <div ref="textRef" class="chat-text" :class="wrapClass">
    <div class="chat-text-content" :class="loading ? 'anime' : ''">
      <div v-if="!isMe" class="chat-text-from">
        <div v-if="!isRaw" class="html" v-html="text"></div>
        <div v-else class="text" v-text="text"></div>
      </div>
      <p v-else class="pre-wrap" v-text="text"></p>
      <span class="chat-text-loading" v-if="loading"></span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, defineEmits, onMounted, onUnmounted, onUpdated, ref, watch, watchEffect } from 'vue';
import MarkdownIt from 'markdown-it';
import mdKatex from '@traptitech/markdown-it-katex';
import mila from 'markdown-it-link-attributes';
import hljs from 'highlight.js';
import { useI18n } from 'vue-i18n';
import { copyToClip } from '@/utils/clipboard';

const { t } = useI18n();

interface Props {
  owner?: string;
  error?: boolean;
  text?: string;
  loading?: boolean;
  UUID?: any;
  asRawText?: boolean;
  activeIndex?: number;
  activeId?: number;
}

interface Emits {
  (ev: 'handleChunk', index, id_index): void
}

const isMe = computed(() => props.owner === 'me');
const isRaw = computed(() => props.asRawText);

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const textRef = ref<HTMLElement | null>(null);
const mdi = new MarkdownIt({
  html: true,
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language));
    if (validLang) {
      const lang = language ?? '';
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang);
    }
    return highlightBlock(hljs.highlightAuto(code).value, '');
  },
});

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } });
mdi.use(mdKatex, {
  blockClass: 'katexmath-block rounded-md p-[0.625rem]',
  errorColor: ' #cc0000',
});

const wrapClass = computed(() => {
  return props.owner === 'me' ? 'owner' : '';
});

const text = computed(() => {
  const value = props.text ?? '';
  if (!props.asRawText) {
    return mdi.render(value);
  }

  return value;
});

let addClick: boolean = false;
let chunk: any = null;
const addHandleClick = () => {
  if (textRef.value) {
    chunk = textRef.value.querySelectorAll('.el-index')
    chunk.forEach(ch => {
      const index = ch.dataset.id
      const id_index = ch.dataset.indexId
      ch.addEventListener('click', () => {
        chunk.forEach(h => {
          if (index !== h.dataset.id && id_index !== h.dataset.indexId) h.classList.remove('active')
        })
        ch.classList.add('active')
        emit('handleChunk', index, id_index)
      })
    })
  }
}

const removeHandleClick = () => {
  if (textRef.value) {
    const chunk = textRef.value.querySelectorAll('.el-index')
    chunk.forEach(ch => {
      ch.removeEventListener('click', () => { });
    })
  }
}

const addCopyEvents = () => {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy');
    copyBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement?.parentElement?.querySelector('code')?.textContent ?? '';
        if (code) {
          copyToClip(code).then(() => {
            btn.textContent = t('page.qa.text.copied');
            setTimeout(() => {
              btn.innerHTML = '<img src="/images/pk-copy.svg" />' + t('page.qa.text.copy');
            }, 1000);
          });
        }
      });
    });
  }
};

const removeCopyEvents = () => {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy');
    copyBtn.forEach((btn) => {
      btn.removeEventListener('click', () => { });
    });
  }
};

onMounted(() => {
  addCopyEvents();
  addHandleClick();
});

onUpdated(() => {
  addCopyEvents();
});

onUnmounted(() => {
  removeCopyEvents();
  removeHandleClick();
});

watch(() => props.activeId, (id) => {
  if (chunk) {
    chunk.forEach(h => {
      h.classList.remove('active');
      if (Number(h.dataset.indexId) === Number(id) && Number(h.dataset.id) === props.activeIndex) {
        h.classList.add('active');
      }
    })
  }
})
watch(() => props.activeIndex, (id) => {
  if (chunk) {
    chunk.forEach(h => {
      h.classList.remove('active');
      if (Number(h.dataset.indexId) === Number(props.activeId) && Number(h.dataset.id) === Number(id)) {
        h.classList.add('active');
      }
    })
  }
})
watchEffect(() => {
  if (props.UUID) {
    setTimeout(addHandleClick);
  }
})

const highlightBlock = (str: string, lang?: string) => {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy"><img src="/images/pk-copy.svg" />${t(
    'chat.copyCode'
  )}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`;
};
</script>
<style lang="scss">
@import '@/assets/css/chat/variables.scss';
@import '@/assets/css/chat/text.scss';

.chat-text.owner {
  color: #fff;
  background: var(--theme-color-medium);
  font-family: 'PingFang SC';
  border-radius: 0.625rem 0 0.625rem 0.625rem;
}

.chat-text {
  color: var(--theme-color-text);
  background: var(--theme-bg-colorSpan);
  font-size: var(--text-preview);
  border-radius: 0 0.625rem 0.625rem 0.625rem;
  padding: 1rem;
}
</style>
