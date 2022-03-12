<script setup="{emit}" lang="ts">
import { onMounted, ref } from "vue";
import { vscode } from "../lib/vscode";
let state = vscode.getState();

let searchvalue = ref(state?.searchValue ?? "");
let searchInput = ref<HTMLInputElement>();
let loading = ref(false);
let typingTimer: NodeJS.Timeout;
let lastSendValue = "";
let registries: string[] = [];

onMounted(() => {
    searchInput.value?.focus();
    sendRequest();
});

window.addEventListener("message", (ev) => {
    const { type, content } = ev.data;
    console.log("Got message: ", type, content);
    switch (type) {
        case "setSearchValue":
            searchvalue.value = content;
            sendRequest();
            break;
        case "setExtensions":
            loading.value = false;
            break;
    }
});

function sendRequest() {
    onKeyDown();
    if (lastSendValue === searchvalue.value) {
        return;
    }
    lastSendValue = searchvalue.value;
    loading.value = true;

    vscode.postMessage({ search: lastSendValue });
}

function onKeyUp() {
    onKeyDown();
    vscode.setState({ searchValue: searchvalue.value });
    typingTimer = setTimeout(sendRequest, 500);
}

function onKeyDown() {
    if (typingTimer) {
        clearTimeout(typingTimer);
    }
}
</script>
<template>
    <div class="textbar">
        <div id="loading-bar"><div v-if="loading"></div></div>
        <input
            ref="searchInput"
            type="text"
            v-model="searchvalue"
            @keyup="onKeyUp"
            @keydown="onKeyDown"
            @keypress.enter="sendRequest"
        />
    </div>
</template>

<style scoped>
.textbar {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

input {
    margin-top: 2px;
    width: 95%;
}
input:focus {
    box-shadow: 0;
}

#loading-bar {
    width: 100%;
    height: 3px;
    position: relative;
}

#loading-bar > div {
    background: var(--vscode-progressBar-background);
    width: 10%;
    height: 100%;
    top: 0px;
    position: absolute;
    animation: sliding 2s infinite;
}

@keyframes sliding {
    0% {
        left: 0%;
    }

    100% {
        left: 100%;
    }
}
</style>