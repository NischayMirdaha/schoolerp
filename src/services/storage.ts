import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { RoleInfo, UserInfo } from '../types/auth';

const KEYS = {
    ACCESS_TOKEN: 'school_erp_access_token',
    REFRESH_TOKEN: 'school_erp_refresh_token',
    ACCESS_TOKEN_EXPIRY: 'school_erp_access_token_expiry',
    USER_INFO: 'school_erp_user_info',
    ACTIVE_ROLE: 'school_erp_active_role',
    AVAILABLE_ROLES: 'school_erp_available_roles',
};

// Cross-Platform Storage Handler
// Native (iOS/Android): expo-secure-store persists values in the encrypted keychain/keystore,
// so a session survives app restarts.
// Web: localStorage. An in-memory map is used only as a last-resort fallback if the platform
// storage API throws (e.g. private browsing, SecureStore unavailable).
class Storage {
    private memoryStore: Record<string, string> = {};

    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            try {
                return localStorage.getItem(key);
            } catch {
                return this.memoryStore[key] || null;
            }
        }
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
            return this.memoryStore[key] || null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            try {
                localStorage.setItem(key, value);
            } catch {
                this.memoryStore[key] = value;
            }
            return;
        }
        try {
            await SecureStore.setItemAsync(key, value);
        } catch {
            this.memoryStore[key] = value;
        }
    }

    async removeItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            try {
                localStorage.removeItem(key);
            } catch {}
            delete this.memoryStore[key];
            return;
        }
        try {
            await SecureStore.deleteItemAsync(key);
        } catch {}
        delete this.memoryStore[key];
    }
}

const storage = new Storage();

export const TokenStorage = {
    async setSession(
        accessToken: string,
        refreshToken: string,
        accessTokenExpiry: string,
        user: UserInfo,
        availableRoles: RoleInfo[],
        activeRole: RoleInfo | null
    ) {
        await storage.setItem(KEYS.ACCESS_TOKEN, accessToken);
        await storage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
        await storage.setItem(KEYS.ACCESS_TOKEN_EXPIRY, accessTokenExpiry);
        await storage.setItem(KEYS.USER_INFO, JSON.stringify(user));
        await storage.setItem(KEYS.AVAILABLE_ROLES, JSON.stringify(availableRoles));
        if (activeRole) {
            await storage.setItem(KEYS.ACTIVE_ROLE, JSON.stringify(activeRole));
        } else {
            await storage.removeItem(KEYS.ACTIVE_ROLE);
        }
    },

    async updateTokens(
        accessToken: string,
        refreshToken: string,
        accessTokenExpiry: string,
        activeRole: RoleInfo | null
    ) {
        await storage.setItem(KEYS.ACCESS_TOKEN, accessToken);
        await storage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
        await storage.setItem(KEYS.ACCESS_TOKEN_EXPIRY, accessTokenExpiry);
        if (activeRole) {
            await storage.setItem(KEYS.ACTIVE_ROLE, JSON.stringify(activeRole));
        } else {
            await storage.removeItem(KEYS.ACTIVE_ROLE);
        }
    },

    async getAccessToken(): Promise<string | null> {
        return storage.getItem(KEYS.ACCESS_TOKEN);
    },

    async getRefreshToken(): Promise<string | null> {
        return storage.getItem(KEYS.REFRESH_TOKEN);
    },

    async getAccessTokenExpiry(): Promise<string | null> {
        return storage.getItem(KEYS.ACCESS_TOKEN_EXPIRY);
    },

    async getUserInfo(): Promise<UserInfo | null> {
        const data = await storage.getItem(KEYS.USER_INFO);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    async getActiveRole(): Promise<RoleInfo | null> {
        const data = await storage.getItem(KEYS.ACTIVE_ROLE);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    async getAvailableRoles(): Promise<RoleInfo[]> {
        const data = await storage.getItem(KEYS.AVAILABLE_ROLES);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    },

    async clearSession() {
        await storage.removeItem(KEYS.ACCESS_TOKEN);
        await storage.removeItem(KEYS.REFRESH_TOKEN);
        await storage.removeItem(KEYS.ACCESS_TOKEN_EXPIRY);
        await storage.removeItem(KEYS.USER_INFO);
        await storage.removeItem(KEYS.ACTIVE_ROLE);
        await storage.removeItem(KEYS.AVAILABLE_ROLES);
    },
};