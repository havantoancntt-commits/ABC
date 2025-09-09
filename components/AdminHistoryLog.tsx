import React, { useState, useEffect, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { AdminLogEntry } from '../lib/types';
import Card from './Card';
import Button from './Button';

const AdminHistoryLog: React.FC = () => {
    const { t } = useLocalization();
    const [logs, setLogs] = useState<AdminLogEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof AdminLogEntry; direction: 'ascending' | 'descending' }>({ key: 'timestamp', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 20;

    useEffect(() => {
        try {
            const storedLogs = localStorage.getItem('adminHistoryLog');
            if (storedLogs) {
                setLogs(JSON.parse(storedLogs));
            }
        } catch (e) {
            console.error("Failed to load admin history log", e);
        }
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log =>
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [logs, searchTerm]);

    const sortedLogs = useMemo(() => {
        const sortableItems = [...filteredLogs];
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [filteredLogs, sortConfig]);

    const paginatedLogs = useMemo(() => {
        const indexOfLastLog = currentPage * logsPerPage;
        const indexOfFirstLog = indexOfLastLog - logsPerPage;
        return sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
    }, [sortedLogs, currentPage, logsPerPage]);

    const totalPages = Math.ceil(sortedLogs.length / logsPerPage);

    const requestSort = (key: keyof AdminLogEntry) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const getSortIndicator = (key: keyof AdminLogEntry) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    return (
        <Card className="animate-fade-in">
            <h3 className="text-2xl font-bold font-serif text-teal-300 mb-4">{t('adminHistoryLog')}</h3>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder={t('adminSearchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900/50 border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('timestamp')}>{t('adminLogTimestamp')} {getSortIndicator('timestamp')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('user')}>{t('adminLogUser')} {getSortIndicator('user')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('action')}>{t('adminLogAction')} {getSortIndicator('action')}</th>
                            <th scope="col" className="px-6 py-3">{t('adminLogDetails')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.map((log, index) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-900/50">
                                <td className="px-6 py-4 font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString(t('locale'))}</td>
                                <td className="px-6 py-4 font-semibold text-white">{log.user}</td>
                                <td className="px-6 py-4">{log.action}</td>
                                <td className="px-6 py-4">{log.details}</td>
                            </tr>
                        ))}
                         {paginatedLogs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">No logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center">
                    <Button size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
                    <Button size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                </div>
            )}
        </Card>
    );
};

export default AdminHistoryLog;