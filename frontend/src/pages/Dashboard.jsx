import React from 'react';
import NavBar from "../components/NavBar";
import StatusCard from '../components/dashboard/StatusCard';
import AssetMetrics from '../components/dashboard/AssetMetrics';
import "../styles/Dashboard.css";

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

        <AssetMetrics />
      </main>
    </div>
  );
}

export default Dashboard;