<template>
  <div ref="textRef" class="chat-text" :class="wrapClass">
    <div class="chat-text-content">
      <div class="chat-text-from">
        <div class="html" v-html="text"></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, onMounted, onUnmounted, onUpdated, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import mdKatex from '@traptitech/markdown-it-katex';
import mila from 'markdown-it-link-attributes';
import hljs from 'highlight.js';
import { copyToClip } from '@/utils/clipboard';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  text?: string;
  loading?: boolean;
}

const props = defineProps<Props>();
const textRef = ref<HTMLElement | null>(null);
const mdi = new MarkdownIt({
  html: false,
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
  return '';
});

const text = computed(() => {
  const value = props.text ?? '';
  return mdi.render(value);
});

const addCopyEvents = () => {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy');
    copyBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement?.parentElement?.querySelector('code')?.textContent ?? '';
        if (code) {
          copyToClip(code).then(() => {
            btn.innerHTML = t('page.qa.text.copied');
            setTimeout(() => {
              btn.innerHTML = '<img src="/images/pk-copy.svg" />' + t('page.qa.text.copy');
            }, 1000);
          })
        }
      })
    })
  }
}

const removeCopyEvents = () => {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy');
    copyBtn.forEach((btn) => {
      btn.removeEventListener('click', () => { });
    });
  }
}

const copyCode = 'Copy';

const highlightBlock = (str: string, lang?: string) => {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy"><img src="/images/pk-copy.svg" />${copyCode}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`;
};

onMounted(() => {
  addCopyEvents();
})
onUpdated(() => {
  addCopyEvents();
})
onUnmounted(() => {
  removeCopyEvents();
})
</script>
<style lang="scss" scoped>
@import '@/assets/css/chat/variables.scss';
@import '@/assets/css/chat/text.scss';

h1 {
  line-height: 1em;
}

.chat-text {
  color: var(--theme-color-text);
  background: #fff;
  font-size: var(--text-preview);
  border-radius: 0 0.625rem 0.625rem 0.625rem;
  padding: 0.0625rem 0.625rem;
}
</style>
