import React from 'react';
import PropTypes from 'prop-types';
import { BsKeyboard } from 'react-icons/bs';
import { LuDroplet } from 'react-icons/lu';
import { HiTag } from 'react-icons/hi';
import { RxPerson } from 'react-icons/rx';
import '../../styles/dashboard/ActivityLog.css';

const ActivityTable = () => {
  const activities = [
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "Chippy McDonald",
      type: "Accessory",
      event: "Checkout",
      item: "Magsafe Charger",
      toFrom: "Xiaomie Ocho"
    },
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "Renan Piotas",
      type: "Consumable",
      event: "Checkin",
      item: "Magic Keyboard",
      toFrom: "Xiaomie Ocho"
    },
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "Xiaomie Ocho",
      type: "Asset",
      event: "Update",
      item: "100003 - XPS13",
      toFrom: "Xiaomie Ocho"
    },
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "Reymundo Jane Nova",
      type: "Asset",
      event: "Update",
      item: "100007 - Yoga 7",
      toFrom: "Xiaomie Ocho"
    },
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "May Pomona",
      type: "Asset",
      event: "Checkout",
      item: '100003 - MacBook Pro 16"',
      toFrom: "Xiaomie Ocho"
    },
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "Chippy McDonald",
      type: "Accessory",
      event: "Checkout",
      item: "Magsafe Charger",
      toFrom: "Xiaomie Ocho"
    },
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "Renan Piotas",
      type: "Consumable",
      event: "Checkin",
      item: "Magic Keyboard",
      toFrom: "Xiaomie Ocho"
    },
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "Xiaomie Ocho",
      type: "Asset",
      event: "Update",
      item: "100003 - XPS13",
      toFrom: "Xiaomie Ocho"
    },
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "Reymundo Jane Nova",
      type: "Asset",
      event: "Update",
      item: "100007 - Yoga 7",
      toFrom: "Xiaomie Ocho"
    },
    {
      date: "April 2, 2023 11:59:00 PM",
      user: "May Pomona",
      type: "Asset",
      event: "Checkout",
      item: '100003 - MacBook Pro 16"',
      toFrom: "Xiaomie Ocho"
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'Asset':
        return <HiTag className="activity-icon" />;
      case 'Accessory':
        return <BsKeyboard className="activity-icon" />;
      case 'Consumable':
        return <LuDroplet className="activity-icon" />;
      default:
        return <HiTag className="activity-icon" />;
    }
  };

  const getEventStyle = (event) => {
    switch (event.toLowerCase()) {
      case 'checkout':
        return 'event-status checkout';
      case 'checkin':
        return 'event-status checkin';
      case 'update':
        return 'event-status update';
      default:
        return 'event-status';
    }
  };

  return (
    <div className="activity-log-container">
      <h2 className="activity-title">Activity Log</h2>
      <div className="activity-table-wrapper">
        <table className="activity-table">
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
                <td>{activity.date}</td>
                <td>{activity.user}</td>
                <td>
                  <div className="type-cell">
                    {getIcon(activity.type)}
                    <span>{activity.type}</span>
                  </div>
                </td>
                <td>
                  <span className={getEventStyle(activity.event)}>
                    {activity.event}
                  </span>
                </td>
                <td className="item-cell">{activity.item}</td>
                <td>
                  <div className="user-cell">
                    <RxPerson size={16} fill="#0D6EFD" stroke="#0D6EFD" className="user-icon" />
                    <span className="user-link">{activity.toFrom}</span>
                  </div>
                </td>
                <td>-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="browse-all-button">Browse All</button>
    </div>
  );
};

export default ActivityTable; 