<template>
  <div class="content">

    <div class="titles">
      <div class="title">
        ææ¯ /page-a è·¯ç± ð
      </div>
      <div class="title">
        <img src="../assets/mini-umi.jpg" alt="" @click="go">
      </div>
      <div class="title">
        <a href="https://github.com/BoyYangzai/mini-umi" target="_blank">mini-umi</a>
      </div>
      <div class="title">åºäºUmiå¾®åæ ¸æ¶ææ­å»ºç å¯ææ æ¸è¿å¼æ¡æ¶ </div>
      <div>æ¬æ¡æ¶éç¨ mini-umi + preset-Vue3.2 + Vite</div>
    </div>
    <div class="titles">
      <div class="title">To be continued...</div>
      <div class="title">mini-umi + preset-React + preset-MFSU</div>
      <div class="title">mini-umi + preset-qinkun</div>
      <div class="title">father dumi</div>
    </div>

  </div>
</template>
<script setup lang="ts">
import {RouterView} from 'vue-router'
const go = () => {
  window.open('https://github.com/BoyYangzai/mini-umi')
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

.titles {
  display: inline;

}

.title {
  width: 100%;
  text-align: center;
}

.content {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
}

img {
  width: 100px;
}

a {
  font-size: 20px;
  color: orange;
  text-decoration: none;
}
</style>
