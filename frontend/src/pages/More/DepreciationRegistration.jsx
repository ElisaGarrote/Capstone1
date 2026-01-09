import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Alert from "../../components/Alert";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import Footer from "../../components/Footer";
import DeleteModal from "../../components/Modals/DeleteModal";
import contextsApi from '../../api/contextsApi'

const DepraciationRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editState = location.state?.depreciation || null;
  const isEdit = !!editState;
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      name: editState?.name || "",
      duration: editState?.duration || "",
      minimumValue: (editState?.minimum_value ?? editState?.minimumValue) || "",
    },
  });

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!editState) return
      // If editState contains an id, fetch the latest record from server
      try {
        if (editState.id) {
          const res = await contextsApi.get(`/depreciations/${editState.id}/`)
          const data = res.data
          if (!mounted) return
          setValue('name', data.name || '')
          setValue('duration', data.duration || '')
          setValue('minimumValue', data.minimum_value ?? '')
        } else {
          setValue('name', editState.name || '')
          setValue('duration', editState.duration || '')
          setValue('minimumValue', (editState.minimum_value ?? editState.minimumValue) || '')
        }
      } catch (err) {
        console.error('Failed to load depreciation for edit', err)
        setErrorMessage('Failed to load depreciation details.')
      }
    }
    load()
    return () => { mounted = false }
  }, [editState, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const payload = {
        name: data.name,
        duration: Number(data.duration),
        minimum_value: Number(data.minimumValue),
      }
      if (isEdit && editState?.id) {
        await contextsApi.patch(`/depreciations/${editState.id}/`, payload)
        // Navigate to list with success alert
        navigate('/More/Depreciations', { state: { successMessage: 'Depreciation updated successfully.' } });
        return
      } else {
        await contextsApi.post('/depreciations/', payload)
        navigate('/More/Depreciations', { state: { successMessage: 'Depreciation created successfully.' } });
        return
      }
    } catch (err) {
      console.error('Save failed', err)
      setErrorMessage(err?.response?.data?.detail || 'Save failed. See console for details.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleDeleteConfirm = () => {
    // Call API to delete
    (async () => {
      try {
        if (editState?.id) {
          await contextsApi.delete(`/depreciations/${editState.id}/`)
          // navigate back to list with success message
          navigate('/More/Depreciations', { state: { successMessage: 'Depreciation deleted.' } });
          return
        }
      } catch (err) {
        console.error('Delete failed', err)
        setErrorMessage('Delete failed. See console for details.')
        setTimeout(() => setErrorMessage(''), 5000)
      } finally {
        navigate('/More/Depreciations')
      }
    })()
  };

  return (
    <>
      {isDeleteModalOpen && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
          onConfirm={handleDeleteConfirm}
          targetIds={editState?.id ? [editState.id] : []}
          selectedCount={1}
          entityType="depreciation"
        />
      )}
      <section className="page-layout-registration">
        <NavBar />
        <main className="registration">
          {errorMessage && <Alert message={errorMessage} type="danger" />}
          {successMessage && <Alert message={successMessage} type="success" />}
          <section className="top">
            <TopSecFormPage
              root="Depreciations"
              currentPage={isEdit ? "Update Depreciation" : "New Depreciation"}
              rootNavigatePage="/More/Depreciations"
              title={isEdit ? editState?.name || "Update Depreciation" : "New Depreciation"}
              buttonType={isEdit ? "delete" : undefined}
              deleteModalOpen={isEdit ? () => setDeleteModalOpen(true) : undefined}
            />
          </section>
          <section className="registration-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Name */}
              <fieldset>
                <label htmlFor="name">
                  Name<span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter depreciation name"
                  maxLength="100"
                  className={errors.name ? "input-error" : ""}
                  {...register("name", {
                    required: "Depreciation name is required",
                  })}
                />
                {errors.name && (
                  <span className="error-message">
                    {errors.name.message}
                  </span>
                )}
              </fieldset>

              {/* Duration */}
              <fieldset>
                <label htmlFor="duration">
                  Duration<span className="required-asterisk">*</span>
                </label>
                <div
                  className={`cost-input-group ${
                    errors.duration ? "input-error" : ""
                  }`}
                >
                  <input
                    type="number"
                    id="duration"
                    placeholder="Enter depreciation duration"
                    min="1"
                    step="1"
                    {...register("duration", {
                      required: "Duration is required",
                      valueAsNumber: true,
                      validate: (value) =>
                        (Number.isInteger(value) && value > 0) ||
                        "Must be a positive integer",
                    })}
                  />
                  <span className="duration-addon">Months</span>
                </div>
                {errors.duration && (
                  <span className="error-message">{errors.duration.message}</span>
                )}
              </fieldset>

              {/* Minimum Value */}
              <fieldset className="cost-field">
                <label htmlFor="minimumValue">
                  Minimum Value<span className="required-asterisk">*</span>
                </label>
                <div
                  className={`cost-input-group ${
                    errors.minimumValue ? "input-error" : ""
                  }`}
                >
                  <span className="cost-addon">PHP</span>
                  <input
                    type="number"
                    id="minimumValue"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    {...register("minimumValue", {
                      required: "Minimum value is required",
                      valueAsNumber: true,
                      validate: (value) =>
                        value > 0 || "Must be a positive number",
                    })}
                  />
                </div>
                {errors.minimumValue && (
                  <span className="error-message">{errors.minimumValue.message}</span>
                )}
              </fieldset>

              {/* Submit */}
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </form>
          </section>
        </main>
        <Footer />
      </section>
    </>
  );
};

export default DepraciationRegistration;
