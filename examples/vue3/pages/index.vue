<template>
  <div class="content">
     <div class="titles">
      <div class="title" :style="{flexWrap:'nowrap',marginTop:'-20px'}">
        <a href="/page-a">点我跳转 page-a 路由</a>
        <br/>
        <a href="/test/testpage">点我跳转 test/test-page 路由</a>
      </div>
      <div class="title">
      <img src="../assets/mini-umi.jpg" alt="" @click="go">
      </div>
      <div class="title">
        <a href="https://github.com/BoyYangzai/mini-umi" target="_blank" id="a">mini-umi</a>
      </div>
    <div class="title">基于Umi微内核架构搭建的 可插拔 渐进式框架 </div>
    <div>本框架采用 mini-umi + preset-Vue3.2 + Vite</div>
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
const go = () => {
  window.open('https://github.com/BoyYangzai/mini-umi')
}
</script>

<style>
*{
  padding: 0;
  margin: 0;
}
.titles{
  display: inline;
  
}
.title{
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
img{
  width: 100px;
}
#a{
  font-size: 20px;
  color: orange;
  text-decoration: none;
}
a{
  display: inline;
  text-decoration: none;
}
</style>
