import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Camera, Lock, Save, X } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await updateProfile(profileData, profilePhoto || undefined);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setProfilePhoto(null);
      setPreviewUrl(null);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setProfilePhoto(null);
    setPreviewUrl(null);
    setError('');
    setMessage('');
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-8 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Profile Settings</h1>
                <p className="text-gray-500">Manage your account information and security</p>
              </div>
              <button
                onClick={logout}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-300 shadow-sm flex items-center justify-center whitespace-nowrap"
              >
                Logout
              </button>
            </div>

            {message && (
              <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Profile Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    Profile Information
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>

                {/* Profile Photo */}
                <div className="flex items-center space-x-5 mb-6">
                  <div className="relative">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-lg ring-4 ring-blue-50">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : user?.profile_photo ? (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/uploads/profiles/${user.profile_photo}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-12 h-12 text-blue-300" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2.5 cursor-pointer hover:bg-blue-700 transition-colors duration-200 shadow-md ring-2 ring-white">
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      {user?.role}
                    </p>
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </div>
                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-base text-gray-900 font-medium">{user?.full_name || 'Not set'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-base text-gray-900 font-medium">{user?.email || 'Not set'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-base text-gray-900 font-medium">{user?.phone || 'Not set'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Change */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-blue-500" />
                    Security
                  </h2>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l2.257-2.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                      Change Password
                    </button>
                  )}
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                        minLength={8}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>
                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelPasswordChange}
                        className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Password</label>
                      <p className="text-base text-gray-900 font-medium">••••••••</p>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Keep your account secure by using a strong password with a mix of letters, numbers, and symbols
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
