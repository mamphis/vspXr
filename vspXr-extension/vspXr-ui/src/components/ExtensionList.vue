<script setup lang="ts">
import Extension from "./Extension.vue";
import { Extension as ExtensionModel } from "../model/extension";
import { ref } from "@vue/reactivity";
const extensions = ref<ExtensionModel[]>([]);

window.addEventListener("message", (ev) => {
    const { type, content } = ev.data;
    switch (type) {
        case "setExtensions":
            extensions.value = content;
            break;
    }
});
</script>

<template>
    <div class="extension">
        <extension v-for="extension in extensions" :key="extension.id" :extension="extension" />
    </div>
</template>

<style scoped>
.extension {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>