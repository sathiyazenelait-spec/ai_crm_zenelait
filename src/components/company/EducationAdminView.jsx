import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { educationService } from '../../services/educationService';
import { DataTable } from '../common/DataTable';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  Award,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  MessageSquare,
  BarChart3,
  Search,
  Check,
  Send,
  HelpCircle,
  FileText
} from 'lucide-react';

export function EducationAdminView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'batches' | 'enquiries' | 'counselling' | 'students' | 'reports'
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [counsellingSessions, setCounsellingSessions] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showAddEnquiryModal, setShowAddEnquiryModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form State: Add Course
  const [courseCode, setCourseCode] = useState('JAVA-FS-001');
  const [courseName, setCourseName] = useState('Java Full Stack Development');
  const [courseCategory, setCourseCategory] = useState('SOFTWARE_DEVELOPMENT');
  const [courseDesc, setCourseDesc] = useState('Java, Spring Boot, React and database development');
  const [durationWeeks, setDurationWeeks] = useState(24);
  const [deliveryMode, setDeliveryMode] = useState('HYBRID');
  const [courseFee, setCourseFee] = useState(45000);

  // Form State: Add Batch
  const [batchCourseId, setBatchCourseId] = useState('CRS-1001');
  const [batchCode, setBatchCode] = useState('JAVA-OCT-2026');
  const [batchName, setBatchName] = useState('October Java Full Stack Batch');
  const [startDate, setStartDate] = useState('2026-11-02');
  const [endDate, setEndDate] = useState('2027-04-30');
  const [capacity, setCapacity] = useState(40);

  // Form State: Add Enquiry
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryCourseId, setEnquiryCourseId] = useState('CRS-1001');

  // Form State: Counselling Session
  const [sessionEnquiryId, setSessionEnquiryId] = useState('ENQ-1001');
  const [sessionCounsellorId, setSessionCounsellorId] = useState('USR-COUN-101');
  const [sessionStart, setSessionStart] = useState('2026-10-26T10:00:00+05:30');
  const [sessionMode, setSessionMode] = useState('ONLINE');
  const [sessionNotes, setSessionNotes] = useState('Discuss course curriculum and admissions');

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
      if (activeTab === 'courses') {
        const res = await educationService.getCourses();
        const list = unboxList(res);
        if (list.length > 0) setCourses(list);
      } else if (activeTab === 'batches') {
        const res = await educationService.getBatches();
        const list = unboxList(res);
        if (list.length > 0) setBatches(list);
      } else if (activeTab === 'enquiries') {
        const [enqRes, appRes] = await Promise.all([
          educationService.getEnquiries(),
          educationService.getApplications()
        ]);
        const enqList = unboxList(enqRes);
        const appList = unboxList(appRes);
        if (enqList.length > 0) setEnquiries(enqList);
        if (appList.length > 0) setApplications(appList);
      } else if (activeTab === 'counselling') {
        const [counRes, sessRes] = await Promise.all([
          educationService.getCounsellors(),
          educationService.getCounsellingSessions()
        ]);
        const counList = unboxList(counRes);
        const sessList = unboxList(sessRes);
        if (counList.length > 0) setCounsellors(counList);
        if (sessList.length > 0) setCounsellingSessions(sessList);
      } else if (activeTab === 'students') {
        const [stuRes, supRes] = await Promise.all([
          educationService.getStudents(),
          educationService.getSupportRequests()
        ]);
        const stuList = unboxList(stuRes);
        const supList = unboxList(supRes);
        if (stuList.length > 0) setStudents(stuList);
        if (supList.length > 0) setSupportRequests(supList);
      } else if (activeTab === 'reports') {
        const [admRes, crsRes, cnlRes] = await Promise.all([
          educationService.getAdmissionsReport(),
          educationService.getCoursesReport(),
          educationService.getCounsellorsReport()
        ]);
        setReports({
          admissions: admRes?.data,
          courses: crsRes?.data,
          counsellors: cnlRes?.data
        });
      }
    } catch (err) {
      console.error('Failed to load education data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await educationService.createCourse({
        courseCode,
        name: courseName,
        category: courseCategory,
        description: courseDesc,
        durationWeeks: Number(durationWeeks),
        deliveryMode,
        fee: Number(courseFee),
        status: 'ACTIVE'
      });
      if (res?.success) {
        addNotification({
          type: 'success',
          title: 'Course Created',
          message: `${courseName} (${courseCode}) has been listed successfully!`
        });
        setShowAddCourseModal(false);
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await educationService.createBatch({
        courseId: batchCourseId,
        batchCode,
        name: batchName,
        startDate,
        endDate,
        capacity: Number(capacity),
        deliveryMode: 'HYBRID',
        status: 'PLANNED'
      });
      if (res?.success) {
        addNotification({
          type: 'success',
          title: 'Batch Scheduled',
          message: `${batchName} cohort successfully created with ${capacity} seats!`
        });
        setShowAddBatchModal(false);
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await educationService.createEnquiry({
        name: enquiryName,
        email: enquiryEmail,
        phone: enquiryPhone,
        courseId: enquiryCourseId,
        channel: 'WEBSITE_FORM',
        leadScore: 'HOT'
      });
      if (res?.success) {
        addNotification({
          type: 'success',
          title: 'Enquiry Registered',
          message: `Enquiry for ${enquiryName} logged and routed to admissions counselor!`
        });
        setShowAddEnquiryModal(false);
        setEnquiryName('');
        setEnquiryEmail('');
        setEnquiryPhone('');
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to register enquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await educationService.createCounsellingSession({
        enquiryId: sessionEnquiryId,
        counsellorId: sessionCounsellorId,
        startAt: sessionStart,
        mode: sessionMode,
        meetingPlatform: 'VIDEO_CALL',
        notes: sessionNotes,
        status: 'SCHEDULED'
      });
      if (res?.success) {
        addNotification({
          type: 'success',
          title: 'Counselling Scheduled',
          message: `Appointment confirmed for ${sessionStart}`
        });
        setShowAddSessionModal(false);
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to schedule counselling');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveApplication = async (appId) => {
    try {
      const res = await educationService.approveApplication(appId);
      if (res?.success) {
        addNotification({
          type: 'success',
          title: 'Application Approved',
          message: `Application ${appId} has been approved for fee collection & onboarding!`
        });
        loadData();
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: err.message || 'Could not approve application'
      });
    }
  };

  return (
    <div className="education-admin-view" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)'
          }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                BrightPath Academy — Admissions & Courses Master
              </h1>
              <span style={{
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#8b5cf6',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                🎓 EDUCATION & TRAINING TENANT
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              100% Dynamic Course Catalogs, Batches Roster, Admission Pipeline, Counselling Desk & AI Admission Bots
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'courses' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddCourseModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              <Plus size={16} /> Add Course
            </button>
          )}
          {activeTab === 'batches' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddBatchModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              <Plus size={16} /> Create Cohort Batch
            </button>
          )}
          {activeTab === 'enquiries' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddEnquiryModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              <Plus size={16} /> New Admission Enquiry
            </button>
          )}
          {activeTab === 'counselling' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddSessionModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              <Calendar size={16} /> Schedule Session
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
          { id: 'courses', label: '🎓 Courses Catalog', count: courses.length },
          { id: 'batches', label: '📆 Batches & Cohorts', count: batches.length },
          { id: 'enquiries', label: '📋 Admission Enquiries', count: enquiries.length },
          { id: 'counselling', label: '🗓️ Counselling Sessions', count: counsellingSessions.length },
          { id: 'students', label: '🧑‍🎓 Enrolled Students', count: students.length },
          { id: 'reports', label: '📊 Admissions Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 500,
              background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === tab.id ? '#8b5cf6' : 'var(--text-secondary)',
              border: activeTab === tab.id ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
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
                background: activeTab === tab.id ? '#8b5cf6' : 'var(--bg-tertiary)',
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

      {/* Tab 1: Courses */}
      {activeTab === 'courses' && (
        <DataTable
          columns={[
            {
              header: 'Course Code & Name',
              accessorKey: 'name',
              cell: ({ row }) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                  <div style={{ fontSize: '11px', color: '#8b5cf6', fontFamily: 'monospace' }}>{row.courseCode}</div>
                </div>
              )
            },
            {
              header: 'Category',
              accessorKey: 'category',
              cell: ({ value }) => (
                <span style={{ fontSize: '12px', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: '4px' }}>
                  {value}
                </span>
              )
            },
            {
              header: 'Duration',
              accessorKey: 'durationWeeks',
              cell: ({ value }) => `${value} Weeks`
            },
            {
              header: 'Mode',
              accessorKey: 'deliveryMode',
              cell: ({ value }) => (
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: value === 'HYBRID' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: value === 'HYBRID' ? '#3b82f6' : '#10b981'
                }}>
                  {value}
                </span>
              )
            },
            {
              header: 'Fee',
              accessorKey: 'fee',
              cell: ({ value }) => `₹${Number(value).toLocaleString()}`
            },
            {
              header: 'Status',
              accessorKey: 'status',
              cell: ({ value }) => <StatusBadge status={value} />
            }
          ]}
          data={courses}
          isLoading={isLoading}
          searchPlaceholder="Search courses by code or title..."
        />
      )}

      {/* Tab 2: Batches */}
      {activeTab === 'batches' && (
        <DataTable
          columns={[
            {
              header: 'Batch Cohort',
              accessorKey: 'name',
              cell: ({ row }) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Code: {row.batchCode}</div>
                </div>
              )
            },
            {
              header: 'Schedule Window',
              accessorKey: 'startDate',
              cell: ({ row }) => (
                <div style={{ fontSize: '12px' }}>
                  <span>{row.startDate}</span> <span style={{ color: 'var(--text-secondary)' }}>to</span> <span>{row.endDate}</span>
                </div>
              )
            },
            {
              header: 'Occupancy / Capacity',
              accessorKey: 'enrolledCount',
              cell: ({ row }) => {
                const pct = Math.round((row.enrolledCount / row.capacity) * 100);
                return (
                  <div style={{ width: '140px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span>{row.enrolledCount} / {row.capacity}</span>
                      <span style={{ fontWeight: 600, color: pct >= 80 ? '#10b981' : '#f59e0b' }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#10b981' : '#f59e0b' }} />
                    </div>
                  </div>
                );
              }
            },
            {
              header: 'Available Seats',
              accessorKey: 'availableSeats',
              cell: ({ value }) => (
                <span style={{ fontWeight: 600, color: value > 5 ? '#10b981' : '#ef4444' }}>
                  {value} seats left
                </span>
              )
            },
            {
              header: 'Delivery Mode',
              accessorKey: 'deliveryMode'
            },
            {
              header: 'Status',
              accessorKey: 'status',
              cell: ({ value }) => <StatusBadge status={value} />
            }
          ]}
          data={batches}
          isLoading={isLoading}
          searchPlaceholder="Search cohort batches..."
        />
      )}

      {/* Tab 3: Enquiries & Applications */}
      {activeTab === 'enquiries' && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Admission Enquiries (Stage Tracking)
          </h3>
          <DataTable
            columns={[
              {
                header: 'Student Name',
                accessorKey: 'name',
                cell: ({ row }) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.email} • {row.phone}</div>
                  </div>
                )
              },
              {
                header: 'Interested Course',
                accessorKey: 'courseName'
              },
              {
                header: 'Lead Score',
                accessorKey: 'leadScore',
                cell: ({ value }) => (
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: value === 'HOT' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: value === 'HOT' ? '#ef4444' : '#f59e0b'
                  }}>
                    🔥 {value}
                  </span>
                )
              },
              {
                header: 'Channel Source',
                accessorKey: 'channel'
              },
              {
                header: 'Stage Status',
                accessorKey: 'stageId',
                cell: ({ value }) => (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background: value === 'STG-02' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: value === 'STG-02' ? '#8b5cf6' : '#3b82f6'
                  }}>
                    {value === 'STG-02' ? 'Counselling Scheduled' : 'New Enquiry'}
                  </span>
                )
              }
            ]}
            data={enquiries}
            isLoading={isLoading}
            searchPlaceholder="Filter prospective students..."
          />

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '32px', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Formal Applications (Awaiting Review & Approval)
          </h3>
          <DataTable
            columns={[
              { header: 'Application ID', accessorKey: 'applicationId' },
              { header: 'Applicant Name', accessorKey: 'applicantName' },
              { header: 'Target Course', accessorKey: 'courseId' },
              { header: 'Target Cohort', accessorKey: 'batchId' },
              {
                header: 'Submission Status',
                accessorKey: 'submissionStatus',
                cell: ({ value }) => <StatusBadge status={value} />
              },
              {
                header: 'Approval Status',
                accessorKey: 'approvalStatus',
                cell: ({ value }) => (
                  <span style={{
                    fontWeight: 600,
                    color: value === 'APPROVED' || value === 'ACCEPTED' ? '#10b981' : '#f59e0b'
                  }}>
                    {value}
                  </span>
                )
              },
              {
                header: 'Action',
                id: 'actions',
                cell: ({ row }) => (
                  row.approvalStatus !== 'APPROVED' && row.approvalStatus !== 'ACCEPTED' ? (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleApproveApplication(row.applicationId)}
                      style={{ fontSize: '11px', padding: '4px 8px', color: '#10b981', borderColor: '#10b981' }}
                    >
                      <Check size={12} style={{ marginRight: '4px' }} /> Approve Seat
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Ready for Fee
                    </span>
                  )
                )
              }
            ]}
            data={applications}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Tab 4: Counselling Sessions */}
      {activeTab === 'counselling' && (
        <DataTable
          columns={[
            {
              header: 'Student & Enquiry',
              accessorKey: 'studentName',
              cell: ({ row }) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.studentName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {row.enquiryId}</div>
                </div>
              )
            },
            {
              header: 'Assigned Counsellor',
              accessorKey: 'counsellorName'
            },
            {
              header: 'Appointment Slot',
              accessorKey: 'startAt',
              cell: ({ value }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <Clock size={13} style={{ color: '#8b5cf6' }} />
                  {value}
                </div>
              )
            },
            {
              header: 'Platform / Mode',
              accessorKey: 'meetingPlatform',
              cell: ({ row }) => `${row.mode} (${row.meetingPlatform})`
            },
            {
              header: 'Status',
              accessorKey: 'status',
              cell: ({ value }) => <StatusBadge status={value} />
            }
          ]}
          data={counsellingSessions}
          isLoading={isLoading}
          searchPlaceholder="Search counselling sessions..."
        />
      )}

      {/* Tab 5: Students & Support */}
      {activeTab === 'students' && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Active Student Directory
          </h3>
          <DataTable
            columns={[
              {
                header: 'Student',
                accessorKey: 'name',
                cell: ({ row }) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.email} • {row.phone}</div>
                  </div>
                )
              },
              { header: 'Course ID', accessorKey: 'courseId' },
              { header: 'Batch Cohort', accessorKey: 'batchId' },
              {
                header: 'Attendance / Academic Note',
                accessorKey: 'note',
                cell: ({ value }) => (
                  <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '3px 8px', borderRadius: '4px' }}>
                    {value}
                  </span>
                )
              },
              {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ value }) => <StatusBadge status={value} />
              }
            ]}
            data={students}
            isLoading={isLoading}
          />

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '32px', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Student Support & LMS Escalations
          </h3>
          <DataTable
            columns={[
              { header: 'Request ID', accessorKey: 'requestId' },
              { header: 'Student Name', accessorKey: 'studentName' },
              { header: 'Issue Subject', accessorKey: 'subject' },
              {
                header: 'Priority',
                accessorKey: 'priority',
                cell: ({ value }) => (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: value === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: value === 'HIGH' ? '#ef4444' : '#3b82f6'
                  }}>
                    {value}
                  </span>
                )
              },
              {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ value }) => <StatusBadge status={value} />
              }
            ]}
            data={supportRequests}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Tab 6: Reports */}
      {activeTab === 'reports' && reports && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{
            background: 'var(--card-bg, #1e293b)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} /> Admission Funnel Metrics
            </h4>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><strong>Total Enquiries:</strong> {reports.admissions?.totalEnquiries}</div>
              <div><strong>Converted Enrolments:</strong> {reports.admissions?.convertedEnrolments}</div>
              <div><strong>Conversion Rate:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{reports.admissions?.conversionRate}</span></div>
              <div><strong>Top Source:</strong> {reports.admissions?.topEnquirySource}</div>
              <div><strong>Average Days to Enrol:</strong> {reports.admissions?.avgDaysToEnrol} days</div>
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg, #1e293b)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} /> Course Demand & Capacity
            </h4>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><strong>Most Popular Course:</strong> {reports.courses?.mostPopularCourse}</div>
              <div><strong>Fastest Cohort:</strong> {reports.courses?.fastestFillingCohort}</div>
              <div><strong>Total Active Batches:</strong> {reports.courses?.totalActiveBatches}</div>
              <div><strong>Average Occupancy:</strong> <span style={{ color: '#3b82f6', fontWeight: 700 }}>{reports.courses?.avgBatchOccupancy}</span></div>
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg, #1e293b)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} /> Counsellor Leaderboard
            </h4>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><strong>Top Counsellor:</strong> {reports.counsellors?.topCounsellor}</div>
              <div><strong>Average Rating:</strong> ⭐ {reports.counsellors?.avgRating}</div>
              <div><strong>Sessions Completed:</strong> {reports.counsellors?.sessionsCompletedMonth}</div>
              <div><strong>Session to Enrol Rate:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{reports.counsellors?.counsellingToEnrolRate}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Course */}
      <FormDialog
        isOpen={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        title="Add New Course to Catalog"
        onSubmit={handleCreateCourse}
        isSubmitting={isSubmitting}
        error={formError}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Course Code</label>
            <input
              type="text"
              className="input-field"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Category</label>
            <select
              className="input-field"
              value={courseCategory}
              onChange={(e) => setCourseCategory(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="SOFTWARE_DEVELOPMENT">Software Development</option>
              <option value="DATA_AI">Data Science & AI</option>
              <option value="CLOUD_DEVOPS">Cloud & DevOps</option>
              <option value="PRODUCT_DESIGN">Product & UI/UX</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Course Title</label>
          <input
            type="text"
            className="input-field"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Description</label>
          <textarea
            className="input-field"
            value={courseDesc}
            onChange={(e) => setCourseDesc(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Duration (Weeks)</label>
            <input
              type="number"
              className="input-field"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Delivery Mode</label>
            <select
              className="input-field"
              value={deliveryMode}
              onChange={(e) => setDeliveryMode(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="HYBRID">Hybrid (In-Person + Online)</option>
              <option value="ONLINE">100% Online Live</option>
              <option value="WEEKEND">Weekend Cohort</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Fee (INR)</label>
            <input
              type="number"
              className="input-field"
              value={courseFee}
              onChange={(e) => setCourseFee(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </FormDialog>

      {/* Modal: Add Batch */}
      <FormDialog
        isOpen={showAddBatchModal}
        onClose={() => setShowAddBatchModal(false)}
        title="Schedule New Cohort Batch"
        onSubmit={handleCreateBatch}
        isSubmitting={isSubmitting}
        error={formError}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Parent Course</label>
            <select
              className="input-field"
              value={batchCourseId}
              onChange={(e) => setBatchCourseId(e.target.value)}
              style={{ width: '100%' }}
            >
              {courses.map((c) => (
                <option key={c.courseId} value={c.courseId}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Batch Code</label>
            <input
              type="text"
              className="input-field"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Batch Name</label>
          <input
            type="text"
            className="input-field"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Start Date</label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>End Date</label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Seat Capacity</label>
            <input
              type="number"
              className="input-field"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </FormDialog>

      {/* Modal: New Enquiry */}
      <FormDialog
        isOpen={showAddEnquiryModal}
        onClose={() => setShowAddEnquiryModal(false)}
        title="Record Prospective Student Enquiry"
        onSubmit={handleCreateEnquiry}
        isSubmitting={isSubmitting}
        error={formError}
      >
        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Student Full Name</label>
          <input
            type="text"
            className="input-field"
            value={enquiryName}
            onChange={(e) => setEnquiryName(e.target.value)}
            required
            placeholder="e.g. Priya Raman"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              className="input-field"
              value={enquiryEmail}
              onChange={(e) => setEnquiryEmail(e.target.value)}
              required
              placeholder="priya@example.com"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Phone / WhatsApp</label>
            <input
              type="tel"
              className="input-field"
              value={enquiryPhone}
              onChange={(e) => setEnquiryPhone(e.target.value)}
              required
              placeholder="+91 98400 12345"
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Target Course</label>
          <select
            className="input-field"
            value={enquiryCourseId}
            onChange={(e) => setEnquiryCourseId(e.target.value)}
            style={{ width: '100%' }}
          >
            {courses.map((c) => (
              <option key={c.courseId} value={c.courseId}>{c.name}</option>
            ))}
          </select>
        </div>
      </FormDialog>

      {/* Modal: Schedule Counselling */}
      <FormDialog
        isOpen={showAddSessionModal}
        onClose={() => setShowAddSessionModal(false)}
        title="Schedule 1-on-1 Counselling Appointment"
        onSubmit={handleCreateSession}
        isSubmitting={isSubmitting}
        error={formError}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Enquiry Candidate</label>
            <select
              className="input-field"
              value={sessionEnquiryId}
              onChange={(e) => setSessionEnquiryId(e.target.value)}
              style={{ width: '100%' }}
            >
              {enquiries.map((enq) => (
                <option key={enq.enquiryId} value={enq.enquiryId}>{enq.name} ({enq.courseName})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Assigned Counsellor</label>
            <select
              className="input-field"
              value={sessionCounsellorId}
              onChange={(e) => setSessionCounsellorId(e.target.value)}
              style={{ width: '100%' }}
            >
              {counsellors.map((cnl) => (
                <option key={cnl.counsellorId} value={cnl.counsellorId}>{cnl.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Session DateTime</label>
            <input
              type="text"
              className="input-field"
              value={sessionStart}
              onChange={(e) => setSessionStart(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Meeting Mode</label>
            <select
              className="input-field"
              value={sessionMode}
              onChange={(e) => setSessionMode(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="ONLINE">Online Video Call</option>
              <option value="CAMPUS_WALKIN">Campus Walk-in</option>
              <option value="PHONE">Phone Discussion</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Counsellor Notes</label>
          <textarea
            className="input-field"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows={2}
            style={{ width: '100%' }}
          />
        </div>
      </FormDialog>
    </div>
  );
}
