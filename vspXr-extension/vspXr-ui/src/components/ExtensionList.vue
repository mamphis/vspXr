<script setup lang="ts">
import Extension from "./Extension.vue";
import { Extension as ExtensionModel } from "../model/extension";
const props = defineProps<{
    extensions: ExtensionModel[];
}>();
</script>

<template>
    <div v-for="extension in extensions" :key="extension.id">
        <extension :extension="extension" />
    </div>
</template>