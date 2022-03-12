<script setup lang="ts">
import { ref } from "@vue/reactivity";
import { vscode } from "../lib/vscode";
import { Extension } from "../model/extension";
console.log("Loaded extension");
const props = defineProps<{ extension: Extension }>();
const installing = ref(false);

window.addEventListener("message", (ev) => {
    const { type, content } = ev.data;
    switch (type) {
        case "extensionInstalled":
            if (
                content.id === props.extension.id &&
                content.publisher === props.extension.publisher
            ) {
                props.extension.installed = true;
            }
            break;
    }
});

function installExtension() {
    if (installing.value) {
        return;
    }

    installing.value = true;
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
                :class="{ installing: installing }"
                @click="installExtension()"
            >
                <span>Install</span>
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
    flex: 1 1 auto;
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

#install {
    position: relative;
}

.installing {
    cursor: not-allowed;
}

.installing > span {
    visibility: hidden;
}

.installing::after {
    content: "";
    position: absolute;
    width: 8px;
    height: 8px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    border: 2px solid transparent;
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: button-loading-spinner 1s ease infinite;
}

@keyframes button-loading-spinner {
    from {
        transform: rotate(0turn);
    }

    to {
        transform: rotate(1turn);
    }
}
</style>