import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import '../../styles/CategoryRegistration.css';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useForm } from 'react-hook-form';

const StatusRegistration = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      statusName: '',
      statusType: '',
      notes: '',
      showInList: true,
      defaultStatus: false
    }
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
            currentPage="New Status"
            rootNavigatePage="/More/ViewStatus"
            title="New Status"
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

export default StatusRegistration;
