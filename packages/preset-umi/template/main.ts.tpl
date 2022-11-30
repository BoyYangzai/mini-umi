import { createApp } from 'vue';
import App from './App.vue';
import router from './routes';

let a: number = 1;
createApp(App)
  .use(router)
  .mount('#app');
