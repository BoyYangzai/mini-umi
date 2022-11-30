import {
  createRouter,
  createWebHistory,
  RouteRecordRaw
} from 'vue-router';

const routes: RouteRecordRaw[] = {{{routes}}};

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
