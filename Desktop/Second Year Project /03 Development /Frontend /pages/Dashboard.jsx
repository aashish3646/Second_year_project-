import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome to Dashboard</h1>
          {user && (
            <div style={styles.userInfo}>
              <h2 style={styles.userInfoH2}>User Information</h2>
              <p style={styles.userInfoP}><strong>Name:</strong> {user.name || 'N/A'}</p>
              <p style={styles.userInfoP}><strong>Email:</strong> {user.email}</p>
              <p style={styles.userInfoP}><strong>User ID:</strong> {user.id}</p>
              {user.date_joined && (
                <p style={styles.userInfoP}><strong>Member since:</strong> {new Date(user.date_joined).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
    fontSize: '32px',
  },
  userInfo: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  userInfoH2: {
    marginBottom: '15px',
    color: '#333',
  },
  userInfoP: {
    marginBottom: '10px',
    fontSize: '16px',
    color: '#555',
  },
};

export default Dashboard;

