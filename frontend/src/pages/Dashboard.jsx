import React from 'react';
import NavBar from "../components/NavBar";
import StatusCard from '../components/dashboard/StatusCard';
import ActivityTable from '../components/dashboard/ActivityTable';
import AssetMetrics from '../components/dashboard/AssetMetrics';
import "../styles/Dashboard.css";
import "../styles/dashboard/ActivityLog.css";

const statusCards = [
  { number: '1', title: 'Due for Return' },
  { number: '2', title: 'Upcoming Audits' },
  { number: '14', title: 'Upcoming End of Life' },
  { number: '1', title: 'Expiring Warranties' },
  { number: '1', title: 'Overdue for Return' },
  { number: '3', title: 'Overdue Audits' },
  { number: '21', title: 'Reached End of Life' },
  { number: '20', title: 'Expired Warranties', isRed: true },
  { number: '20', title: 'Low Stock', isRed: true }
];

const activityLogData = [
  {
    date: 'April 5, 2024 10:30 PM',
    user: 'Philipp McDonald',
    type: 'Accessory',
    event: 'Checkout',
    item: 'Magnetic Charger',
    location: 'General Santos',
    notes: 'Changed quantity from 50 to 45'
  },
  {
    date: 'April 5, 2024 10:15 PM',
    user: 'Randy Green',
    type: 'Consumable',
    event: 'Update',
    item: 'Single Adapter',
    location: 'Makati',
    notes: ''
  },
  {
    date: 'April 5, 2024 10:00 PM',
    user: 'Amanda Cruz',
    type: 'Asset',
    event: 'Update',
    item: 'EVGA - rtx',
    location: 'Makati',
    notes: ''
  },
  {
    date: 'April 5, 2024 9:45 PM',
    user: 'Raymond John Henry',
    type: 'Asset',
    event: 'Update',
    item: 'EVGA - rtx',
    location: 'Makati',
    notes: ''
  },
  {
    date: 'April 5, 2024 9:30 PM',
    user: 'Roy Charles',
    type: 'Asset',
    event: 'Checkout',
    item: 'EVGA - Hardware Parts',
    location: 'Makati',
    notes: ''
  },
  {
    date: 'April 5, 2024 9:15 PM',
    user: 'Philipp McDonald',
    type: 'Accessory',
    event: 'Checkout',
    item: 'Magnetic Charger',
    location: 'General Santos',
    notes: ''
  },
  {
    date: 'April 5, 2024 9:00 PM',
    user: 'Rachel Fields',
    type: 'Consumable',
    event: 'Update',
    item: 'Single Adapter',
    location: 'Makati',
    notes: ''
  },
  {
    date: 'April 5, 2024 8:45 PM',
    user: 'Amanda Cruz',
    type: 'Asset',
    event: 'Update',
    item: 'EVGA - rtx',
    location: 'Makati',
    notes: ''
  }
];

function Dashboard() {
  return (
    <div className="dashboard-container">
      <NavBar />
      <main className="dashboard-content">
        <h1>Dashboard</h1>
        <div className="status-cards-grid">
          {statusCards.map((card, index) => (
            <StatusCard 
              key={index} 
              {...card} 
              index={index}
            />
          ))}
        </div>
        
        <div className="activity-log-section">
          <div className="activity-log-header">
          </div>
          <ActivityTable activities={activityLogData} />
        </div>

        <AssetMetrics />
      </main>
    </div>
  );
}

export default Dashboard;