import React, { useState, useEffect, useMemo } from 'react';
import type { Customer } from '../lib/types';
import { useLocalization } from '../hooks/useLocalization';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import Card from './Card';
import Button from './Button';
import ConfirmationModal from './ConfirmationModal';

// Storage key for customers
const CUSTOMER_STORAGE_KEY = 'admin_customers';

const CustomerManagement: React.FC = () => {
    const { t } = useLocalization();
    const { user } = useGoogleAuth();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    
    const [modalState, setModalState] = useState<{ customer: Customer } | null>(null);

    // Load customers from localStorage on mount
    useEffect(() => {
        try {
            const storedCustomers = localStorage.getItem(CUSTOMER_STORAGE_KEY);
            if (storedCustomers) {
                setCustomers(JSON.parse(storedCustomers));
            }
        } catch (e) {
            console.error("Failed to load customers from storage", e);
        }
    }, []);

    // Save customers to localStorage whenever the list changes
    useEffect(() => {
        try {
            localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
        } catch (e) {
            console.error("Failed to save customers to storage", e);
        }
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [customers, searchTerm]);

    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newCustomer: Customer = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            createdAt: new Date().toISOString(),
            userId: user?.sub || 'admin',
        };

        setCustomers(prev => [newCustomer, ...prev]);

        // Reset form
        setName('');
        setEmail('');
        setPhone('');
    };

    const handleDeleteCustomer = (customerToDelete: Customer) => {
        setModalState({ customer: customerToDelete });
    };

    const confirmDelete = () => {
        if (!modalState) return;
        setCustomers(prev => prev.filter(c => c.id !== modalState.customer.id));
        setModalState(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-1">
                <Card>
                    <h3 className="text-2xl font-bold font-serif text-teal-300 mb-4">{t('addCustomerTitle')}</h3>
                    <form onSubmit={handleAddCustomer} className="space-y-4">
                        <div>
                            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-300 mb-1">{t('customerNameLabel')}</label>
                            <input type="text" id="customer-name" value={name} onChange={e => setName(e.target.value)} required
                                className="w-full bg-gray-900/50 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                         <div>
                            <label htmlFor="customer-email" className="block text-sm font-medium text-gray-300 mb-1">{t('customerEmailLabel')}</label>
                            <input type="email" id="customer-email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-900/50 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                         <div>
                            <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-300 mb-1">{t('customerPhoneLabel')}</label>
                            <input type="tel" id="customer-phone" value={phone} onChange={e => setPhone(e.target.value)}
                                className="w-full bg-gray-900/50 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <Button type="submit" variant="primary" className="w-full">{t('saveCustomerButton')}</Button>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <Card>
                    <h3 className="text-2xl font-bold font-serif text-teal-300 mb-4">{t('customerListTitle')}</h3>
                     <input type="text" placeholder={t('customerSearchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900/50 border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-4" />
                    
                    <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-900/60 rounded-lg">
                                    <div>
                                        <p className="font-bold text-white">{customer.name}</p>
                                        <p className="text-sm text-gray-400">{customer.email}</p>
                                        <p className="text-sm text-gray-400">{customer.phone}</p>
                                    </div>
                                    <Button onClick={() => handleDeleteCustomer(customer)} variant="danger" size="sm" aria-label={`Delete ${customer.name}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">{t('noCustomersFound')}</p>
                        )}
                    </div>
                </Card>
            </div>

            {modalState && (
                <ConfirmationModal
                    isOpen={!!modalState}
                    onClose={() => setModalState(null)}
                    onConfirm={confirmDelete}
                    title={t('confirmDeleteCustomerTitle')}
                    message={t('confirmDeleteCustomerMessage', { name: modalState.customer.name })}
                />
            )}
        </div>
    );
};

export default CustomerManagement;
