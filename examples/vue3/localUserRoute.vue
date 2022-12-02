<template>
  <div class="content">
    <div class="titles">
      <a class="title" :style="{ display: 'block', marginBottom: '10px', color: 'red' }"
        href="https://github.com/BoyYangzai/mini-umi#readme" target="_blank">约定式路由+可插拔插件系统+mumirc.ts/js配置文件+Vite毫秒级开发体验
      </a>

      <div class="title" :style="{ flexWrap: 'nowrap', marginBottom: '20px' }">
        我是用户自定义路由
      </div>
      <div class="title">
        <img src="@/assets/mini-umi.jpg" alt="" @click="go">
      </div>
      <div class="title">
        <a href="https://github.com/BoyYangzai/mini-umi" target="_blank" id="a">mini-umi</a>
      </div>
      <div class="title">基于Umi微内核架构搭建的 可插拔 渐进式框架 </div>
      <div class="title">本框架采用 mini-umi + preset-Vue3.2 + Vite</div>
    </div>
    <div class="titles">
      <el-button type="primary" class="title" @click="message">To be continued...</el-button>
      <div class="title">mini-umi + preset-React + preset-MFSU</div>
      <div class="title">mini-umi + preset-qinkun</div>
      <div class="title">father dumi</div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
const go = () => {
  window.open('https://github.com/BoyYangzai/mini-umi')
}
const message = () => {
  ElMessage.success({
    message: 'mini-umi 微内核架构'
  })
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

#a {
  font-size: 20px;
  color: orange;
  text-decoration: none;
}

a {
  display: inline;
  text-decoration: none;
}
</style>
