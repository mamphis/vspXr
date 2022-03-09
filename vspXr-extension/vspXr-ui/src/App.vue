<script setup lang="ts">
import { ref } from "vue";
import Searchbar from "./components/Searchbar.vue";
import ExtensionList from "./components/ExtensionList.vue";
</script>

<template>
    <div id="container">
        <searchbar />
        <extension-list />
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
    font-size: var(--vscode-font-size);
    font-weight: var(--vscode-font-weight);
    font-family: var(--vscode-font-family);
}

button.small {
    font-size: small !important;
}

button {
    cursor: pointer;
    border-radius: 0;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: var(--vscode-button-border);
    border-style: solid;
    border-width: 1px;
}

button:hover {
    background: var(--vscode-button-hoverBackground);
}

input {
    background: var(--vscode-input-background);
    border-color: var(--vscode-input-border);
    color: var(--vscode-input-foreground);
    border-style: solid;
    border-width: 1px;
}
::placeholder {
    color: var(--vscode-input-placeholderForeground);
}
</style>

<style scoped>
#container {
    display: flex;
    flex-direction: column;
    flex-grow: 0;
}
</style>