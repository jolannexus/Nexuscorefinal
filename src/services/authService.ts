import { Role, User } from "../types/index";

export const authService = {
  // Safe helper to obtain standard bearer token
  getToken(): string | null {
    return localStorage.getItem("nexus_auth_token");
  },

  async loginWithGoogle(agencyId?: string) {
    throw new Error("Enterprise stability phase: Google SSO is temporarily routing to standard authentication form.");
  },

  async register(
    email: string,
    pass: string,
    agencyId?: string,
    role: Role = "RESELLER",
  ) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass, role, tenantId: agencyId }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to register profile.");
    }

    const { token, user } = await response.json();
    localStorage.setItem("nexus_auth_token", token);
    return user;
  },

  async login(email: string, pass: string, agencyId?: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass, tenantId: agencyId }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Invalid login credentials.");
    }

    const { token, user } = await response.json();
    localStorage.setItem("nexus_auth_token", token);
    return user;
  },

  async resetPassword(email: string) {
    console.info(`Password reset requested for: ${email}`);
  },

  async logout() {
    localStorage.removeItem("nexus_auth_token");
  },

  async getUserRole(uid: string): Promise<Role | null> {
    try {
      const token = this.getToken();
      if (!token) return null;
      const response = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.role || null;
    } catch {
      return null;
    }
  },
};
