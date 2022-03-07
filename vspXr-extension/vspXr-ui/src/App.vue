<script setup lang="ts">
import { ref } from "vue";
import Searchbar from "./components/Searchbar.vue";
import ExtensionList from "./components/ExtensionList.vue";
import { Extension } from "./model/extension";

const ext = ref<Extension[]>([]);

function setSearchValue(extensions: Extension[]) {
    console.log("Setting searches to", extensions);
    ext.value = extensions;
}
</script>

<template>
    <div id="container">
        <searchbar @searchResult="setSearchValue($event)" />
        <extension-list :extensions="ext" />
    </div>
</template>

<style>
html,
body,
#app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

#app * {
    font-size: var(--vscode-editor-font-size);
    font-weight: var(--vscode-editor-font-weight);
    font-family: var(--vscode-editor-font-family);
}
</style>

<style scoped>
#container {
    display: flex;
    flex-direction: column;
}
</style>