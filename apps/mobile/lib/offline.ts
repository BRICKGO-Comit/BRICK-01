import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { supabase } from './supabase';

const OFFLINE_QUEUE_KEY = '@prospect_offline_queue';

export interface OfflineProspect {
    id: string; // temp id
    data: any;
    timestamp: number;
}

export const OfflineManager = {
    /**
     * Check if device is online
     */
    async isOnline(): Promise<boolean> {
        try {
            const networkState = await Network.getNetworkStateAsync();
            return !!(networkState.isConnected && networkState.isInternetReachable);
        } catch (e) {
            return false;
        }
    },

    /**
     * Save a prospect to the offline queue
     */
    async saveToQueue(prospectData: any): Promise<void> {
        try {
            const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
            const queue: OfflineProspect[] = queueStr ? JSON.parse(queueStr) : [];

            const newEntry: OfflineProspect = {
                id: Math.random().toString(36).substring(7),
                data: prospectData,
                timestamp: Date.now()
            };

            queue.push(newEntry);
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.error('Error saving to offline queue:', e);
            throw e;
        }
    },

    /**
     * Get the current offline queue
     */
    async getQueue(): Promise<OfflineProspect[]> {
        try {
            const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
            return queueStr ? JSON.parse(queueStr) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Clear the queue after successful sync
     */
    async clearQueue(): Promise<void> {
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    },

    /**
     * Sync the offline queue with Supabase
     * Returns the number of synced items
     */
    async syncQueue(): Promise<number> {
        const queue = await this.getQueue();
        if (queue.length === 0) return 0;

        const online = await this.isOnline();
        if (!online) return 0;

        let syncCount = 0;
        const failedItems: OfflineProspect[] = [];

        for (const item of queue) {
            try {
                const { error } = await supabase
                    .from('prospects')
                    .insert(item.data);

                if (error) throw error;
                syncCount++;
            } catch (e) {
                console.error('Failed to sync item:', item.id, e);
                failedItems.push(item);
            }
        }

        // Update queue with only failed items
        if (failedItems.length > 0) {
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedItems));
        } else {
            await this.clearQueue();
        }

        return syncCount;
    }
};
