import type { AdminLogEntry } from './types';

const MAX_LOG_ENTRIES = 500;

export const logAdminEvent = (action: string, user: string = 'Guest', details: string = 'N/A') => {
    try {
        const newLog: AdminLogEntry = {
            timestamp: new Date().toISOString(),
            user,
            action,
            details,
        };

        const storedLogs = localStorage.getItem('adminHistoryLog');
        let logs: AdminLogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];

        logs.unshift(newLog); // Add new log to the beginning

        // Keep the log size manageable
        if (logs.length > MAX_LOG_ENTRIES) {
            logs = logs.slice(0, MAX_LOG_ENTRIES);
        }

        localStorage.setItem('adminHistoryLog', JSON.stringify(logs));
    } catch (e) {
        console.error("Failed to write to admin log:", e);
    }
};
