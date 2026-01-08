'use client';

import { useState, useEffect } from 'react';
import { Save, Building2, Mail, Phone, MapPin, Globe, FileText, CheckCircle } from 'lucide-react';
import type { CompanySettings } from '@/lib/types';

export default function SettingsPage() {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        company_website: '',
        tax_id: '',
        logo_url: '',
        footer_text: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
            setFormData({
                company_name: data.company_name || '',
                company_email: data.company_email || '',
                company_phone: data.company_phone || '',
                company_address: data.company_address || '',
                company_website: data.company_website || '',
                tax_id: data.tax_id || '',
                logo_url: data.logo_url || '',
                footer_text: data.footer_text || '',
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                setSettings(data);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 mt-1">Configure your company information for quotes and orders</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-brand-400" />
                        Company Information
                    </h2>
                    <p className="text-sm text-slate-400 mb-6">
                        This information will appear on your quotes and orders PDF documents.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                required
                                className="w-full"
                                placeholder="Your Company Name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    <Mail size={14} className="inline mr-1.5" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.company_email}
                                    onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                                    className="w-full"
                                    placeholder="contact@yourcompany.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    <Phone size={14} className="inline mr-1.5" />
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.company_phone}
                                    onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                                    className="w-full"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                <MapPin size={14} className="inline mr-1.5" />
                                Address
                            </label>
                            <textarea
                                value={formData.company_address}
                                onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                                rows={3}
                                className="w-full"
                                placeholder="123 Business Street&#10;Suite 100&#10;City, State 12345"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    <Globe size={14} className="inline mr-1.5" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={formData.company_website}
                                    onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                                    className="w-full"
                                    placeholder="https://www.yourcompany.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Tax ID / VAT Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.tax_id}
                                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                                    className="w-full"
                                    placeholder="XX-XXXXXXX"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Settings */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-brand-400" />
                        Document Settings
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Logo URL
                            </label>
                            <input
                                type="url"
                                value={formData.logo_url}
                                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                className="w-full"
                                placeholder="https://www.yourcompany.com/logo.png"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Enter a URL to your company logo. Recommended size: 200x60 pixels.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Footer Text
                            </label>
                            <textarea
                                value={formData.footer_text}
                                onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                                rows={2}
                                className="w-full"
                                placeholder="Thank you for your business!"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                This text will appear at the bottom of your quotes and orders.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="card bg-slate-800/50">
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Preview</h3>
                    <div className="p-4 bg-white rounded-lg text-slate-900">
                        <div className="flex justify-between items-start border-b-2 border-brand-500 pb-3 mb-3">
                            <div>
                                {formData.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={formData.logo_url}
                                        alt="Company Logo"
                                        className="h-10 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="text-xl font-bold text-brand-600">
                                        {formData.company_name || 'Your Company Name'}
                                    </div>
                                )}
                            </div>
                            <div className="text-right text-sm text-slate-600">
                                {formData.company_email && <div>{formData.company_email}</div>}
                                {formData.company_phone && <div>{formData.company_phone}</div>}
                                {formData.company_website && <div>{formData.company_website}</div>}
                            </div>
                        </div>
                        {formData.company_address && (
                            <div className="text-sm text-slate-600 whitespace-pre-line">
                                {formData.company_address}
                            </div>
                        )}
                        {formData.footer_text && (
                            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 text-center">
                                {formData.footer_text}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    {settings?.updated_at && (
                        <p className="text-sm text-slate-500">
                            Last updated: {new Date(settings.updated_at).toLocaleString()}
                        </p>
                    )}
                    <div className="flex items-center gap-3">
                        {saved && (
                            <span className="flex items-center gap-1.5 text-brand-400 text-sm">
                                <CheckCircle size={16} />
                                Settings saved!
                            </span>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
