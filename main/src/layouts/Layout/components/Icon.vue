<template>
    <Icons :type="type" />
</template>
<script lang="ts">
/**
 * Layout icon , 主要用于菜单
 * @author QuerySystem
 * 使用说明：
 *   >>> 在这里可以对以下字体图标进行引入替换， Layout icon 统一效果：
 *     import Icons from '@/components/IconSvg';
 *     import Icons from '@/components/IconFont';
 */
import { defineComponent } from "vue";
import Icons from "@/components/IconSvg";
// import Icons from '@/components/IconFont';
export default defineComponent({
    name: 'Icon',
    props: {
        type: {
            type: String,
            required: true
        }
    },
    components: {
        Icons
    }
})
</script>
