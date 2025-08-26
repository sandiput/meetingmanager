import React, { useState, useEffect } from 'react';
import { dashboardApi, meetingsApi, participantsApi, settingsApi } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const TestConnection: React.FC = () => {
  const [dashboardStatus, setDashboardStatus] = useState<{ success: boolean; message: string; loading: boolean }>({
    success: false,
    message: '',
    loading: true
  });
  
  const [meetingsStatus, setMeetingsStatus] = useState<{ success: boolean; message: string; loading: boolean }>({
    success: false,
    message: '',
    loading: true
  });
  
  const [participantsStatus, setParticipantsStatus] = useState<{ success: boolean; message: string; loading: boolean }>({
    success: false,
    message: '',
    loading: true
  });
  
  const [settingsStatus, setSettingsStatus] = useState<{ success: boolean; message: string; loading: boolean }>({
    success: false,
    message: '',
    loading: true
  });

  const testDashboardConnection = async () => {
    setDashboardStatus({ success: false, message: '', loading: true });
    try {
      const response = await dashboardApi.getStats();
      setDashboardStatus({
        success: true,
        message: 'Berhasil terhubung ke API Dashboard',
        loading: false
      });
    } catch (error) {
      setDashboardStatus({
        success: false,
        message: `Gagal terhubung ke API Dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
        loading: false
      });
    }
  };

  const testMeetingsConnection = async () => {
    setMeetingsStatus({ success: false, message: '', loading: true });
    try {
      const response = await meetingsApi.getUpcoming();
      setMeetingsStatus({
        success: true,
        message: 'Berhasil terhubung ke API Meetings',
        loading: false
      });
    } catch (error) {
      setMeetingsStatus({
        success: false,
        message: `Gagal terhubung ke API Meetings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        loading: false
      });
    }
  };

  const testParticipantsConnection = async () => {
    setParticipantsStatus({ success: false, message: '', loading: true });
    try {
      const response = await participantsApi.getAll();
      setParticipantsStatus({
        success: true,
        message: 'Berhasil terhubung ke API Participants',
        loading: false
      });
    } catch (error) {
      setParticipantsStatus({
        success: false,
        message: `Gagal terhubung ke API Participants: ${error instanceof Error ? error.message : 'Unknown error'}`,
        loading: false
      });
    }
  };

  const testSettingsConnection = async () => {
    setSettingsStatus({ success: false, message: '', loading: true });
    try {
      const response = await settingsApi.get();
      setSettingsStatus({
        success: true,
        message: 'Berhasil terhubung ke API Settings',
        loading: false
      });
    } catch (error) {
      setSettingsStatus({
        success: false,
        message: `Gagal terhubung ke API Settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        loading: false
      });
    }
  };

  const testAllConnections = () => {
    testDashboardConnection();
    testMeetingsConnection();
    testParticipantsConnection();
    testSettingsConnection();
  };

  useEffect(() => {
    testAllConnections();
  }, []);

  const renderStatus = (status: { success: boolean; message: string; loading: boolean }) => {
    if (status.loading) {
      return (
        <div className="flex items-center">
          <Spinner size="sm" />
          <span className="ml-2">Menguji koneksi...</span>
        </div>
      );
    }

    return (
      <Alert variant={status.success ? 'success' : 'danger'}>
        {status.message}
      </Alert>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Uji Konektivitas API</h1>
      <p className="mb-4">Halaman ini menguji konektivitas antara frontend dan backend API.</p>
      
      <Button onClick={testAllConnections} className="mb-6">
        Uji Ulang Semua Koneksi
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <Card.Header>Dashboard API</Card.Header>
          <Card.Body>
            {renderStatus(dashboardStatus)}
            <Button onClick={testDashboardConnection} size="sm" className="mt-2">
              Uji Ulang
            </Button>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>Meetings API</Card.Header>
          <Card.Body>
            {renderStatus(meetingsStatus)}
            <Button onClick={testMeetingsConnection} size="sm" className="mt-2">
              Uji Ulang
            </Button>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>Participants API</Card.Header>
          <Card.Body>
            {renderStatus(participantsStatus)}
            <Button onClick={testParticipantsConnection} size="sm" className="mt-2">
              Uji Ulang
            </Button>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>Settings API</Card.Header>
          <Card.Body>
            {renderStatus(settingsStatus)}
            <Button onClick={testSettingsConnection} size="sm" className="mt-2">
              Uji Ulang
            </Button>
          </Card.Body>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Informasi Koneksi</h2>
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://api.local/api'}</p>
      </div>
    </div>
  );
};

export default TestConnection;