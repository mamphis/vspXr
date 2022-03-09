<script setup lang="ts">
import { vscode } from "../lib/vscode";
import { Extension } from "../model/extension";

const props = defineProps<{ extension: Extension }>();
function installExtension() {
    vscode.postMessage({ install: { ...props.extension } });
}
</script>
<template>
    <div id="wrapper">
        <div id="image">
            <img :src="extension.icon" />
        </div>
        <div id="info">
            <div id="name">{{ extension.name }}</div>
            <div id="short-description">{{ extension.description }}</div>
            <div id="publisher">Publisher: {{ extension.publisher }}</div>
        </div>
        <div id="settings">
            <div id="version">v{{ extension.version }}</div>
            <button
                id="install"
                class="small"
                v-if="!extension.installed"
                @click="installExtension()"
            >
                Install
            </button>
        </div>
    </div>
</template>

<style scoped>
#wrapper {
    display: flex;
    height: 64px;
    width: 95%;
}

#wrapper > div {
    margin: 1px 2px;
}

#image {
    flex-shrink: 0;
    width: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
}

#image > img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
}

#info {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    flex: 0 1 auto;
    overflow: hidden;
}

#name {
    font-weight: bold;
}

#publisher {
    font-size: smaller;
}

#settings {
    padding: 1px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

#version {
    flex-grow: 1;
    font-size: smaller;
}

#short-description {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
</style>