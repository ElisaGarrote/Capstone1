import React from 'react';
import NavBar from '../../components/NavBar';
import Status from '../../components/Status';
import MediumButtons from '../../components/buttons/MediumButtons';
import { BsKeyboard } from 'react-icons/bs';
import { LuDroplet } from 'react-icons/lu';
import { HiOutlineTag } from 'react-icons/hi';
import { RxPerson } from 'react-icons/rx';
import '../../styles/Reports.css';
import '../../styles/UpcomingEndOfLife.css';

const ActivityReport = () => {
  const activities = [
    {
      date: "Apr 2, 2023",
      user: "Chippy McDonald",
      type: "Accessory",
      event: "Checkout",
      item: "Magsafe Charger",
      toFrom: "Xiaomie Ocho",
      notes: "-"
    },
    {
      date: "Apr 2, 2023",
      user: "Renan Piotas",
      type: "Consumable",
      event: "Checkin",
      item: "Magic Keyboard",
      toFrom: "Xiaomie Ocho",
      notes: "-"
    },
    {
      date: "Apr 2, 2023",
      user: "Xiaomie Ocho",
      type: "Asset",
      event: "Update",
      item: "100003 - XPS13",
      toFrom: "Xiaomie Ocho",
      notes: "-"
    },
    {
      date: "Apr 2, 2023",
      user: "May Pomona",
      type: "Asset",
      event: "Checkout",
      item: '100003 - MacBook Pro 16"',
      toFrom: "Xiaomie Ocho",
      notes: "-"
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Asset':
        return <HiOutlineTag className="type-icon" />;
      case 'Accessory':
        return <BsKeyboard className="type-icon" />;
      case 'Consumable':
        return <LuDroplet className="type-icon" />;
      default:
        return <HiOutlineTag className="type-icon" />;
    }
  };

  const getEventStatus = (event) => {
    switch (event.toLowerCase()) {
      case 'checkout':
        return 'undeployable';
      case 'checkin':
        return 'deployable';
      case 'update':
        return 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <>
      <NavBar />
      <main className="reports-page">
        <div className="reports-container">
          <h1>Activity Report</h1>

          <div className="table-container">
            <div className="table-header">
              <div className="header-left">
                <h2>Activity Log</h2>
              </div>
              <div className="header-right">
                <input
                  type="text"
                  placeholder="Search..."
                  className="search-input"
                />
                <MediumButtons type="export" navigatePage="" />
              </div>
            </div>

            <table className="table activity-table activity-report-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>USER</th>
                  <th>TYPE</th>
                  <th>EVENT</th>
                  <th>ITEM</th>
                  <th>TO/FROM</th>
                  <th>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, index) => (
                  <tr key={index}>
                    <td><div className="cell-content">{activity.date}</div></td>
                    <td><div className="cell-content">{activity.user}</div></td>
                    <td>
                      <div className="type-info">
                        {getTypeIcon(activity.type)}
                        <span>{activity.type}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-container">
                        <Status
                          type={getEventStatus(activity.event)}
                          name={activity.event}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="asset-cell">
                        <a href="#" className="asset-link">
                          {activity.item}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        <RxPerson className="user-icon" />
                        <a href="#" className="user-link">{activity.toFrom}</a>
                      </div>
                    </td>
                    <td><div className="cell-content">{activity.notes}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
};

export default ActivityReport;