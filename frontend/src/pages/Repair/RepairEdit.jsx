import NavBar from "../../components/NavBar"
import "../../styles/MaintenanceRegistration.css"
import { useNavigate, useParams } from "react-router-dom";
import CloseIcon from "../../assets/icons/close.svg"
import { useState, useEffect } from "react";

export default function RepariEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const currentDate = new Date().toISOString().split("T")[0];
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [maintenanceData, setMaintenanceData] = useState({
        assetId: "",
        assetName: "",
        supplier: "",
        maintenanceType: "",
        maintenanceName: "",
        startDate: "",
        endDate: "",
        cost: "",
        notes: "",
        attachmentName: ""
    });

    // Simulate fetching maintenance details
    useEffect(() => {
        // In a real app, this would be an API call
        setTimeout(() => {
            // Mock data for demonstration - this would be fetched from API based on id
            const mockData = {
                assetId: "100002",
                assetName: "iPhone 16 Pro Max",
                supplier: "Newegg",
                maintenanceType: "Hardware",
                maintenanceName: "Serviced battery",
                startDate: "2025-04-20",
                endDate: "2025-04-25",
                cost: "150.00",
                notes: "Replaced battery due to reduced capacity. Battery health was at 78%.",
                attachmentName: "battery_replacement_receipt.pdf"
            };

            setMaintenanceData(mockData);
            if (mockData.attachmentName) {
                setAttachmentFile({ name: mockData.attachmentName });
            }
            setIsLoading(false);
        }, 500); // Simulate loading delay
    }, [id]);

    const handleFileSelection = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAttachmentFile(file);
        } else {
            setAttachmentFile(null);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMaintenanceData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would send the updated data to your API
        console.log("Submitting updated maintenance data:", maintenanceData);
        // Navigate back after successful update
        navigate('/dashboard/Repair/Maintenance');
    }

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this maintenance record?")) {
            // Delete logic would go here (API call in real app)
            console.log("Deleting maintenance record:", id);
            navigate('/dashboard/Repair/Maintenance');
        }
    }

    if (isLoading) {
        return (
            <div className="maintenance-page-container">
                <NavBar />
                <div className="maintenance-page-content">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="maintenance-page-container">
            <NavBar />

            <div className="maintenance-page-content">
                <div className="breadcrumb">
                    <span className="root-link" onClick={() => navigate('/dashboard/Repair/Maintenance')}>Asset Repairs</span>
                    <span className="separator"> / </span>
                    <span className="current-page">Edit Repair</span>
                </div>

                <div className="page-header">
                    <h1 className="page-title">{maintenanceData.maintenanceName}</h1>
                    <button className="delete-btn" onClick={handleDelete}>
                        <i className="fa fa-trash"></i> Delete
                    </button>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="asset">Asset <span className="required">*</span></label>
                            <div className="selected-field">
                                <span>{maintenanceData.assetId} - {maintenanceData.assetName}</span>
                                <button type="button" className="clear-selection" onClick={() => {
                                    setMaintenanceData(prev => ({
                                        ...prev,
                                        assetId: "",
                                        assetName: ""
                                    }));
                                }}>×</button>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="supplier">Supplier</label>
                            <div className="selected-field">
                                <span>{maintenanceData.supplier}</span>
                                <button type="button" className="clear-selection" onClick={() => {
                                    setMaintenanceData(prev => ({
                                        ...prev,
                                        supplier: ""
                                    }));
                                }}>×</button>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="maintenanceType">Repair Type <span className="required">*</span></label>
                            <div className="select-wrapper">
                                <select
                                    name="maintenanceType"
                                    id="maintenanceType"
                                    required
                                    className="form-input"
                                    value={maintenanceData.maintenanceType}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Repair Type</option>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Software">Software</option>
                                    <option value="Inspection">Inspection</option>
                                    <option value="Calibration">Calibration</option>
                                    <option value="Cleaning">Cleaning</option>
                                </select>
                                <span className="dropdown-arrow"></span>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="maintenanceName">Repair Name <span className="required">*</span></label>
                            <input
                                type="text"
                                name="maintenanceName"
                                id="maintenanceName"
                                placeholder="Repair Name"
                                maxLength="100"
                                required
                                className="form-input"
                                value={maintenanceData.maintenanceName}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="startDate">Start Date <span className="required">*</span></label>
                            <div className="date-picker-wrapper">
                                <input
                                    type="date"
                                    name="startDate"
                                    id="startDate"
                                    required
                                    className="form-input"
                                    value={maintenanceData.startDate}
                                    onChange={handleInputChange}
                                />
                                <span className="calendar-icon"></span>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="endDate">End Date</label>
                            <div className="date-picker-wrapper">
                                <input
                                    type="date"
                                    name="endDate"
                                    id="endDate"
                                    className="form-input"
                                    value={maintenanceData.endDate}
                                    onChange={handleInputChange}
                                />
                                <span className="calendar-icon"></span>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="cost">Cost</label>
                            <div className="cost-input">
                                <span className="currency">PHP</span>
                                <input
                                    type="text"
                                    name="cost"
                                    id="cost"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.00"
                                    className="form-input"
                                    value={maintenanceData.cost}
                                    onChange={(e) => {
                                        // Allow only numbers and a single decimal point
                                        const value = e.target.value.replace(/[^0-9.]/g, '');
                                        const decimalCount = (value.match(/\./g) || []).length;
                                        if (decimalCount <= 1) {
                                            setMaintenanceData(prev => ({
                                                ...prev,
                                                cost: value
                                            }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                name="notes"
                                id="notes"
                                maxLength="500"
                                rows="6"
                                className="form-input"
                                value={maintenanceData.notes}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>

                        <div className="form-field">
                            <label>Attachments</label>
                            <div className="attachments-container">
                                <div className="file-upload-area">
                                    <button className="choose-file-btn" onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById("attachment").click();
                                    }}>
                                        Choose File
                                    </button>
                                    <input
                                        type="file"
                                        name="attachment"
                                        id="attachment"
                                        onChange={handleFileSelection}
                                        style={{ display: "none" }}
                                    />
                                    <p className="file-size-limit">Maximum file size must be 5MB</p>
                                </div>

                                {attachmentFile ? (
                                    <div className="file-selected">
                                        <p className="file-name">{attachmentFile.name}</p>
                                        <button
                                            className="remove-file-btn"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setAttachmentFile(null);
                                                document.getElementById("attachment").value = "";
                                                setMaintenanceData(prev => ({
                                                    ...prev,
                                                    attachmentName: ""
                                                }));
                                            }}
                                        >
                                            <img src={CloseIcon} alt="Remove file" />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="no-file">No file chosen</p>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}