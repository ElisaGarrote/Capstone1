import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import '../../styles/CategoryRegistration.css';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useForm } from 'react-hook-form';

const DepreciationEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Sample data for different depreciation IDs
  const depreciationData = {
    1: { 
      depreciationName: 'iPhone Depreciation', 
      duration: '24', 
      minimumValue: '2000', 
      notes: 'Standard depreciation for mobile devices' 
    },
    2: { 
      depreciationName: 'Laptop Depreciation', 
      duration: '36', 
      minimumValue: '5000', 
      notes: 'Standard depreciation for laptop computers' 
    }
  };

  const currentDepreciation = depreciationData[id] || depreciationData[1];

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: currentDepreciation
  });

  const onSubmit = (data) => {
    // Here you would typically send the data to your API
    console.log('Form submitted:', data);

    // Optional: navigate back to depreciation view after successful submission
    navigate('/More/ViewDepreciations');
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Depreciations"
            currentPage="Edit Depreciation"
            rootNavigatePage="/More/ViewDepreciations"
            title={`Edit Depreciation - ${currentDepreciation.depreciationName}`}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label htmlFor="depreciationName">Depreciation Name *</label>
              <input
                type="text"
                placeholder="Depreciation Name"
                maxLength="100"
                className={errors.depreciationName ? 'input-error' : ''}
                {...register("depreciationName", { required: 'Depreciation Name is required' })}
              />
              {errors.depreciationName && <span className='error-message'>{errors.depreciationName.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor="duration">Duration (in months) *</label>
              <input
                type="number"
                placeholder="Duration in months"
                min="1"
                max="120"
                className={errors.duration ? 'input-error' : ''}
                {...register("duration", { 
                  required: 'Duration is required',
                  min: { value: 1, message: 'Duration must be at least 1 month' },
                  max: { value: 120, message: 'Duration cannot exceed 120 months' }
                })}
              />
              {errors.duration && <span className='error-message'>{errors.duration.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor="minimumValue">Minimum Value *</label>
              <input
                type="number"
                placeholder="Minimum Value (PHP)"
                min="0"
                step="0.01"
                className={errors.minimumValue ? 'input-error' : ''}
                {...register("minimumValue", { 
                  required: 'Minimum Value is required',
                  min: { value: 0, message: 'Minimum Value cannot be negative' }
                })}
              />
              {errors.minimumValue && <span className='error-message'>{errors.minimumValue.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                placeholder="Enter any additional notes about this depreciation..."
                rows="4"
                maxLength="500"
                {...register("notes")}
              />
            </fieldset>

            <button type="submit" className="save-btn">Save</button>
          </form>
        </section>
      </main>
    </>
  );
};

export default DepreciationEdit;
