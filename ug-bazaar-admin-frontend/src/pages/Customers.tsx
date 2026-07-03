import React, { useState, useEffect } from 'react';
import { apiClient } from '@ugbazaar/shared';

interface Customer {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  village?: string;
  isVerified?: boolean;
  createdAt: string;
}

export default function Customers() {
  const [customersList, setCustomersList] = useState<Customer[]>([]);

  const loadCustomers = async () => {
    try {
      const res = await apiClient('/admin/customers');
      if (res.success && res.users) {
        setCustomersList(res.users);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadCustomers();
    }, 0);
  }, []);

  return (
    <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
      <h2 className="font-extrabold text-lg text-brand-dark">Customer Directory</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border text-xs font-bold text-brand-muted uppercase bg-brand-light/35">
              <th className="py-4 px-4">Customer Name</th>
              <th className="py-4 px-4">Mobile Number</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Village</th>
              <th className="py-4 px-4">Verified</th>
              <th className="py-4 px-4">Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light text-sm font-semibold">
            {customersList.map((c) => (
              <tr key={c._id} className="hover:bg-brand-light/30">
                <td className="py-4 px-4 font-extrabold text-brand-dark">{c.name}</td>
                <td className="py-4 px-4 font-mono text-xs">{c.mobile}</td>
                <td className="py-4 px-4">{c.email || 'N/A'}</td>
                <td className="py-4 px-4 capitalize">{c.village || 'Talodhi'}</td>
                <td className="py-4 px-4 text-xs font-bold">
                  <span className={`px-2 py-0.5 rounded ${c.isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {c.isVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </td>
                <td className="py-4 px-4">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
