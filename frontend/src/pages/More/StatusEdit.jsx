import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import '../../styles/CategoryRegistration.css';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useForm } from 'react-hook-form';

const StatusEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Sample data for different status IDs
  const statusData = {
    1: { statusName: 'Deployable', statusType: 'asset', notes: 'Ready to be deployed to users', showInList: true, defaultStatus: true },
    2: { statusName: 'Deployed', statusType: 'asset', notes: 'Currently in use by a user', showInList: true, defaultStatus: false },
    3: { statusName: 'Pending', statusType: 'asset', notes: 'Awaiting approval or processing', showInList: true, defaultStatus: false },
    4: { statusName: 'Archived', statusType: 'asset', notes: 'No longer in active use', showInList: false, defaultStatus: false },
    5: { statusName: 'Undeployable', statusType: 'asset', notes: 'Cannot be deployed due to issues', showInList: true, defaultStatus: false }
  };

  const currentStatus = statusData[id] || statusData[1];

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: currentStatus
  });

  const statusTypes = ['Asset', 'Accessory', 'Consumable', 'Component', 'License'];

  const onSubmit = (data) => {
    // Here you would typically send the data to your API
    console.log('Form submitted:', data);

    // Optional: navigate back to status view after successful submission
    navigate('/More/ViewStatus');
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Statuses"
            currentPage="Edit Status"
            rootNavigatePage="/More/ViewStatus"
            title={`Edit Status - ${currentStatus.statusName}`}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label htmlFor="statusName">Status Name *</label>
              <input
                type="text"
                placeholder="Status Name"
                maxLength="100"
                className={errors.statusName ? 'input-error' : ''}
                {...register("statusName", { required: 'Status Name is required' })}
              />
              {errors.statusName && <span className='error-message'>{errors.statusName.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor="statusType">Status Type *</label>
              <select
                className={errors.statusType ? 'input-error' : ''}
                {...register("statusType", { required: 'Status Type is required' })}
              >
                <option value="">Select Status Type</option>
                {statusTypes.map((type, idx) => (
                  <option key={idx} value={type.toLowerCase()}>{type}</option>
                ))}
              </select>
              {errors.statusType && <span className='error-message'>{errors.statusType.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                placeholder="Enter any additional notes about this status..."
                rows="4"
                maxLength="500"
                {...register("notes")}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="showInList" className="checkbox-label">
                <input
                  type="checkbox"
                  {...register("showInList")}
                />
                Show in Status List
              </label>
            </fieldset>

            <fieldset>
              <label htmlFor="defaultStatus" className="checkbox-label">
                <input
                  type="checkbox"
                  {...register("defaultStatus")}
                />
                Set as Default Status
              </label>
            </fieldset>

            <button type="submit" className="save-btn">Save</button>
          </form>
        </section>
      </main>
    </>
  );
};

export default StatusEdit;
