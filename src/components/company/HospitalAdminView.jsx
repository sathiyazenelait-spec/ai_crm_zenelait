import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { hospitalService } from '../../services/hospitalService';
import { DataTable } from '../common/DataTable';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  Activity,
  HeartPulse,
  Calendar,
  Clock,
  Users,
  ShieldAlert,
  Plus,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Building,
  UserCheck,
  FileText,
  AlertCircle,
  Video,
  Check
} from 'lucide-react';

export function HospitalAdminView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'staff' | 'appointments' | 'reception' | 'patients' | 'reports'
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [appointmentSlots, setAppointmentSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [receptionQueue, setReceptionQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form State: Add Department
  const [deptCode, setDeptCode] = useState('DENTAL');
  const [deptName, setDeptName] = useState('Dental Services');
  const [deptLocId, setDeptLocId] = useState('LOC-001');
  const [deptDesc, setDeptDesc] = useState('Dental consultation and appointment services');

  // Form State: Add Staff
  const [staffName, setStaffName] = useState('Meena Kumar');
  const [staffEmail, setStaffEmail] = useState('meena.reception@greencare.example');
  const [staffPhone, setStaffPhone] = useState('+91 97654 11223');
  const [staffRole, setStaffRole] = useState('RECEPTIONIST');
  const [staffDeptId, setStaffDeptId] = useState('DEPT-101');
  const [staffDesig, setStaffDesig] = useState('Receptionist');

  // Form State: Add Slot
  const [slotDeptId, setSlotDeptId] = useState('DEPT-101');
  const [slotStaffId, setSlotStaffId] = useState('STAFF-101');
  const [slotTypeId, setSlotTypeId] = useState('APT-TYPE-001');
  const [slotStart, setSlotStart] = useState('2026-10-26T10:00:00+05:30');
  const [slotEnd, setSlotEnd] = useState('2026-10-26T10:30:00+05:30');
  const [slotCapacity, setSlotCapacity] = useState(1);

  // Form State: Register Patient
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientDob, setPatientDob] = useState('1990-01-01');
  const [patientGender, setPatientGender] = useState('MALE');
  const [patientBloodGroup, setPatientBloodGroup] = useState('O+');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const unboxList = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return [];
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'departments') {
        const [deptRes, srvRes] = await Promise.all([
          hospitalService.getDepartments(),
          hospitalService.getServices()
        ]);
        const deptList = unboxList(deptRes);
        const srvList = unboxList(srvRes);
        if (deptList.length > 0) setDepartments(deptList);
        if (srvList.length > 0) setServices(srvList);
      } else if (activeTab === 'staff') {
        const [staffRes, schedRes, typeRes] = await Promise.all([
          hospitalService.getStaff(),
          hospitalService.getAllSchedules(),
          hospitalService.getAppointmentTypes()
        ]);
        const stList = unboxList(staffRes);
        const scList = unboxList(schedRes);
        const tList = unboxList(typeRes);
        if (stList.length > 0) setStaff(stList);
        if (scList.length > 0) setSchedules(scList);
        if (tList.length > 0) setAppointmentTypes(tList);
      } else if (activeTab === 'appointments') {
        const [aptRes, slotRes] = await Promise.all([
          hospitalService.getAppointments(),
          hospitalService.getAppointmentSlots()
        ]);
        const aList = unboxList(aptRes);
        const sList = unboxList(slotRes);
        if (aList.length > 0) setAppointments(aList);
        if (sList.length > 0) setAppointmentSlots(sList);
      } else if (activeTab === 'reception') {
        const res = await hospitalService.getReceptionQueue();
        const qList = unboxList(res);
        if (qList.length > 0) setReceptionQueue(qList);
      } else if (activeTab === 'patients') {
        const res = await hospitalService.getPatients();
        const pList = unboxList(res);
        if (pList.length > 0) setPatients(pList);
      } else if (activeTab === 'reports') {
        const [aptRep, recRep, supRep, schedRep] = await Promise.all([
          hospitalService.getAppointmentsReport(),
          hospitalService.getReceptionReport(),
          hospitalService.getSupportReport(),
          hospitalService.getStaffSchedulesReport()
        ]);
        setReports({
          appointments: aptRep?.data,
          reception: recRep?.data,
          support: supRep?.data,
          schedules: schedRep?.data
        });
      }
    } catch (err) {
      console.error('Failed to load hospital data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await hospitalService.createDepartment({
        code: deptCode,
        name: deptName,
        locationId: deptLocId,
        description: deptDesc,
        status: 'ACTIVE'
      });
      if (res?.success) {
        addNotification({
          type: 'success',
          title: 'Department Created',
          message: `${deptName} (${deptCode}) successfully added!`
        });
        setShowAddDeptModal(false);
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await hospitalService.createStaff({
        name: staffName,
        email: staffEmail,
        phone: staffPhone,
        staffRole,
        departmentId: staffDeptId,
        designation: staffDesig,
        status: 'ACTIVE'
      });
      if (res?.success) {
        addNotification({
          type: 'success',
          title: 'Staff Invited',
          message: `Invitation issued to ${staffName} as ${staffRole}!`
        });
        setShowAddStaffModal(false);
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to invite staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await hospitalService.createAppointmentSlot({
        locationId: 'LOC-001',
        departmentId: slotDeptId,
        appointmentTypeId: slotTypeId,
        staffId: slotStaffId,
        startAt: slotStart,
        endAt: slotEnd,
        capacity: Number(slotCapacity)
      });
      if (res?.success) {
        addNotification({
          type: 'success',
          title: 'Slot Published',
          message: `Appointment slot created for ${slotStart}`
        });
        setShowAddSlotModal(false);
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await hospitalService.createPatient({
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        dateOfBirth: patientDob,
        gender: patientGender,
        bloodGroup: patientBloodGroup
      });
      if (res?.success) {
        addNotification({
          type: 'success',
          title: 'Patient Registered',
          message: `${patientName} registered in reception directory`
        });
        setShowAddPatientModal(false);
        setPatientName('');
        setPatientEmail('');
        setPatientPhone('');
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to register patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQueueStatusChange = async (queueId, newStatus) => {
    try {
      await hospitalService.updateReceptionQueue(queueId, { status: newStatus });
      addNotification({
        type: 'success',
        title: 'Queue Updated',
        message: `Token updated to status: ${newStatus}`
      });
      loadData();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: err.message
      });
    }
  };

  return (
    <div className="hospital-admin-view" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(244, 63, 94, 0.08) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)'
          }}>
            <HeartPulse size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                GreenCare Clinic — Medical Operations Master
              </h1>
              <span style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                🏥 HOSPITAL / CLINIC TENANT
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Non-Clinical CRM Workspace: Outpatient Departments, Doctor Roster, Reception Queue, Appointment Reminders & AI Receptionists
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'departments' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddDeptModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ef4444', borderColor: '#ef4444' }}
            >
              <Plus size={16} /> Add Department
            </button>
          )}
          {activeTab === 'staff' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddStaffModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ef4444', borderColor: '#ef4444' }}
            >
              <Plus size={16} /> Invite Medical Staff
            </button>
          )}
          {activeTab === 'appointments' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddSlotModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ef4444', borderColor: '#ef4444' }}
            >
              <Calendar size={16} /> Publish Appointment Slot
            </button>
          )}
          {activeTab === 'patients' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddPatientModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ef4444', borderColor: '#ef4444' }}
            >
              <Plus size={16} /> Register Patient
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
        marginBottom: '20px'
      }}>
        {[
          { id: 'departments', label: '🏥 Departments & OPD Services', count: departments.length },
          { id: 'staff', label: '🩺 Doctors & Rostered Staff', count: staff.length },
          { id: 'appointments', label: '📅 Appointments & Slots', count: appointments.length },
          { id: 'reception', label: '⏳ Reception Queue & Triage', count: receptionQueue.length },
          { id: 'patients', label: '📁 Patient Directory (Demographics)', count: patients.length },
          { id: 'reports', label: '📊 Clinic Operational Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 500,
              background: activeTab === tab.id ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: activeTab === tab.id ? '#ef4444' : 'var(--text-secondary)',
              border: activeTab === tab.id ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                background: activeTab === tab.id ? '#ef4444' : 'var(--bg-tertiary)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '10px'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Privacy Notice Alert */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '8px',
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        marginBottom: '20px',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        <ShieldAlert size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#3b82f6' }}>Healthcare Privacy Boundary:</strong> In compliance with medical privacy policies, clinical diagnoses, EHR notes, and prescriptions are sealed in a separate clinical EHR subsystem. The CRM Company Admin manages operational logistics, appointment slots, staff scheduling, and AI receptionists.
        </div>
      </div>

      {/* Tab 1: Departments & Services */}
      {activeTab === 'departments' && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Hospital Departments & Clinics
          </h3>
          <DataTable
            columns={[
              {
                header: 'Department Code & Name',
                accessorKey: 'name',
                cell: ({ row }) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '11px', color: '#ef4444', fontFamily: 'monospace' }}>{row.code}</div>
                  </div>
                )
              },
              {
                header: 'Location Campus',
                accessorKey: 'locationId',
                cell: ({ value }) => (
                  <span style={{ fontSize: '12px', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: '4px' }}>
                    {value === 'LOC-001' ? 'Chennai Main Campus' : 'Coimbatore Clinic'}
                  </span>
                )
              },
              {
                header: 'Scope / Description',
                accessorKey: 'description',
                cell: ({ value }) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{value}</span>
              },
              {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ value }) => <StatusBadge status={value} />
              }
            ]}
            data={departments}
            isLoading={isLoading}
            searchPlaceholder="Search departments by code or title..."
          />

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '32px', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Configured OPD Services & Tariffs
          </h3>
          <DataTable
            columns={[
              { header: 'Service Code', accessorKey: 'code' },
              { header: 'Service Title', accessorKey: 'name' },
              {
                header: 'Department',
                accessorKey: 'departmentId',
                cell: ({ value }) => value === 'DEPT-101' ? 'Dental' : 'Cardiology'
              },
              {
                header: 'Duration',
                accessorKey: 'durationMinutes',
                cell: ({ value }) => `${value} Mins`
              },
              {
                header: 'Consultation Fee',
                accessorKey: 'fee',
                cell: ({ value }) => `₹${Number(value).toLocaleString()}`
              },
              {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ value }) => <StatusBadge status={value} />
              }
            ]}
            data={services}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Tab 2: Doctors & Staff */}
      {activeTab === 'staff' && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Medical Staff Roster (Doctors, Receptionists & Care Coordinators)
          </h3>
          <DataTable
            columns={[
              {
                header: 'Staff Member',
                accessorKey: 'name',
                cell: ({ row }) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.email} • {row.phone}</div>
                  </div>
                )
              },
              {
                header: 'Role Key',
                accessorKey: 'staffRole',
                cell: ({ value }) => (
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: value === 'DOCTOR' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: value === 'DOCTOR' ? '#3b82f6' : '#10b981'
                  }}>
                    {value}
                  </span>
                )
              },
              {
                header: 'Designation / Credentials',
                accessorKey: 'designation'
              },
              {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ value }) => <StatusBadge status={value} />
              }
            ]}
            data={staff}
            isLoading={isLoading}
            searchPlaceholder="Search doctors or receptionists..."
          />

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '32px', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Permitted Appointment Types & Formats
          </h3>
          <DataTable
            columns={[
              { header: 'Type ID', accessorKey: 'typeId' },
              { header: 'Type Code', accessorKey: 'code' },
              { header: 'Title', accessorKey: 'name' },
              {
                header: 'Default Slot Time',
                accessorKey: 'durationMinutes',
                cell: ({ value }) => `${value} Mins`
              },
              {
                header: 'Requires Messaging Consent',
                accessorKey: 'requiresConsent',
                cell: ({ value }) => (
                  <span style={{ color: value ? '#10b981' : '#f59e0b', fontSize: '12px', fontWeight: 600 }}>
                    {value ? 'Yes (Strict)' : 'Optional'}
                  </span>
                )
              }
            ]}
            data={appointmentTypes}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Tab 3: Appointments & Slots */}
      {activeTab === 'appointments' && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Scheduled Patient Appointments
          </h3>
          <DataTable
            columns={[
              { header: 'Appointment ID', accessorKey: 'appointmentId' },
              {
                header: 'Patient Name',
                accessorKey: 'patientName',
                cell: ({ row }) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.patientName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {row.patientId}</div>
                  </div>
                )
              },
              {
                header: 'Assigned Physician',
                accessorKey: 'staffName'
              },
              {
                header: 'Appointment Time',
                accessorKey: 'startAt',
                cell: ({ value }) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <Clock size={13} style={{ color: '#ef4444' }} />
                    {value}
                  </div>
                )
              },
              {
                header: 'Reason / Note',
                accessorKey: 'note'
              },
              {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ value }) => <StatusBadge status={value} />
              }
            ]}
            data={appointments}
            isLoading={isLoading}
            searchPlaceholder="Search appointments..."
          />

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '32px', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Published Calendar Slots
          </h3>
          <DataTable
            columns={[
              { header: 'Slot ID', accessorKey: 'slotId' },
              { header: 'Doctor ID', accessorKey: 'staffId' },
              { header: 'Start Time', accessorKey: 'startAt' },
              { header: 'End Time', accessorKey: 'endAt' },
              { header: 'Capacity', accessorKey: 'capacity' },
              {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ value }) => <StatusBadge status={value} />
              }
            ]}
            data={appointmentSlots}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Tab 4: Reception Queue & Triage */}
      {activeTab === 'reception' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Live Reception Waiting Room & Token Queue
            </h3>
            <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
              ● {receptionQueue.filter(q => q.status === 'WAITING').length} Patients in Waiting Area
            </span>
          </div>

          <DataTable
            columns={[
              {
                header: 'Token #',
                accessorKey: 'tokenNumber',
                cell: ({ value }) => (
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    {value}
                  </span>
                )
              },
              { header: 'Patient Name', accessorKey: 'patientName' },
              { header: 'Physician', accessorKey: 'doctorName' },
              { header: 'Consultation Room', accessorKey: 'roomNumber' },
              {
                header: 'Check-In Time',
                accessorKey: 'checkInTime',
                cell: ({ value }) => (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <Clock size={12} /> {value}
                  </span>
                )
              },
              {
                header: 'Queue Status',
                accessorKey: 'status',
                cell: ({ value }) => (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background: value === 'WAITING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: value === 'WAITING' ? '#f59e0b' : '#10b981'
                  }}>
                    {value}
                  </span>
                )
              },
              {
                header: 'Reception Triage Action',
                id: 'actions',
                cell: ({ row }) => (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {row.status === 'WAITING' && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleQueueStatusChange(row.queueId, 'WITH_DOCTOR')}
                        style={{ fontSize: '11px', padding: '3px 8px', color: '#3b82f6', borderColor: '#3b82f6' }}
                      >
                        Call to Doctor
                      </button>
                    )}
                    {row.status === 'WITH_DOCTOR' && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleQueueStatusChange(row.queueId, 'COMPLETED')}
                        style={{ fontSize: '11px', padding: '3px 8px', color: '#10b981', borderColor: '#10b981' }}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                )
              }
            ]}
            data={receptionQueue}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Tab 5: Patient Directory */}
      {activeTab === 'patients' && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Patient Demographics Directory (Reception Registry)
          </h3>
          <DataTable
            columns={[
              { header: 'Patient ID', accessorKey: 'patientId' },
              {
                header: 'Full Name',
                accessorKey: 'name',
                cell: ({ row }) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.email} • {row.phone}</div>
                  </div>
                )
              },
              { header: 'Date of Birth', accessorKey: 'dateOfBirth' },
              { header: 'Gender', accessorKey: 'gender' },
              {
                header: 'Blood Group',
                accessorKey: 'bloodGroup',
                cell: ({ value }) => (
                  <span style={{
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444'
                  }}>
                    {value}
                  </span>
                )
              },
              { header: 'Registered Date', accessorKey: 'registeredAt' }
            ]}
            data={patients}
            isLoading={isLoading}
            searchPlaceholder="Search patients by name or phone..."
          />
        </div>
      )}

      {/* Tab 6: Reports */}
      {activeTab === 'reports' && reports && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div style={{
            background: 'var(--card-bg, #1e293b)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> Appointment Operations Metrics
            </h4>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><strong>Scheduled Total:</strong> {reports.appointments?.scheduledTotal}</div>
              <div><strong>Completed Total:</strong> {reports.appointments?.completedTotal}</div>
              <div><strong>Pending Review:</strong> <span style={{ color: '#f59e0b', fontWeight: 700 }}>{reports.appointments?.pendingReview}</span></div>
              <div><strong>Cancellations:</strong> {reports.appointments?.cancellations}</div>
              <div><strong>No-Show Rate:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{reports.appointments?.noShowRate}</span></div>
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg, #1e293b)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} /> Reception Queue & Triage Stats
            </h4>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><strong>Today Total Check-Ins:</strong> {reports.reception?.todayTotalCheckIns}</div>
              <div><strong>Average Wait Time:</strong> <span style={{ color: '#3b82f6', fontWeight: 700 }}>{reports.reception?.avgWaitTimeMinutes} minutes</span></div>
              <div><strong>Peak Queue Window:</strong> {reports.reception?.peakQueueHour}</div>
              <div><strong>Patient Satisfaction:</strong> ⭐ {reports.reception?.receptionSatisfaction}</div>
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg, #1e293b)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={18} /> Staff Schedule Utilization
            </h4>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><strong>Active Doctors Rostered:</strong> {reports.schedules?.activeDoctorsRostered}</div>
              <div><strong>Schedule Utilization:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{reports.schedules?.scheduleUtilization}</span></div>
              <div><strong>Overtime Hours:</strong> {reports.schedules?.overtimeHours} hrs</div>
              <div><strong>Tele-consultation Share:</strong> {reports.schedules?.teleconsultShare}</div>
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg, #1e293b)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartPulse size={18} /> Customer Care & Support
            </h4>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><strong>Open Support Tickets:</strong> {reports.support?.openSupportTickets}</div>
              <div><strong>Resolved Today:</strong> {reports.support?.resolvedToday}</div>
              <div><strong>Average Resolution:</strong> {reports.support?.avgResolutionHours} hours</div>
              <div><strong>Top Issue Category:</strong> {reports.support?.topCategory}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Department */}
      <FormDialog
        isOpen={showAddDeptModal}
        onClose={() => setShowAddDeptModal(false)}
        title="Add Hospital / OPD Department"
        onSubmit={handleCreateDepartment}
        isSubmitting={isSubmitting}
        error={formError}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Department Code</label>
            <input
              type="text"
              className="input-field"
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Campus Location</label>
            <select
              className="input-field"
              value={deptLocId}
              onChange={(e) => setDeptLocId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="LOC-001">Chennai Main Campus</option>
              <option value="LOC-002">Coimbatore City Clinic</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Department Name</label>
          <input
            type="text"
            className="input-field"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Scope / Description</label>
          <textarea
            className="input-field"
            value={deptDesc}
            onChange={(e) => setDeptDesc(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>
      </FormDialog>

      {/* Modal: Add Staff */}
      <FormDialog
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        title="Invite Medical Staff Member"
        onSubmit={handleCreateStaff}
        isSubmitting={isSubmitting}
        error={formError}
      >
        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Full Name</label>
          <input
            type="text"
            className="input-field"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Work Email</label>
            <input
              type="email"
              className="input-field"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Phone</label>
            <input
              type="tel"
              className="input-field"
              value={staffPhone}
              onChange={(e) => setStaffPhone(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Role</label>
            <select
              className="input-field"
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="RECEPTION_MANAGER">Reception Manager</option>
              <option value="APPOINTMENT_COORDINATOR">Appointment Coordinator</option>
              <option value="DOCTOR">Doctor / Staff Physician</option>
              <option value="CUSTOMER_SUPPORT">Customer Support</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Department</label>
            <select
              className="input-field"
              value={staffDeptId}
              onChange={(e) => setStaffDeptId(e.target.value)}
              style={{ width: '100%' }}
            >
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Designation Title</label>
          <input
            type="text"
            className="input-field"
            value={staffDesig}
            onChange={(e) => setStaffDesig(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
      </FormDialog>

      {/* Modal: Publish Slot */}
      <FormDialog
        isOpen={showAddSlotModal}
        onClose={() => setShowAddSlotModal(false)}
        title="Publish Appointment Slot"
        onSubmit={handleCreateSlot}
        isSubmitting={isSubmitting}
        error={formError}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Department</label>
            <select
              className="input-field"
              value={slotDeptId}
              onChange={(e) => setSlotDeptId(e.target.value)}
              style={{ width: '100%' }}
            >
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Doctor</label>
            <select
              className="input-field"
              value={slotStaffId}
              onChange={(e) => setSlotStaffId(e.target.value)}
              style={{ width: '100%' }}
            >
              {staff.filter(s => s.staffRole === 'DOCTOR').map((st) => (
                <option key={st.staffId} value={st.staffId}>{st.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Start Time</label>
            <input
              type="text"
              className="input-field"
              value={slotStart}
              onChange={(e) => setSlotStart(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>End Time</label>
            <input
              type="text"
              className="input-field"
              value={slotEnd}
              onChange={(e) => setSlotEnd(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </FormDialog>

      {/* Modal: Register Patient */}
      <FormDialog
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        title="Register Patient in Reception Registry"
        onSubmit={handleCreatePatient}
        isSubmitting={isSubmitting}
        error={formError}
      >
        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Patient Full Name</label>
          <input
            type="text"
            className="input-field"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
            placeholder="e.g. Ramesh Sundaram"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Email</label>
            <input
              type="email"
              className="input-field"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Phone Number</label>
            <input
              type="tel"
              className="input-field"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Date of Birth</label>
            <input
              type="date"
              className="input-field"
              value={patientDob}
              onChange={(e) => setPatientDob(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Gender</label>
            <select
              className="input-field"
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Blood Group</label>
            <select
              className="input-field"
              value={patientBloodGroup}
              onChange={(e) => setPatientBloodGroup(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
