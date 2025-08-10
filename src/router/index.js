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
    // Preload user if logged in
    if (isLoggedIn && !authStore.user) {
      await authStore.fetchUserProfile();
    }

    // 0) Invalid/unmatched routes
    const isUnmatched = to.matched.length === 0 || to.name === "NotFound";
    if (isUnmatched) {
      if (isLoggedIn) {
        return next({
          name: "feed",
          params: { userUUID: authStore.user?.uuid },
          query: { tabValue: 1 },
        });
      }
      // Not logged in -> send to login with "next" so we could later route somewhere sane
      return next({ name: "login", query: { next: to.fullPath } });
    }

    // 1) Logged in visiting /signup or /login -> go to feed
    if (isLoggedIn && (to.path === "/signup" || to.name === "login")) {
      return next({
        name: "feed",
        params: { userUUID: authStore.user?.uuid },
        query: { tabValue: 1 },
      });
    }

    // 2) Protected routes
    if (to.meta.requiresAuth) {
      if (isLoggedIn) {
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

    // 3) Public routes
    return next();
  } catch (err) {
    console.error(err);
    return next({ name: "login", query: { next: to.fullPath } });
  }
});

export default router;
