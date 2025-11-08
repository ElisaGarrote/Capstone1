import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";

const UploadModal = ({ 
  isOpen, 
  onClose, 
  onUpload,
  title = "Upload File"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    watch
  } = useForm({
    mode: "all"
  });

  const notes = watch("notes", "");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError("");
    
    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileError("File size must be less than 5MB");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      setFileError("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("notes", data.notes || "");
      
      await onUpload(formData);
      reset();
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileError("Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedFile(null);
    setFileError("");
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{title}</h2>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={handleClose}
          >
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <div className="modal-body">
            {/* File Upload Field */}
            <fieldset>
              <label htmlFor="file">
                File <span style={{color: 'red'}}>*</span>
              </label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="file-input"
                  disabled={isLoading}
                />
                <label htmlFor="file" className="file-upload-label">
                  Choose File
                </label>
                {selectedFile && (
                  <span className="file-name">{selectedFile.name}</span>
                )}
              </div>
              <span className="file-size-hint">Maximum file size must be 5MB</span>
              {fileError && (
                <span className="error-message">{fileError}</span>
              )}
            </fieldset>

            {/* Notes Field */}
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                placeholder="Add any notes about this file (optional)"
                maxLength={500}
                {...register("notes")}
                className={errors.notes ? 'input-error' : ''}
                disabled={isLoading}
              />
              <span className="char-count">{notes.length}/500</span>
              {errors.notes && (
                <span className="error-message">
                  {errors.notes.message}
                </span>
              )}
            </fieldset>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="modal-cancel-btn"
              onClick={handleClose}
              disabled={isLoading}
            >
              Close
            </button>
            <button 
              type="submit" 
              className="modal-save-btn"
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

