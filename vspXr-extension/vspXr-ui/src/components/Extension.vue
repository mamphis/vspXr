<script setup lang="ts">
import { Extension } from "../model/extension";

const props = defineProps<{ extension: Extension }>();
</script>
<template>
    <div id="wrapper">
        <div id="image"></div>
        <div id="info">
            <div id="name">{{ extension.name }}</div>
            <div id="short-description">{{ extension.description }}</div>
            <div id="publisher">Publisher: {{ extension.publisher }}</div>
        </div>
    </div>
</template>

<style scoped>
#wrapper {
    display: flex;
    height: 64px;
    width: 100%;
}

#image {
    width: 64px;
}

#info {
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

#name {
    font-weight: bold;
}

#publisher {
    font-size: smaller;
}
</style>