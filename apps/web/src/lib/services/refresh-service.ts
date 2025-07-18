import { apiClient } from "$lib/api/client";
import { authStore } from "$lib/stores/auth.svelte";

class RefreshService {
  private refreshTimeout: number | null = null;

  startRefreshTimer(expiresAt: number) {
    this.stopRefreshTimer();

    const now = Date.now();
    const refreshTime = expiresAt - 3 * 60 * 1000;

    const timeUntilRefresh = Math.max(0, refreshTime - now);

    this.refreshTimeout = window.setTimeout(() => {
      this.performRefresh();
    }, timeUntilRefresh);
  }

  stopRefreshTimer() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  private async performRefresh() {
    try {
      const refreshResult = await apiClient.auth.refresh();

      if (refreshResult.ok) {
        const whoAmIResult = await apiClient.auth.whoAmI();

        if (whoAmIResult.ok) {
          authStore.setAuthenticated(whoAmIResult.data!);
          this.startRefreshTimer(whoAmIResult.data!.session.expiresAt);
        }
      } else {
        authStore.setUnauthenticated();
      }
    } catch (error) {
      console.error("Refresh failed:", error);
      authStore.setUnauthenticated();
    }
  }
}

export const refreshService = new RefreshService();
