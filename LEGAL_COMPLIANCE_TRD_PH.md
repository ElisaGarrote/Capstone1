# Technical Requirements Document (TRD)
## Legal and Regulatory Compliance Requirements
### Asset Management System - Philippines

---

## Document Information

| **Field** | **Details** |
|-----------|-------------|
| **Project Name** | Asset Management System (Capstone1) |
| **Document Type** | Technical Requirements Document - Legal & Regulatory Compliance |
| **Jurisdiction** | Republic of the Philippines |
| **Version** | 1.0 |
| **Date** | February 18, 2026 |
| **Prepared For** | Capstone Project |
| **Status** | Draft |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Regulatory Framework](#2-regulatory-framework)
3. [Data Classification](#3-data-classification)
4. [Technical Requirements](#4-technical-requirements)
5. [Functional Requirements](#5-functional-requirements)
6. [Security Requirements](#6-security-requirements)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Compliance Checklist](#8-compliance-checklist)
9. [Appendices](#9-appendices)

---

## 1. Executive Summary

### 1.1 Purpose
This Technical Requirements Document (TRD) defines the legal and regulatory compliance requirements for the Asset Management System operating in the Philippines. The system processes employee personal information and asset data, making it subject to the Data Privacy Act of 2012 (R.A. 10173) and related Philippine regulations.

### 1.2 Scope
This document covers:
- Philippine Data Privacy Act (DPA) 2012 compliance requirements
- National Privacy Commission (NPC) regulations
- Philippine Labor Code considerations
- Technical implementation requirements
- Security and organizational measures

### 1.3 Stakeholders
- **System Users**: Employees whose data is collected
- **System Administrators**: IT staff managing the system
- **Data Controllers**: Management responsible for data processing
- **National Privacy Commission**: Regulatory authority
- **Internal Audit Teams**: Compliance monitoring

---

## 2. Regulatory Framework

### 2.1 Primary Legislation

#### 2.1.1 Data Privacy Act of 2012 (R.A. 10173)
**Status**: ✅ **MANDATORY**

**Key Provisions Applicable:**
- **Section 11**: General data privacy principles
- **Section 12**: Criteria for lawful processing of personal information
- **Section 13**: Sensitive personal information and privileged information
- **Section 16**: Rights of data subjects
- **Section 20**: Security of personal information
- **Section 21**: Notification and compliance requirements

**Penalties for Non-Compliance:**
- Imprisonment: 1 to 6 years
- Fines: ₱500,000 to ₱5,000,000
- Administrative fines: Up to ₱5,000,000

#### 2.1.2 NPC Circulars and Guidelines
- **NPC Circular 16-01**: Registration of Personal Information Controllers
- **NPC Circular 16-02**: Security of Personal Information
- **NPC Circular 16-03**: Data Breach Notification
- **NPC Advisory Opinion 2017-028**: Employee Monitoring

#### 2.1.3 Philippine Labor Code
- **Book III**: Employee rights and workplace monitoring
- **DOLE Department Order No. 174-17**: Data privacy in employment

### 2.2 International Standards (Recommended)
- **ISO/IEC 27001**: Information Security Management
- **ISO/IEC 19770-1**: IT Asset Management
- **ISO/IEC 29100**: Privacy Framework

---

## 3. Data Classification

### 3.1 Personal Information (PI) Collected

Based on code analysis of the Asset Management System:

#### 3.1.1 Employee Data
```
Location: backend/contexts/contexts_ms/models.py
```

| **Data Element** | **Classification** | **Legal Basis** | **Retention** |
|------------------|-------------------|-----------------|---------------|
| Employee ID | Personal Information | Legitimate Interest | 7 years after separation |
| First Name | Personal Information | Legitimate Interest | 7 years after separation |
| Last Name | Personal Information | Legitimate Interest | 7 years after separation |
| Email Address | Personal Information | Legitimate Interest | 7 years after separation |
| Phone Number | Personal Information | Legitimate Interest | 7 years after separation |
| Username | Personal Information | Legitimate Interest | 7 years after separation |
| Location Data | Personal Information | Legitimate Interest | 7 years after separation |

#### 3.1.2 Asset-Related Data
```
Location: backend/assets/assets_ms/models.py
```

| **Data Element** | **Privacy Impact** | **Retention** |
|------------------|-------------------|---------------|
| Asset ID | Low | Indefinite (business records) |
| Serial Numbers | Low | 7 years after disposal |
| IMEI Numbers | Low | 7 years after disposal |
| Purchase Cost | Low | 7 years (tax/audit) |
| Order Numbers | Low | 7 years (tax/audit) |

#### 3.1.3 Tracking Data (High Privacy Impact)
```
Location: backend/assets/assets_ms/models.py - AssetCheckout
```

| **Data Element** | **Classification** | **Privacy Concern** | **Retention** |
|------------------|-------------------|---------------------|---------------|
| Checkout Logs | Personal Information | Employee activity tracking | 3 years |
| Check-in Logs | Personal Information | Employee activity tracking | 3 years |
| Location History | Personal Information | Movement patterns | 3 years |
| Usage Timestamps | Personal Information | Work pattern analysis | 3 years |
| Asset Condition Ratings | Personal Information | Performance evaluation | 3 years |

### 3.2 Data Processing Activities

| **Activity** | **Purpose** | **Legal Basis (DPA Sec. 12)** |
|--------------|-------------|-------------------------------|
| Employee Registration | User account management | Performance of contract |
| Asset Checkout Tracking | Inventory management | Legitimate interest |
| Location Monitoring | Asset location tracking | Legitimate interest |
| Activity Logging | Audit and security | Legal obligation |
| Depreciation Tracking | Financial reporting | Legal obligation |

---

## 4. Technical Requirements

### 4.1 Data Privacy by Design (DPA Sec. 11)

#### REQ-DPD-001: Data Minimization
**Status**: ⚠️ **REQUIRED**

**Requirement:**
- Collect only personal information necessary for declared purposes
- Remove or do not implement unnecessary data fields

**Current System Analysis:**
```python
# backend/contexts/contexts_ms/models.py
class Employee(models.Model):
    firstname = models.CharField(max_length=50)  # ✅ Necessary
    lastname = models.CharField(max_length=50)   # ✅ Necessary
    # Missing fields that may be collected:
    # - middle_name (if collected, must justify)
    # - birthdate (if collected, must justify)
    # - government_ids (if collected, must justify)
```

**Implementation:**
```python
# COMPLIANT: Only collect what's needed
class Employee(models.Model):
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    email = models.EmailField()  # For notifications
    phone_number = models.CharField(max_length=15, blank=True)  # Optional
    # DO NOT ADD: birthdate, government_ids, etc. unless justified
```

**Acceptance Criteria:**
- [ ] Document justification for each personal data field
- [ ] Remove unused personal data fields
- [ ] Implement "optional" flags for non-essential fields

---

#### REQ-DPD-002: Purpose Limitation
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Personal information must be processed only for declared, specified purposes.

**Implementation:**
Create file: `backend/PRIVACY_PURPOSE_SPECIFICATION.md`

```markdown
# Purpose Specification Document

## Employee Data Processing Purposes:
1. **User Authentication**: Email, username, password
2. **Asset Assignment**: Employee ID, name, location
3. **Communication**: Email, phone number
4. **Audit Trail**: All fields for compliance

## Prohibited Uses:
- ❌ Marketing or promotional purposes
- ❌ Third-party data sharing without consent
- ❌ Performance evaluation (unless explicitly consented)
- ❌ Background verification beyond employment
```

**Acceptance Criteria:**
- [ ] Create purpose specification document
- [ ] Display purposes in privacy notice
- [ ] Implement purpose checking in data access logs

---

### 4.2 NPC Registration Requirements

#### REQ-NPC-001: Personal Information Controller Registration
**Status**: 🔴 **MANDATORY** (Legal Requirement)

**Requirement:**
Register as a Personal Information Controller (PIC) with the National Privacy Commission within 30 days of commencement of operations.

**Registration Process:**
1. Access NPC DataPrivacy.ph portal: https://www.privacy.gov.ph/
2. Create organization account
3. Complete PIC Registration Form with:
   - Organization details
   - Data Protection Officer contact
   - Nature of personal data processing
   - Security measures implemented
   - Data retention policies

**Registration Fee:** ₱2,000 - ₱100,000 (based on organization size)

**Implementation Checklist:**
- [ ] Designate Data Protection Officer (DPO)
- [ ] Prepare organizational profile
- [ ] Document data processing activities
- [ ] Complete online registration
- [ ] Obtain Certificate of Registration
- [ ] Display registration number in privacy policy

**Timeline:** Complete before production deployment

---

#### REQ-NPC-002: Data Protection Officer (DPO)
**Status**: 🔴 **MANDATORY**

**Requirement:**
Designate a Data Protection Officer responsible for compliance with DPA.

**DPO Responsibilities:**
- Monitor compliance with DPA and NPC regulations
- Serve as contact point with NPC
- Handle data subject requests
- Conduct privacy impact assessments
- Maintain records of processing activities
- Report data breaches to NPC

**Implementation:**
```python
# Add to Django admin or create dedicated management module
# backend/privacy_compliance/models.py

class DataProtectionOfficer(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    appointed_date = models.DateField()
    certificate = models.FileField(upload_to='dpo_certificates/')
    
    class Meta:
        verbose_name = "Data Protection Officer"
```

**Acceptance Criteria:**
- [ ] Appoint DPO (internal staff or outsourced)
- [ ] Provide DPO contact in privacy notice
- [ ] Grant DPO system access for audits
- [ ] Train DPO on DPA requirements

---

### 4.3 Consent Management

#### REQ-CON-001: Explicit Consent Mechanism
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Obtain explicit, informed consent from employees before processing personal information.

**Implementation:**
```python
# backend/contexts/contexts_ms/models.py

class Employee(models.Model):
    # Existing fields...
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    
    # ADD CONSENT FIELDS:
    consent_given = models.BooleanField(default=False)
    consent_date = models.DateTimeField(null=True, blank=True)
    consent_version = models.CharField(max_length=10, default='1.0')
    consent_ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Specific consents
    consent_asset_tracking = models.BooleanField(default=False)
    consent_location_monitoring = models.BooleanField(default=False)
    consent_activity_logging = models.BooleanField(default=False)
    
    # Withdrawal tracking
    consent_withdrawn = models.BooleanField(default=False)
    consent_withdrawn_date = models.DateTimeField(null=True, blank=True)
```

**Consent Form Requirements:**
```html
<!-- frontend/src/components/ConsentForm.jsx -->
<div class="consent-form">
  <h2>Data Privacy Consent</h2>
  
  <p><strong>Purpose:</strong> We collect your personal information for:</p>
  <ul>
    <li>User account management</li>
    <li>Asset assignment and tracking</li>
    <li>System security and audit</li>
  </ul>
  
  <p><strong>Data Collected:</strong></p>
  <ul>
    <li>Name, email, phone number</li>
    <li>Asset checkout/check-in records</li>
    <li>Location (office location only)</li>
  </ul>
  
  <label>
    <input type="checkbox" required />
    I consent to the processing of my personal information as described above.
  </label>
  
  <p><small>You may withdraw consent at any time by contacting: 
  [DPO Email]</small></p>
</div>
```

**Acceptance Criteria:**
- [ ] Implement consent checkbox on employee registration
- [ ] Store consent timestamp and version
- [ ] Provide consent withdrawal mechanism
- [ ] Log consent changes in audit trail
- [ ] Block data processing if consent withdrawn

---

#### REQ-CON-002: Privacy Notice
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Provide clear, accessible privacy notice to employees.

**Implementation:**
Create file: `PRIVACY_NOTICE_EMPLOYEES.md`

```markdown
# Privacy Notice for Employees
**Effective Date:** [Date]
**Last Updated:** [Date]

## Introduction
This Privacy Notice explains how [Organization Name] collects, uses, and protects your personal information in compliance with the Data Privacy Act of 2012.

## Data Controller
**Organization:** [Company Name]
**Address:** [Complete Address]
**Data Protection Officer:** [Name]
**DPO Email:** [Email]
**DPO Phone:** [Phone]
**NPC Registration No.:** [Registration Number]

## What Information We Collect
- Full Name
- Email Address
- Phone Number
- Office Location
- Asset Checkout/Check-in Records
- System Activity Logs

## Why We Collect This Information
- User account management
- Asset inventory tracking
- Audit and compliance
- Security monitoring

## Legal Basis
We process your information based on:
- Performance of employment contract
- Legitimate business interests
- Legal obligations

## How Long We Keep Your Information
- Active employment: Duration of employment
- After separation: 7 years (legal requirement)
- Activity logs: 3 years

## Your Rights (DPA Section 16)
You have the right to:
- Access your personal information
- Correct inaccurate information
- Request erasure (right to be forgotten)
- Object to processing
- Data portability
- Withdraw consent

## How to Exercise Your Rights
Contact our Data Protection Officer:
- Email: [DPO Email]
- Phone: [DPO Phone]
- Response time: 15 business days

## Data Security
We implement:
- Encryption (data in transit and at rest)
- Access controls
- Regular security audits
- Activity logging

## Data Sharing
We do NOT share your information with third parties except:
- When required by law
- With your explicit consent

## Changes to This Notice
We will notify you of any changes to this privacy notice.

## Complaints
You may file a complaint with:
**National Privacy Commission**
- Website: https://www.privacy.gov.ph/
- Email: info@privacy.gov.ph
- Phone: (02) 8234-2228

## Acknowledgment
By using this system, you acknowledge that you have read and understood this Privacy Notice.
```

**Acceptance Criteria:**
- [ ] Display privacy notice on first login
- [ ] Require acknowledgment before system access
- [ ] Provide link to privacy notice in all pages
- [ ] Update notice when processing changes

---

### 4.4 Data Subject Rights Implementation

#### REQ-DSR-001: Right to Access (DPA Sec. 16)
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Employees must be able to request and receive copies of their personal information.

**Implementation:**
```python
# backend/contexts/contexts_ms/views.py

from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
import json

class EmployeeViewSet(viewsets.ModelViewSet):
    
    @action(detail=False, methods=['get'], url_path='my-data')
    def export_my_data(self, request):
        """
        Export all personal data for authenticated employee
        Endpoint: GET /api/employees/my-data/
        """
        # Get employee from authenticated user
        employee_id = request.user.employee_id
        
        # Gather all data
        employee_data = {
            'personal_info': self._get_employee_info(employee_id),
            'asset_checkouts': self._get_checkout_history(employee_id),
            'activity_logs': self._get_activity_logs(employee_id),
            'consent_records': self._get_consent_records(employee_id),
        }
        
        # Log the data access request
        log_data_subject_request(
            employee_id=employee_id,
            request_type='DATA_ACCESS',
            timestamp=timezone.now()
        )
        
        # Return as JSON
        response = HttpResponse(
            json.dumps(employee_data, indent=2),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="my_data_{employee_id}.json"'
        return response
    
    def _get_employee_info(self, employee_id):
        employee = Employee.objects.get(id=employee_id)
        return {
            'id': employee.id,
            'firstname': employee.firstname,
            'lastname': employee.lastname,
            'email': employee.email,
            'phone': employee.phone_number,
            'created_at': str(employee.created_at),
        }
    
    def _get_checkout_history(self, employee_id):
        checkouts = AssetCheckout.objects.filter(
            checkout_to=employee_id
        ).values('asset_id', 'checkout_date', 'return_date', 'location')
        return list(checkouts)
    
    def _get_activity_logs(self, employee_id):
        # Retrieve activity logs related to this employee
        logs = ActivityLog.objects.filter(
            user_id=employee_id
        ).values('action', 'timestamp', 'ip_address')
        return list(logs)
    
    def _get_consent_records(self, employee_id):
        employee = Employee.objects.get(id=employee_id)
        return {
            'consent_given': employee.consent_given,
            'consent_date': str(employee.consent_date),
            'consent_version': employee.consent_version,
        }
```

**Frontend Implementation:**
```javascript
// frontend/src/pages/Employee/MyPrivacy.jsx

import { useState } from 'react';
import { exportMyData } from '../../services/employee-service';

function MyPrivacyPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const data = await exportMyData();
      // Download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], 
        { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my_data.json';
      link.click();
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="my-privacy">
      <h1>My Privacy Rights</h1>
      
      <section>
        <h2>Right to Access</h2>
        <p>Download all personal information we have about you.</p>
        <button onClick={handleExportData} disabled={isLoading}>
          {isLoading ? 'Exporting...' : 'Export My Data'}
        </button>
      </section>
      
      <section>
        <h2>Right to Rectification</h2>
        <p>Update your personal information.</p>
        <button onClick={() => navigate('/profile/edit')}>
          Update My Profile
        </button>
      </section>
      
      <section>
        <h2>Right to Erasure</h2>
        <p>Request deletion of your personal information.</p>
        <button onClick={() => setShowDeleteModal(true)}>
          Request Data Deletion
        </button>
      </section>
      
      <section>
        <h2>Withdraw Consent</h2>
        <p>Withdraw your consent for data processing.</p>
        <button onClick={() => setShowWithdrawModal(true)}>
          Withdraw Consent
        </button>
      </section>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Implement data export endpoint
- [ ] Provide self-service data access in UI
- [ ] Log all data access requests
- [ ] Respond within 15 business days (NPC requirement)
- [ ] Provide data in machine-readable format (JSON)

---

#### REQ-DSR-002: Right to Rectification
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Employees can request correction of inaccurate personal information.

**Implementation:**
```python
# backend/contexts/contexts_ms/views.py

@action(detail=False, methods=['post'], url_path='request-correction')
def request_correction(self, request):
    """
    Submit correction request for personal data
    POST /api/employees/request-correction/
    Body: { field: 'email', current_value: 'old@email.com', new_value: 'new@email.com', reason: '...' }
    """
    employee_id = request.user.employee_id
    
    correction_request = CorrectionRequest.objects.create(
        employee_id=employee_id,
        field=request.data.get('field'),
        current_value=request.data.get('current_value'),
        new_value=request.data.get('new_value'),
        reason=request.data.get('reason'),
        status='pending',
        requested_at=timezone.now()
    )
    
    # Notify DPO
    notify_dpo_correction_request(correction_request)
    
    return Response({
        'message': 'Correction request submitted successfully',
        'request_id': correction_request.id,
        'status': 'pending'
    })
```

**Acceptance Criteria:**
- [ ] Implement correction request system
- [ ] Allow employees to update own data
- [ ] Require approval for sensitive fields
- [ ] Log all corrections
- [ ] Notify employee of outcome

---

#### REQ-DSR-003: Right to Erasure (Right to be Forgotten)
**Status**: ⚠️ **REQUIRED** (with exceptions)

**Requirement:**
Employees can request deletion of personal information (subject to legal retention requirements).

**Implementation:**
```python
# backend/contexts/contexts_ms/models.py

class DeletionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    employee_id = models.PositiveIntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.CharField(max_length=100, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Legal hold check
    legal_retention_required = models.BooleanField(default=False)
    retention_reason = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Data Deletion Request"

# Deletion logic

def process_deletion_request(request_id):
    deletion_req = DeletionRequest.objects.get(id=request_id)
    employee_id = deletion_req.employee_id
    
    # Check legal retention requirements
    if check_legal_hold(employee_id):
        deletion_req.status = 'rejected'
        deletion_req.legal_retention_required = True
        deletion_req.retention_reason = (
            "Data must be retained for 7 years after separation "
            "per Philippine labor and tax laws."
        )
        deletion_req.save()
        return
    
    # Proceed with anonymization (not complete deletion)
    anonymize_employee_data(employee_id)
    
    deletion_req.status = 'completed'
    deletion_req.save()

def anonymize_employee_data(employee_id):
    """Anonymize instead of delete to preserve referential integrity"""
    employee = Employee.objects.get(id=employee_id)
    
    # Anonymize personal data
    employee.firstname = f"Deleted"
    employee.lastname = f"User_{employee_id}"
    employee.email = f"deleted_{employee_id}@anonymized.local"
    employee.phone_number = None
    employee.is_deleted = True
    employee.deletion_date = timezone.now()
    employee.save()
    
    # Keep asset checkout records but mark as anonymized
    AssetCheckout.objects.filter(checkout_to=employee_id).update(
        notes=F('notes') + ' [Employee data anonymized]'
    )
```

**Acceptance Criteria:**
- [ ] Implement deletion request workflow
- [ ] Check legal retention requirements before deletion
- [ ] Use anonymization instead of hard delete
- [ ] Preserve audit trail integrity
- [ ] Notify employee of decision within 15 days

---

#### REQ-DSR-004: Right to Data Portability
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Provide personal data in structured, commonly used, machine-readable format.

**Implementation:**
(Already covered in REQ-DSR-001 with JSON export)

**Acceptance Criteria:**
- [ ] Export in JSON format (✅ machine-readable)
- [ ] Include all personal data
- [ ] Provide within 15 business days

---

### 4.5 Security Measures (DPA Sec. 20)

#### REQ-SEC-001: Encryption Requirements
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Implement encryption for personal information in transit and at rest.

**Implementation:**

**A. Data in Transit:**
```python
# backend/settings.py

# Force HTTPS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS (HTTP Strict Transport Security)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

**B. Data at Rest:**
```python
# backend/contexts/contexts_ms/models.py

from django_cryptography.fields import encrypt

class Employee(models.Model):
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    
    # Encrypt sensitive fields
    email = encrypt(models.EmailField())
    phone_number = encrypt(models.CharField(max_length=15, blank=True))
    
    # Alternative: Use Django's built-in encryption
    # Requires: pip install django-encrypted-model-fields
```

**C. Database Encryption:**
```yaml
# docker-compose.yml or deployment config
# Use encrypted database volumes

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - encrypted_db_data:/var/lib/postgresql/data
    # Enable PostgreSQL encryption
    command: >
      postgres 
      -c ssl=on 
      -c ssl_cert_file=/etc/ssl/certs/server.crt
      -c ssl_key_file=/etc/ssl/private/server.key
```

**Acceptance Criteria:**
- [ ] Enable HTTPS/TLS for all connections
- [ ] Encrypt sensitive database fields
- [ ] Use encrypted database volumes
- [ ] Implement certificate management
- [ ] Test encryption end-to-end

---

#### REQ-SEC-002: Access Controls
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Implement role-based access control (RBAC) to limit access to personal information.

**Implementation:**
```python
# backend/contexts/contexts_ms/models.py

class UserRole(models.Model):
    ROLE_CHOICES = [
        ('employee', 'Employee'),
        ('admin', 'Administrator'),
        ('dpo', 'Data Protection Officer'),
        ('auditor', 'Auditor (Read-Only)'),
    ]
    
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # Granular permissions
    can_view_all_employees = models.BooleanField(default=False)
    can_edit_employees = models.BooleanField(default=False)
    can_delete_employees = models.BooleanField(default=False)
    can_export_data = models.BooleanField(default=False)
    can_view_audit_logs = models.BooleanField(default=False)

# Permission checking
from rest_framework.permissions import BasePermission

class CanViewEmployeeData(BasePermission):
    def has_permission(self, request, view):
        # Employees can only view their own data
        if request.user.role.role == 'employee':
            return view.kwargs.get('pk') == request.user.employee_id
        
        # Admins and DPO can view all
        if request.user.role.role in ['admin', 'dpo']:
            return True
        
        return False

# Apply to views
class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, CanViewEmployeeData]
```

**Acceptance Criteria:**
- [ ] Implement role-based permissions
- [ ] Employees can only access own data
- [ ] Admins have limited access
- [ ] DPO has full access for compliance
- [ ] Log all access attempts

---

#### REQ-SEC-003: Activity Logging and Audit Trail
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Maintain comprehensive audit logs of all data access and modifications.

**Implementation:**
```python
# backend/contexts/contexts_ms/models.py

class DataAccessLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    user_id = models.PositiveIntegerField()
    user_role = models.CharField(max_length=20)
    action = models.CharField(max_length=50)  # VIEW, CREATE, UPDATE, DELETE, EXPORT
    resource_type = models.CharField(max_length=50)  # Employee, Asset, etc.
    resource_id = models.PositiveIntegerField(null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    success = models.BooleanField(default=True)
    failure_reason = models.TextField(blank=True)
    
    # Data subject (whose data was accessed)
    data_subject_id = models.PositiveIntegerField(null=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['user_id']),
            models.Index(fields=['data_subject_id']),
        ]
        verbose_name = "Data Access Log"

# Logging middleware
class DataAccessLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Log data access
        if self._should_log(request):
            DataAccessLog.objects.create(
                user_id=request.user.id if request.user.is_authenticated else None,
                user_role=getattr(request.user, 'role', 'anonymous'),
                action=request.method,
                resource_type=self._get_resource_type(request),
                resource_id=self._get_resource_id(request),
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                success=200 <= response.status_code < 400
            )
        
        return response
    
    def _should_log(self, request):
        # Log access to employee data, assets, etc.
        return any(path in request.path for path in 
                  ['/api/employees/', '/api/assets/', '/api/checkouts/'])
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
```

**Acceptance Criteria:**
- [ ] Log all CRUD operations on personal data
- [ ] Log authentication attempts
- [ ] Log data export requests
- [ ] Retain logs for 3 years minimum
- [ ] Protect logs from tampering
- [ ] Provide log review interface for DPO

---

#### REQ-SEC-004: Password and Authentication Security
**Status**: ⚠️ **REQUIRED**

**Implementation:**
```python
# backend/authentication/settings.py

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 12}  # NPC recommends 12+ characters
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Session security
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'

# Account lockout after failed attempts
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = 1  # 1 hour lockout
AXES_LOCK_OUT_BY_COMBINATION_USER_AND_IP = True
```

**Acceptance Criteria:**
- [ ] Enforce strong password policy (12+ characters)
- [ ] Implement account lockout after 5 failed attempts
- [ ] Use secure session management
- [ ] Implement multi-factor authentication (MFA) for admins
- [ ] Hash passwords with strong algorithm (bcrypt/Argon2)

---

### 4.6 Data Breach Response (DPA Sec. 21 & NPC Circular 16-03)

#### REQ-BRE-001: Data Breach Notification Mechanism
**Status**: 🔴 **MANDATORY**

**Requirement:**
Notify NPC within 72 hours of data breach discovery.

**Implementation:**
```python
# backend/privacy_compliance/models.py

class DataBreachIncident(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
        ('critical', 'Critical'),
    ]
    
    incident_id = models.CharField(max_length=50, unique=True)
    discovered_at = models.DateTimeField(auto_now_add=True)
    incident_date = models.DateTimeField()  # When breach occurred
    
    # Breach details
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    description = models.TextField()
    affected_data_types = models.JSONField()  # ['email', 'phone', 'checkout_records']
    affected_individuals_count = models.IntegerField()
    
    # Response
    containment_measures = models.TextField()
    remediation_steps = models.TextField()
    
    # Notifications
    npc_notified = models.BooleanField(default=False)
    npc_notification_date = models.DateTimeField(null=True)
    individuals_notified = models.BooleanField(default=False)
    notification_date = models.DateTimeField(null=True)
    
    # Investigation
    root_cause = models.TextField(blank=True)
    responsible_party = models.CharField(max_length=100, blank=True)
    
    # Closure
    resolved = models.BooleanField(default=False)
    resolved_date = models.DateTimeField(null=True)

# Breach notification procedure
def handle_data_breach(incident_id):
    incident = DataBreachIncident.objects.get(incident_id=incident_id)
    
    # Step 1: Immediate containment
    containment_actions = contain_breach(incident)
    incident.containment_measures = containment_actions
    incident.save()
    
    # Step 2: Assess severity and scope
    severity = assess_breach_severity(incident)
    affected_individuals = get_affected_individuals(incident)
    incident.severity = severity
    incident.affected_individuals_count = len(affected_individuals)
    incident.save()
    
    # Step 3: Notify NPC if high risk (within 72 hours)
    if severity in ['high', 'critical']:
        notify_npc(incident)
        incident.npc_notified = True
        incident.npc_notification_date = timezone.now()
        incident.save()
    
    # Step 4: Notify affected individuals
    notify_affected_individuals(affected_individuals, incident)
    incident.individuals_notified = True
    incident.notification_date = timezone.now()
    incident.save()
    
    # Step 5: Notify DPO
    notify_dpo_breach(incident)

def notify_npc(incident):
    """
    Send breach notification to NPC via email: info@privacy.gov.ph
    or through NPC portal: https://www.privacy.gov.ph/
    """
    notification_data = {
        'incident_id': incident.incident_id,
        'organization': 'Zip Technology Corp.',
        'npc_registration_no': '[YOUR_NPC_REG_NO]',
        'incident_date': incident.incident_date.isoformat(),
        'discovery_date': incident.discovered_at.isoformat(),
        'severity': incident.severity,
        'affected_individuals': incident.affected_individuals_count,
        'data_types_affected': incident.affected_data_types,
        'containment_measures': incident.containment_measures,
        'contact_person': '[DPO Name]',
        'contact_email': '[DPO Email]',
        'contact_phone': '[DPO Phone]',
    }
    
    # Send email to NPC
    send_mail(
        subject=f'Data Breach Notification - {incident.incident_id}',
        message=format_npc_notification(notification_data),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['info@privacy.gov.ph'],
        fail_silently=False,
    )
    
    # Log notification
    log_breach_notification(incident, 'NPC')
```

**NPC Notification Template:**
```
Subject: Data Breach Notification - [Incident ID]

National Privacy Commission
5th Floor, Philippine International Convention Center (PICC)
CCP Complex, Roxas Boulevard, Pasay City

Dear Sir/Madam,

Pursuant to Section 21 of the Data Privacy Act of 2012 and NPC Circular 16-03, 
we hereby notify the Commission of a personal data breach incident.

ORGANIZATION DETAILS:
- Name: [Organization Name]
- NPC Registration No.: [Number]
- DPO Name: [Name]
- DPO Email: [Email]
- DPO Phone: [Phone]

INCIDENT DETAILS:
- Incident ID: [ID]
- Incident Date: [Date]
- Discovery Date: [Date]
- Severity: [High/Critical]
- Number of Affected Individuals: [Count]

DATA COMPROMISED:
- Types of Personal Information: [List]
- Sensitivity: [Assessment]

CONTAINMENT MEASURES:
[Description of immediate actions taken]

REMEDIATION STEPS:
[Description of ongoing and planned actions]

AFFECTED INDIVIDUAL NOTIFICATION:
- Notification Date: [Date]
- Notification Method: [Email/Letter]

We are committed to cooperating fully with the Commission's investigation 
and implementing all necessary corrective measures.

Sincerely,
[DPO Name]
Data Protection Officer
[Organization Name]
```

**Acceptance Criteria:**
- [ ] Implement breach detection system
- [ ] Create incident response plan
- [ ] Notify NPC within 72 hours for high-risk breaches
- [ ] Notify affected individuals promptly
- [ ] Document all breach incidents
- [ ] Conduct post-breach review

---

### 4.7 Data Retention and Disposal

#### REQ-RET-001: Data Retention Policy
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Define and implement retention periods for different data types.

**Implementation:**
```python
# backend/privacy_compliance/retention.py

RETENTION_POLICY = {
    'employee_records': {
        'retention_period_years': 7,
        'trigger': 'separation_date',
        'legal_basis': 'Philippine Labor Code, BIR regulations',
    },
    'asset_purchase_records': {
        'retention_period_years': 7,
        'trigger': 'purchase_date',
        'legal_basis': 'Tax Code, BIR Revenue Regulation No. 17-2013',
    },
    'checkout_logs': {
        'retention_period_years': 3,
        'trigger': 'checkout_date',
        'legal_basis': 'Internal audit requirements',
    },
    'activity_logs': {
        'retention_period_years': 3,
        'trigger': 'log_date',
        'legal_basis': 'Security and compliance',
    },
    'consent_records': {
        'retention_period_years': 7,
        'trigger': 'consent_withdrawal_date',
        'legal_basis': 'DPA compliance documentation',
    },
}

# Automated retention enforcement
from django.core.management.base import BaseCommand
from datetime import timedelta
from django.utils import timezone

class Command(BaseCommand):
    help = 'Enforce data retention policy'
    
    def handle(self, *args, **options):
        today = timezone.now().date()
        
        # Check employee records
        retention_date = today - timedelta(days=7*365)
        expired_employees = Employee.objects.filter(
            separation_date__lt=retention_date,
            is_deleted=False
        )
        
        for employee in expired_employees:
            self.stdout.write(f'Anonymizing employee {employee.id}')\n            anonymize_employee_data(employee.id)
        
        # Check checkout logs
        log_retention_date = today - timedelta(days=3*365)
        AssetCheckout.objects.filter(
            checkout_date__lt=log_retention_date
        ).delete()
        
        self.stdout.write(self.style.SUCCESS('Retention policy enforced'))

# Schedule as cron job
# 0 2 * * * cd /app && python manage.py enforce_retention_policy
```

**Acceptance Criteria:**
- [ ] Document retention policy
- [ ] Implement automated retention enforcement
- [ ] Schedule monthly retention checks
- [ ] Log all data disposal activities
- [ ] Provide retention reports to DPO

---

#### REQ-RET-002: Secure Data Disposal
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Securely dispose of personal information after retention period expires.

**Implementation:**
```python
# backend/privacy_compliance/disposal.py

class DataDisposalLog(models.Model):
    disposal_id = models.CharField(max_length=50, unique=True)
    disposal_date = models.DateTimeField(auto_now_add=True)
    data_type = models.CharField(max_length=100)
    records_count = models.IntegerField()
    disposal_method = models.CharField(max_length=50)  # Anonymization, Deletion, Shredding
    authorized_by = models.CharField(max_length=100)
    dpo_approved = models.BooleanField(default=False)
    
    # Audit trail
    affected_employees = models.TextField()  # JSON list of employee IDs
    retention_period_expired = models.DateField()

def secure_disposal_procedure(data_type, records):
    """Secure disposal following DPA guidelines"""
    disposal_log = DataDisposalLog.objects.create(
        disposal_id=generate_disposal_id(),
        data_type=data_type,
        records_count=len(records),
        disposal_method='anonymization',
        authorized_by='system_automated',
    )
    
    # Anonymization (preferred over deletion)
    for record in records:
        anonymize_record(record)
    
    # Log disposal
    disposal_log.dpo_approved = True
    disposal_log.save()
    
    # Notify DPO
    notify_dpo_disposal(disposal_log)
```

**Acceptance Criteria:**
- [ ] Use anonymization instead of deletion where possible
- [ ] Maintain disposal logs
- [ ] Require DPO approval for bulk disposals
- [ ] Generate disposal certificates
- [ ] Preserve audit trail

---

## 5. Functional Requirements

### 5.1 Privacy Dashboard for Employees

#### REQ-FUN-001: Employee Privacy Portal
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Provide self-service portal for employees to manage their privacy rights.

**Features:**
- View personal data
- Export data (JSON)
- Request corrections
- Request deletion
- Withdraw consent
- View privacy notice
- Contact DPO

**Implementation:**
```javascript
// frontend/src/pages/Employee/PrivacyDashboard.jsx

function PrivacyDashboard() {
  return (
    <div className="privacy-dashboard">
      <h1>My Privacy Rights</h1>
      
      <div className="privacy-cards">
        {/* Right to Access */}
        <Card>
          <h2>My Personal Data</h2>
          <p>View and download all personal information we have about you</p>
          <button onClick={handleViewData}>View My Data</button>
          <button onClick={handleExportData}>Export as JSON</button>
        </Card>
        
        {/* Right to Rectification */}
        <Card>
          <h2>Correct My Information</h2>
          <p>Update inaccurate or incomplete personal information</p>
          <button onClick={handleEditProfile}>Edit Profile</button>
          <button onClick={handleRequestCorrection}>Request Correction</button>
        </Card>
        
        {/* Right to Erasure */}
        <Card>
          <h2>Delete My Data</h2>
          <p>Request deletion of your personal information</p>
          <p className="warning">⚠️ Subject to legal retention requirements</p>
          <button onClick={handleRequestDeletion}>Request Deletion</button>
        </Card>
        
        {/* Consent Management */}
        <Card>
          <h2>Manage Consent</h2>
          <p>View and manage your data processing consents</p>
          <ConsentStatus />
          <button onClick={handleWithdrawConsent}>Withdraw Consent</button>
        </Card>
        
        {/* Privacy Notice */}
        <Card>
          <h2>Privacy Notice</h2>
          <p>Read our privacy notice and understand how we use your data</p>
          <button onClick={handleViewPrivacyNotice}>View Privacy Notice</button>
        </Card>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Implement privacy dashboard UI
- [ ] All data subject rights accessible in one place
- [ ] Mobile-responsive design
- [ ] Available in English and Filipino (optional)

---

### 5.2 DPO Administration Portal

#### REQ-FUN-002: DPO Compliance Dashboard
**Status**: ⚠️ **REQUIRED**

**Requirement:**
Provide tools for DPO to monitor and manage compliance.

**Features:**
```javascript
// frontend/src/pages/DPO/ComplianceDashboard.jsx

function DPODashboard() {
  return (
    <div className="dpo-dashboard">
      <h1>Data Protection Officer Dashboard</h1>
      
      {/* Compliance Overview */}
      <section className="compliance-metrics">
        <MetricCard title="Data Subject Requests" value={dsr.pending} status="warning" />
        <MetricCard title="Open Breaches" value={breaches.open} status="critical" />
        <MetricCard title="Consent Rate" value="98%" status="good" />
        <MetricCard title="NPC Registration" value="Valid" status="good" />
      </section>
      
      {/* Data Subject Requests Queue */}
      <section>
        <h2>Pending Data Subject Requests</h2>
        <DataSubjectRequestsTable 
          requests={dsrQueue}
          onApprove={handleApproveDSR}
          onReject={handleRejectDSR}
        />
      </section>
      
      {/* Access Logs Monitoring */}
      <section>
        <h2>Data Access Monitoring</h2>
        <AccessLogsTable 
          logs={recentAccessLogs}
          highlightSuspicious={true}
        />
      </section>
      
      {/* Breach Management */}
      <section>
        <h2>Breach Incidents</h2>
        <BreachIncidentsTable 
          incidents={breachIncidents}
          onNotifyNPC={handleNotifyNPC}
        />
      </section>
      
      {/* Retention Policy Status */}
      <section>
        <h2>Data Retention Status</h2>
        <RetentionReport 
          expiringSoon={expiringData}
          onDispose={handleSecureDisposal}
        />
      </section>
      
      {/* Compliance Reports */}
      <section>
        <h2>Generate Reports</h2>
        <button onClick={generateNPCReport}>NPC Annual Report</button>
        <button onClick={generateAuditReport}>Audit Report</button>
        <button onClick={generateDSRReport}>DSR Statistics</button>
      </section>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Implement DPO dashboard
- [ ] Real-time compliance monitoring
- [ ] Request management workflow
- [ ] Breach incident tracking
- [ ] Reporting capabilities

---

## 6. Security Requirements

### 6.1 Technical Security Measures

| **Requirement** | **Implementation** | **Status** |
|-----------------|-------------------|------------|
| HTTPS/TLS | Force SSL redirect, HSTS headers | ⚠️ Required |
| Database Encryption | Encrypt sensitive fields | ⚠️ Required |
| Password Hashing | Use Argon2 or bcrypt | ⚠️ Required |
| Session Security | Secure cookies, 1-hour timeout | ⚠️ Required |
| Input Validation | Sanitize all user inputs | ⚠️ Required |
| SQL Injection Prevention | Use parameterized queries | ⚠️ Required |
| XSS Prevention | Content Security Policy | ⚠️ Required |
| CSRF Protection | Django CSRF middleware | ⚠️ Required |

### 6.2 Organizational Security Measures

| **Measure** | **Description** | **Status** |
|-------------|-----------------|------------|
| Access Control Policy | Define who can access personal data | ⚠️ Required |
| Employee Training | DPA awareness training | ⚠️ Required |
| Incident Response Plan | Documented breach procedures | ⚠️ Required |
| Regular Audits | Quarterly security assessments | ⚠️ Required |

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Priority: 🔴 CRITICAL**

- [ ] **Week 1:**
  - [ ] Appoint Data Protection Officer
  - [ ] Register with NPC (initiate process)
  - [ ] Create privacy notice document
  - [ ] Document data processing activities
  - [ ] Implement consent mechanism (database fields)

- [ ] **Week 2:**
  - [ ] Implement encryption (HTTPS, database fields)
  - [ ] Set up access controls and permissions
  - [ ] Implement activity logging
  - [ ] Create privacy policy page in UI

**Deliverables:**
- NPC registration submitted
- Privacy notice published
- Basic consent management

---

### Phase 2: Data Subject Rights (Weeks 3-4)
**Priority: ⚠️ HIGH**

- [ ] **Week 3:**
  - [ ] Implement data export functionality
  - [ ] Build employee privacy dashboard
  - [ ] Create correction request system
  - [ ] Implement deletion request workflow

- [ ] **Week 4:**
  - [ ] Build DPO compliance dashboard
  - [ ] Implement request management system
  - [ ] Create data anonymization procedures
  - [ ] Test all DSR workflows

**Deliverables:**
- Functional privacy dashboard
- DSR request system
- DPO tools

---

### Phase 3: Security Hardening (Weeks 5-6)
**Priority: ⚠️ HIGH**

- [ ] **Week 5:**
  - [ ] Implement password policies
  - [ ] Set up account lockout mechanism
  - [ ] Configure session security
  - [ ] Implement MFA for admins

- [ ] **Week 6:**
  - [ ] Security penetration testing
  - [ ] Vulnerability assessment
  - [ ] Fix identified issues
  - [ ] Document security measures for NPC

**Deliverables:**
- Hardened security posture
- Security assessment report

---

### Phase 4: Breach Response & Retention (Weeks 7-8)
**Priority: ⚠️ MEDIUM**

- [ ] **Week 7:**
  - [ ] Create breach response plan
  - [ ] Implement breach notification system
  - [ ] Set up NPC notification procedure
  - [ ] Create breach incident tracking

- [ ] **Week 8:**
  - [ ] Implement retention policy
  - [ ] Create automated disposal procedures
  - [ ] Set up retention monitoring
  - [ ] Schedule retention cron jobs

**Deliverables:**
- Breach response plan
- Retention policy implementation

---

### Phase 5: Training & Documentation (Weeks 9-10)
**Priority: ⚠️ MEDIUM**

- [ ] **Week 9:**
  - [ ] Conduct DPA training for staff
  - [ ] Create user documentation
  - [ ] Document all compliance procedures
  - [ ] Prepare NPC registration documentation

- [ ] **Week 10:**
  - [ ] Final NPC registration submission
  - [ ] Compliance audit
  - [ ] Fix any gaps
  - [ ] Go-live readiness review

**Deliverables:**
- Trained staff
- Complete documentation
- NPC certificate (in process)
- Compliance certification

---

### Phase 6: Ongoing Compliance (Continuous)
**Priority: ✅ MAINTENANCE**

**Monthly:**
- [ ] Review data subject requests
- [ ] Monitor access logs for anomalies
- [ ] Check retention policy compliance
- [ ] Update privacy notice if needed

**Quarterly:**
- [ ] Security audit
- [ ] DPA compliance review
- [ ] Staff training refresher
- [ ] Generate compliance reports

**Annually:**
- [ ] NPC annual report submission
- [ ] Privacy impact assessment
- [ ] Full system audit
- [ ] Review and update policies
- [ ] Renew NPC registration (if required)

---

## 8. Compliance Checklist

### 8.1 Pre-Launch Checklist

#### Legal & Regulatory
- [ ] NPC registration completed
- [ ] Data Protection Officer appointed
- [ ] Privacy notice published
- [ ] Data processing activities documented
- [ ] Legal retention requirements identified

#### Technical Implementation
- [ ] Consent management system implemented
- [ ] Data encryption (in transit and at rest)
- [ ] Access controls and RBAC
- [ ] Activity logging
- [ ] Data export functionality
- [ ] Deletion/anonymization procedures
- [ ] Breach notification system

#### Documentation
- [ ] Privacy Notice (employee-facing)
- [ ] Data Retention Policy
- [ ] Breach Response Plan
- [ ] Access Control Policy
- [ ] Data Processing Agreement (if using vendors)
- [ ] Employee Privacy Training Materials

#### Testing
- [ ] Data export tested
- [ ] Consent workflow tested
- [ ] Deletion request tested
- [ ] Security assessment completed
- [ ] Breach notification procedure tested

---

### 8.2 Ongoing Compliance Checklist

#### Monthly
- [ ] Review pending data subject requests (15-day SLA)
- [ ] Monitor access logs
- [ ] Check for security vulnerabilities
- [ ] Review consent withdrawal requests

#### Quarterly
- [ ] Security audit
- [ ] Compliance self-assessment
- [ ] Staff training refresher
- [ ] Update privacy documentation if needed

#### Annually
- [ ] Submit NPC annual report
- [ ] Conduct Privacy Impact Assessment
- [ ] Full security audit
- [ ] Review and update policies
- [ ] Renew NPC registration (if required)

---

## 9. Appendices

### Appendix A: Key Philippine DPA Provisions

**Section 11: General Data Privacy Principles**
- Transparency
- Legitimate purpose
- Proportionality

**Section 12: Criteria for Lawful Processing**
- Consent of the data subject
- Performance of a contract
- Legal obligation
- Legitimate interests

**Section 16: Rights of Data Subjects**
- Right to be informed
- Right to access
- Right to object
- Right to erasure or blocking
- Right to rectify
- Right to data portability
- Right to damages

**Section 20: Security of Personal Information**
- Organizational measures
- Technical measures
- Physical measures

**Section 21: Notification and Compliance**
- Notify NPC of data breaches
- 72-hour notification requirement

---

### Appendix B: NPC Contact Information

**National Privacy Commission**
- **Website:** https://www.privacy.gov.ph/
- **Email:** info@privacy.gov.ph
- **Phone:** (02) 8234-2228
- **Address:** 5th Floor, Philippine International Convention Center (PICC), CCP Complex, Roxas Boulevard, Pasay City

**Online Services:**
- NPC DataPrivacy.ph Portal: https://privacy.gov.ph/
- File a Complaint: https://www.privacy.gov.ph/complaints/
- Registration Portal: https://www.privacy.gov.ph/registration/

---

### Appendix C: Penalties for Non-Compliance

| **Violation** | **Penalty** |
|---------------|-------------|
| Unauthorized processing | Imprisonment: 1-3 years, Fine: ₱500,000 - ₱2,000,000 |
| Unauthorized access | Imprisonment: 1-3 years, Fine: ₱500,000 - ₱2,000,000 |
| Improper disposal | Imprisonment: 6 months - 2 years, Fine: ₱100,000 - ₱500,000 |
| Failure to notify breach | Administrative fine: Up to ₱5,000,000 |
| Failure to register with NPC | Administrative fine: ₱10,000 - ₱100,000 |

---

### Appendix D: Recommended Training Topics

**For All Employees:**
- Introduction to Data Privacy Act
- What is personal information
- Handling personal data securely
- Reporting data breaches
- Employee rights under DPA

**For System Administrators:**
- Technical security measures
- Access control management
- Incident response procedures
- Log monitoring
- Secure disposal procedures

**For Management:**
- DPA compliance overview
- Business impact of non-compliance
- Privacy by design principles
- Vendor management
- NPC reporting requirements

---

### Appendix E: Sample Forms

#### E.1 Employee Consent Form
```
DATA PRIVACY CONSENT FORM

I, _________________________, hereby acknowledge and consent to the collection, 
processing, and storage of my personal information by [Organization Name] for 
the following purposes:

1. User account management and authentication
2. Asset assignment and tracking
3. System security and audit
4. Compliance with legal obligations

I understand that:
- My personal information will be protected in accordance with the Data Privacy Act of 2012
- I have the right to access, correct, and request deletion of my personal information
- I can withdraw this consent at any time by contacting the Data Protection Officer
- My information will be retained for 7 years after separation as required by law

Data Protection Officer Contact:
Email: [DPO Email]
Phone: [DPO Phone]

I have read and understood this consent form and the Privacy Notice.

_____________________________     _____________________________
Employee Signature                Date

_____________________________     _____________________________
Employee Name (Printed)           Employee ID
```

#### E.2 Data Subject Request Form
```
DATA SUBJECT REQUEST FORM

Request Type (check one):
[ ] Access my personal data
[ ] Correct inaccurate data
[ ] Delete my personal data
[ ] Withdraw consent
[ ] Object to processing
[ ] Data portability

Requestor Information:
Name: _____________________________
Employee ID: _____________________________
Email: _____________________________
Phone: _____________________________

Request Details:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Date: _____________________________
Signature: _____________________________

--- FOR DPO USE ONLY ---
Received: _____________________________
Assigned to: _____________________________
Due Date: _____________________________
Status: _____________________________
Completed: _____________________________
```

---

## Document Approval

| **Role** | **Name** | **Signature** | **Date** |
|----------|----------|---------------|----------|
| Project Manager |  |  |  |
| Data Protection Officer |  |  |  |
| IT Manager |  |  |  |
| Legal Counsel |  |  |  |

---

## Revision History

| **Version** | **Date** | **Author** | **Changes** |
|-------------|----------|------------|-------------|
| 1.0 | 2026-02-18 | Capstone Team | Initial draft |

---

## References

1. Republic Act No. 10173 - Data Privacy Act of 2012
2. NPC Circular 16-01 - Registration Requirements
3. NPC Circular 16-02 - Security of Personal Information
4. NPC Circular 16-03 - Data Breach Notification
5. NPC Advisory Opinion 2017-028 - Employee Monitoring
6. ISO/IEC 27001:2013 - Information Security Management
7. ISO/IEC 19770-1:2017 - IT Asset Management

---

### END OF DOCUMENT
