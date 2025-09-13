import React, { useState } from 'react';
import { X, User, Phone, Car as IdCard, Building2 } from 'lucide-react';
import { participantsApi } from '../../services/api';
import { CreateParticipantForm } from '../../types';
import { SEKSI_OPTIONS } from '../../utils/constants';
import { useToast } from '../../contexts/ToastContext';
import { clsx } from 'clsx';

interface NewParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialName?: string;
}

export const NewParticipantModal: React.FC<NewParticipantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialName = '',
}) => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState<CreateParticipantForm>({
    name: initialName,
    whatsapp_number: '',
    nip: '',
    seksi: SEKSI_OPTIONS[0],
  });
  
  // Update form data when initialName changes
  React.useEffect(() => {
    if (initialName) {
      setFormData(prev => ({ ...prev, name: initialName }));
    }
  }, [initialName]);

  const handleInputChange = (field: keyof CreateParticipantForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatWhatsAppNumber = (value: string) => {
    // Remove all non-digits and spaces
    const digits = value.replace(/\D/g, '').replace(/\s/g, '');
    
    // If starts with 0, replace with +62
    if (digits.startsWith('0')) {
      return '+62' + digits.substring(1);
    }
    
    // If starts with 62, add +
    if (digits.startsWith('62')) {
      return '+' + digits;
    }
    
    // If doesn't start with 62 or 0, assume it's local number
    if (digits.length > 0 && !digits.startsWith('62')) {
      return '+62' + digits;
    }
    
    return value;
  };

  const handleWhatsAppChange = (value: string) => {
    const formatted = formatWhatsAppNumber(value);
    handleInputChange('whatsapp_number', formatted);
  };

  const validateNIP = (nip: string) => {
    // NIP should be 18 digits
    return /^\d{18}$/.test(nip);
  };

  const validateWhatsApp = (number: string) => {
    // Should start with +62 and have 10-13 digits after (no spaces)
    return /^\+62\d{10,13}$/.test(number);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp_number || !formData.nip) {
      error('Please fill in all required fields');
      return;
    }

    if (!validateNIP(formData.nip)) {
      error('NIP must be exactly 18 digits');
      return;
    }

    if (!validateWhatsApp(formData.whatsapp_number)) {
      error('Please enter a valid Indonesian WhatsApp number');
      return;
    }

    try {
      setLoading(true);
      await participantsApi.create(formData);
      success('Participant created successfully!');
      onSuccess();
      onClose();
      resetForm();
    } catch {
      error('Failed to create participant');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      whatsapp_number: '',
      nip: '',
      seksi: SEKSI_OPTIONS[0],
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl m-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add New Participant</h2>
            <p className="text-sm text-gray-600 mt-1">
              Add a new employee to the participants list
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* NIP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IdCard className="w-4 h-4 inline mr-2" />
                NIP (Nomor Induk Pegawai) *
              </label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => handleInputChange('nip', e.target.value.replace(/\D/g, '').substring(0, 18))}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="18 digit employee number"
                maxLength={18}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter 18-digit employee identification number
              </p>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                WhatsApp Number *
              </label>
              <div className="relative">
                <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 hover:border-gray-300">
                  <div className="flex items-center bg-gray-100 px-3 py-3 border-r border-gray-200">
                    <span className="text-sm mr-2">🇮🇩</span>
                    <span className="text-sm text-gray-600 font-medium">+62</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.whatsapp_number.replace('+62 ', '').replace('+62', '').replace(/\s/g, '')}
                    onChange={(e) => handleWhatsAppChange(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm bg-white focus:outline-none"
                    placeholder="8123456789"
                    required
                  />
                </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter Indonesian mobile number without spaces (will be formatted automatically)
              </p>
            </div>
            </div>

            {/* Seksi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Seksi *
              </label>
              <select
                value={formData.seksi}
                onChange={(e) => handleInputChange('seksi', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                required
              >
                {SEKSI_OPTIONS.map((seksi) => (
                  <option key={seksi} value={seksi}>
                    {seksi}
                  </option>
                ))}
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">
                    Participant Information
                  </h4>
                  <p className="text-sm text-blue-700">
                    This participant will be available for meeting assignments and will receive WhatsApp notifications when designated as an attendee.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 border-t border-gray-200 p-6 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all',
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
            )}
          >
            {loading ? 'Creating...' : 'Add Participant'}
          </button>
        </div>
      </div>
    </div>
  );
};