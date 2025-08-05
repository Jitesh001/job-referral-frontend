import Signup from "@/views/Signup.vue";
import Login from "@/views/Login.vue";
import Feed from "@/views/Feed.vue";
import CreateJob from "@/views/CreateJob1.vue";
import EditCreateJob from "@/views/EditCreateJob.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  meta: { requiresAuth: true },
  routes: [
    { path: "/signup", component: Signup },
    {
      path: "/login",
      name: "login", // ✅ MUST match exactly
      component: Login,
    },
    {
      path: "/:userUUID/feed",
      name: "feed",
      component: Feed,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: "/:userUUID/create-job",
      name: "CreateJob",
      component: CreateJob,
      props: (route) => ({
        userUUID: route.params.userUUID,
        activeTab: route.query.activeTab, // Pass query as prop
      }),
      meta: { requiresAuth: true },
    },
    {
      path: "/:jobUUID/edit-job",
      component: EditCreateJob,
      name: "EditJob",
      props: true,
      meta: { requiresAuth: true },
    },
    { path: "/", redirect: "/login" },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isAuthenticated;

  try {
    if (to.meta.requiresAuth) {
      if (isLoggedIn) {
        if (!authStore.user) {
          await authStore.fetchUserProfile();
        }
        return next();
      }

      if (authStore.refreshToken) {
        try {
          await authStore.refreshAccessToken();
          await authStore.fetchUserProfile();
          return next();
        } catch (err) {
          console.error("Token refresh failed:", err);
        }
      }
      return next({ name: "login", query: { next: to.fullPath } });
    }

    return next();
  } catch (err) {
    return next({ name: "login", query: { next: to.fullPath } });
  }
});

export default router;
