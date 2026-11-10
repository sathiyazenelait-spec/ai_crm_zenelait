import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../services/api';
import {
  Users,
  Briefcase,
  UserPlus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bot,
  Plus,
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  ShieldCheck,
  ChevronRight,
  Download,
  FileCheck,
  Layers,
  Settings,
  HelpCircle,
  Play
} from 'lucide-react';

export function HRHub({ initialSubTab = 'employees' }) {
  const { companyProfile, currentUserName, addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState(initialSubTab); // 'employees' | 'recruitment' | 'onboarding' | 'leave' | 'requests' | 'policies' | 'ai-assistant'
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // 1. Employees Data State
  const [employees, setEmployees] = useState([
    {
      employeeId: 'EMP-1001',
      employeeCode: 'EMP-1001',
      fullName: 'Arun Kumar',
      firstName: 'Arun',
      lastName: 'Kumar',
      workEmail: 'arun.kumar@abctech.example',
      department: 'Information Technology',
      designation: 'Java Developer',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      joiningDate: '2026-11-02',
      phone: '+91 98765 11001'
    },
    {
      employeeId: 'EMP-1002',
      employeeCode: 'EMP-1002',
      fullName: 'Kavitha Raj',
      firstName: 'Kavitha',
      lastName: 'Raj',
      workEmail: 'kavitha.hr@abctech.example',
      department: 'Human Resources',
      designation: 'HR Executive',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      joiningDate: '2026-03-15',
      phone: '+91 98765 11002'
    },
    {
      employeeId: 'EMP-1003',
      employeeCode: 'EMP-1003',
      fullName: 'Rahul Sharma',
      firstName: 'Rahul',
      lastName: 'Sharma',
      workEmail: 'rahul.mgr@abctech.example',
      department: 'Sales & Business Dev',
      designation: 'Sales Manager',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      joiningDate: '2025-08-20',
      phone: '+91 98765 11003'
    }
  ]);

  // 2. Recruitment & ATS Data
  const [candidates, setCandidates] = useState([
    {
      candidateId: 'CAN-1001',
      fullName: 'Meena Raj',
      email: 'meena.candidate@example.com',
      phone: '+91-9000000011',
      source: 'CAREER_PAGE',
      skills: ['Java', 'Spring Boot', 'MySQL', 'AWS'],
      experienceYears: 2,
      stage: 'INTERVIEW', // APPLIED → SCREENING → INTERVIEW → OFFER → HIRED
      appliedRole: 'Senior Java Architect'
    },
    {
      candidateId: 'CAN-1002',
      fullName: 'Siddharth Rao',
      email: 'siddharth@example.com',
      phone: '+91-9000000022',
      source: 'LINKEDIN',
      skills: ['React', 'TypeScript', 'Node.js'],
      experienceYears: 4,
      stage: 'SCREENING',
      appliedRole: 'React / Frontend Lead'
    }
  ]);

  // 3. Onboarding Data
  const [onboardingPlan, setOnboardingPlan] = useState({
    onboardingId: 'ONB-1001',
    employeeId: 'EMP-1001',
    employeeName: 'Arun Kumar',
    role: 'Java Developer',
    startDate: '2026-11-02',
    templateId: 'ONBOARD-JAVA-DEV',
    tasks: [
      { id: 'T1', title: 'Verify employment documents and IDs', assignedTo: 'HR', dueDate: '2026-11-02', completed: true },
      { id: 'T2', title: 'Prepare laptop and developer cloud access', assignedTo: 'IT_ADMIN', dueDate: '2026-11-02', completed: false },
      { id: 'T3', title: 'Schedule team introduction & architecture walkthrough', assignedTo: 'MANAGER', dueDate: '2026-11-03', completed: false },
      { id: 'T4', title: 'Assign mentor and review 30-day coding roadmap', assignedTo: 'LEAD', dueDate: '2026-11-04', completed: false }
    ]
  });

  // 4. Leave Requests Data
  const [leaveRequests, setLeaveRequests] = useState([
    {
      requestId: 'LVR-1001',
      employeeId: 'EMP-1001',
      employeeName: 'Arun Kumar',
      leaveType: 'CASUAL_LEAVE',
      from: '2026-11-14',
      to: '2026-11-15',
      days: 2,
      reason: 'Family gathering / personal commitment',
      status: 'PENDING_APPROVAL',
      submittedAt: '2026-10-22'
    }
  ]);

  // 5. HR Service Requests
  const [serviceRequests, setServiceRequests] = useState([
    {
      requestId: 'HRR-1001',
      employeeId: 'EMP-1001',
      employeeName: 'Arun Kumar',
      category: 'EMPLOYMENT_LETTER',
      subject: 'Request for employment verification letter',
      description: 'I need an employment verification letter for home loan pre-approval.',
      priority: 'NORMAL',
      status: 'OPEN',
      channel: 'HR_PORTAL',
      createdAt: '2026-10-22'
    }
  ]);

  // Modals state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpCode, setNewEmpCode] = useState('EMP-1004');
  const [newEmpFirst, setNewEmpFirst] = useState('');
  const [newEmpLast, setNewEmpLast] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Information Technology');
  const [newEmpDesig, setNewEmpDesig] = useState('Java Developer');
  const [newEmpJoin, setNewEmpJoin] = useState('2026-11-02');

  const [showAddCanModal, setShowAddCanModal] = useState(false);
  const [newCanName, setNewCanName] = useState('');
  const [newCanEmail, setNewCanEmail] = useState('');
  const [newCanPhone, setNewCanPhone] = useState('');
  const [newCanSkills, setNewCanSkills] = useState('Java, Spring Boot, MySQL');
  const [newCanExp, setNewCanExp] = useState(3);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Zenelait HR Assistant. Ask me about company leave policies, onboarding procedures, or employee verification letters.' }
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [automationResult, setAutomationResult] = useState(null);

  // Handle Add Employee
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    const newEmp = {
      employeeId: newEmpCode,
      employeeCode: newEmpCode,
      fullName: `${newEmpFirst} ${newEmpLast}`,
      firstName: newEmpFirst,
      lastName: newEmpLast,
      workEmail: newEmpEmail,
      department: newEmpDept,
      designation: newEmpDesig,
      employmentStatus: 'PRE_ONBOARDING',
      employmentType: 'FULL_TIME',
      joiningDate: newEmpJoin,
      phone: '+91 90000 00000'
    };

    setEmployees(prev => [newEmp, ...prev]);
    setShowAddEmpModal(false);

    // Call API client
    api.createHrEmployee(newEmp);

    addNotification({
      type: 'system',
      title: `Employee ${newEmp.fullName} (${newEmpCode}) created successfully!`,
      category: 'HR'
    });
  };

  // Handle Add Candidate
  const handleAddCandidateSubmit = async (e) => {
    e.preventDefault();
    const newCan = {
      candidateId: `CAN-${candidates.length + 1001}`,
      fullName: newCanName,
      email: newCanEmail,
      phone: newCanPhone,
      source: 'CAREER_PAGE',
      skills: newCanSkills.split(',').map(s => s.trim()),
      experienceYears: Number(newCanExp),
      stage: 'APPLIED',
      appliedRole: 'Software Engineer'
    };

    setCandidates(prev => [newCan, ...prev]);
    setShowAddCanModal(false);

    api.addHrCandidate(newCan);

    addNotification({
      type: 'system',
      title: `Candidate ${newCanName} added to recruitment pipeline!`,
      category: 'HR'
    });
  };

  // Toggle Onboarding Task
  const toggleTask = (taskId) => {
    setOnboardingPlan(prev => {
      const updatedTasks = prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const completedCount = updatedTasks.filter(t => t.completed).length;
      return {
        ...prev,
        tasks: updatedTasks,
        progressPercent: Math.round((completedCount / updatedTasks.length) * 100)
      };
    });
    api.updateHrOnboardingTask(taskId);
  };

  // Approve Leave
  const approveLeave = (requestId) => {
    setLeaveRequests(prev => prev.map(l => l.requestId === requestId ? { ...l, status: 'APPROVED' } : l));
    api.approveHrLeaveRequest(requestId, 'Approved according to configured leave policy');
    addNotification({
      type: 'system',
      title: `Leave request ${requestId} approved successfully!`,
      category: 'HR'
    });
  };

  // Reject Leave
  const rejectLeave = (requestId) => {
    setLeaveRequests(prev => prev.map(l => l.requestId === requestId ? { ...l, status: 'REJECTED' } : l));
    api.rejectHrLeaveRequest(requestId, 'Insufficient leave balance or blackout period');
    addNotification({
      type: 'system',
      title: `Leave request ${requestId} rejected.`,
      category: 'HR'
    });
  };

  // Run Onboarding Dry-Run Automation
  const runOnboardingAutomation = async () => {
    setAutomationResult({ status: 'RUNNING', message: 'Executing WF-ONBOARDING in DRY_RUN mode...' });
    const res = await api.runHrAutomation('WF-ONBOARDING', 'DRY_RUN', { employeeId: 'EMP-1001', templateId: 'ONBOARD-JAVA-DEV' });

    setTimeout(() => {
      setAutomationResult({
        status: 'SUCCESS',
        runId: res.data?.runId || 'HR-RUN-1001',
        mode: 'DRY_RUN',
        steps: [
          'Step 1: Authenticated HR trigger context for EMP-1001 [PASSED]',
          'Step 2: Dry-run verified IT developer laptop provisioning checklist [PASSED]',
          'Step 3: Segregation of duties validated (No real emails sent in dry-run) [PASSED]',
          'Step 4: Audit trail logged in security vault [COMPLETED]'
        ]
      });
      addNotification({
        type: 'system',
        title: 'Onboarding dry-run automation completed with 0 errors',
        category: 'Automation'
      });
    }, 700);
  };

  // Handle AI Chat Send
  const handleAiSend = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    const q = userQuery;
    setChatMessages(prev => [...prev, { sender: 'user', text: q }]);
    setUserQuery('');

    setTimeout(() => {
      let reply = "Under company policy POL-01, full-time employees are entitled to 12 Casual Leaves and 10 Sick Leaves per fiscal year. Requests can be submitted via the Leave tab.";
      if (q.toLowerCase().includes('onboard') || q.toLowerCase().includes('join')) {
        reply = "For new joiners like Arun Kumar (EMP-1001), use the Onboarding Checklist tab to verify background docs and request IT laptop provisioning.";
      } else if (q.toLowerCase().includes('letter') || q.toLowerCase().includes('verify')) {
        reply = "Employment verification letters can be generated from the HR Service Requests tab with 1-click under request code HRR-1001.";
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 500);
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="hr-hub-container">
      {/* Page Title */}
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Human Resources Management Hub 🏢</h1>
          <p>Full employee lifecycle, recruitment ATS, onboarding, leave, and HR automation for {companyProfile.name}</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowAddEmpModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={14} />
            <span>+ Add Employee (EMP)</span>
          </button>
          <button
            onClick={() => setShowAddCanModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Briefcase size={14} />
            <span>+ Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'employees', label: `Employees Directory (${employees.length})`, icon: Users },
            { id: 'recruitment', label: `Recruitment ATS (${candidates.length})`, icon: Briefcase },
            { id: 'onboarding', label: 'Onboarding & Checklists', icon: Sparkles },
            { id: 'leave', label: `Leave & Attendance (${leaveRequests.length})`, icon: Calendar },
            { id: 'requests', label: `Service Requests (${serviceRequests.length})`, icon: MessageSquare },
            { id: 'policies', label: 'Policies & Documents', icon: FileText },
            { id: 'ai-assistant', label: 'HR AI Assistant & Automations', icon: Bot }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          TAB 1: EMPLOYEES DIRECTORY
      ======================================================== */}
      {activeTab === 'employees' && (
        <div className="crm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, maxWidth: '500px' }}>
              <div className="search-bar-wrapper" style={{ flex: 1 }}>
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search by employee name, code, designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-control"
                style={{ width: '180px', fontSize: '0.78rem', padding: '6px 10px' }}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Business Dev">Sales & Business Dev</option>
              </select>
            </div>

            <button
              onClick={() => {
                const csv = "EmployeeCode,FullName,Email,Department,Designation,Status\n" +
                  employees.map(e => `${e.employeeCode},${e.fullName},${e.workEmail},${e.department},${e.designation},${e.employmentStatus}`).join("\n");
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Employees_${companyProfile.name}.csv`;
                a.click();
              }}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Full Name</th>
                  <th>Work Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.employeeId}>
                    <td>
                      <span className="badge badge-secondary" style={{ fontWeight: 700 }}>
                        {emp.employeeCode}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {emp.fullName}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{emp.workEmail}</td>
                    <td>{emp.department}</td>
                    <td style={{ fontWeight: 500, color: 'var(--primary)' }}>{emp.designation}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{emp.joiningDate}</td>
                    <td>
                      <span className={`badge ${emp.employmentStatus === 'ACTIVE' ? 'badge-qualified' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                        ● {emp.employmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: RECRUITMENT ATS
      ======================================================== */}
      {activeTab === 'recruitment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Job Openings Banner */}
          <div className="crm-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Active Job Requisitions</h3>
              <span className="badge badge-primary">2 Active Openings</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Senior Java Cloud Architect (JOB-101)</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>IT / Engineering • 2 Openings • Chennai / Hybrid</div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>● Status: OPEN</div>
              </div>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>React / Frontend Lead (JOB-102)</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>IT / Engineering • 3 Openings • Remote</div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>● Status: OPEN</div>
              </div>
            </div>
          </div>

          {/* Kanban ATS Stages */}
          <div className="crm-card">
            <div className="crm-card-header">
              <div>
                <h2 className="crm-card-title">Applicant Tracking Pipeline (ATS)</h2>
                <p className="crm-card-subtitle">Drag or advance candidates through the hiring pipeline</p>
              </div>
              <span className="badge badge-qualified">Automated Interview Reminders</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
              {['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'].map((stage) => {
                const stageCandidates = candidates.filter(c => c.stage === stage);
                return (
                  <div
                    key={stage}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      padding: '12px',
                      minHeight: '260px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{stage}</span>
                      <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{stageCandidates.length}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {stageCandidates.map((c) => (
                        <div
                          key={c.candidateId}
                          style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>{c.fullName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{c.appliedRole}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>{c.skills.join(', ')}</div>

                          {stage === 'INTERVIEW' && (
                            <button
                              onClick={() => {
                                setCandidates(prev => prev.map(item => item.candidateId === c.candidateId ? { ...item, stage: 'OFFER' } : item));
                                addNotification({ type: 'system', title: `Candidate ${c.fullName} moved to OFFER stage!`, category: 'HR' });
                              }}
                              className="btn btn-primary btn-xs"
                              style={{ width: '100%', marginTop: '8px', fontSize: '0.68rem' }}
                            >
                              Move to Offer →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: ONBOARDING & CHECKLISTS
      ======================================================== */}
      {activeTab === 'onboarding' && (
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2 className="crm-card-title">Employee Onboarding Plan: {onboardingPlan.employeeName} ({onboardingPlan.role})</h2>
              <p className="crm-card-subtitle">Template: {onboardingPlan.templateId} • Joining Date: {onboardingPlan.startDate}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-primary">Progress: {onboardingPlan.progressPercent}%</span>
              <button
                onClick={runOnboardingAutomation}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Play size={13} style={{ color: '#10b981' }} />
                <span>Run Dry-Run Workflow</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {onboardingPlan.tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  opacity: task.completed ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Assigned To: <strong style={{ color: 'var(--primary)' }}>{task.assignedTo}</strong> • Due: {task.dueDate}
                    </div>
                  </div>
                </div>

                <span className={`badge ${task.completed ? 'badge-qualified' : 'badge-waiting'}`} style={{ fontSize: '0.7rem' }}>
                  {task.completed ? '✓ Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          {/* Dry Run Result Box */}
          {automationResult && (
            <div style={{ marginTop: '20px', padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>
                ✓ Automation Dry-Run Completed ({automationResult.runId})
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {automationResult.steps?.map((s, idx) => (
                  <li key={idx} style={{ marginBottom: '2px' }}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 4: LEAVE & ATTENDANCE
      ======================================================== */}
      {activeTab === 'leave' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="crm-card">
            <div className="crm-card-header">
              <div>
                <h2 className="crm-card-title">Leave Approval Queue</h2>
                <p className="crm-card-subtitle">Segregation of duties: HR approval authority</p>
              </div>
              <span className="badge badge-warning">Action Required</span>
            </div>

            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((l) => (
                    <tr key={l.requestId}>
                      <td><span className="badge badge-secondary">{l.requestId}</span></td>
                      <td style={{ fontWeight: 600 }}>{l.employeeName}</td>
                      <td style={{ color: 'var(--primary)' }}>{l.leaveType}</td>
                      <td>{l.from} to {l.to} ({l.days} days)</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{l.reason}</td>
                      <td>
                        <span className={`badge ${l.status === 'APPROVED' ? 'badge-qualified' : l.status === 'REJECTED' ? 'badge-error' : 'badge-waiting'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.status === 'PENDING_APPROVAL' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => approveLeave(l.requestId)} className="btn btn-primary btn-xs" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
                              Approve
                            </button>
                            <button onClick={() => rejectLeave(l.requestId)} className="btn btn-secondary btn-xs" style={{ color: '#ef4444' }}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Actioned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: SERVICE REQUESTS QUEUE
      ======================================================== */}
      {activeTab === 'requests' && (
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2 className="crm-card-title">Internal HR Helpdesk & Service Requests</h2>
              <p className="crm-card-subtitle">Employee requests for documents, policy clarifications, and letters</p>
            </div>
            <button
              onClick={() => {
                const newReq = {
                  requestId: `HRR-${serviceRequests.length + 1001}`,
                  employeeId: 'EMP-1001',
                  employeeName: 'Arun Kumar',
                  category: 'BONAFIDE_CERTIFICATE',
                  subject: 'Visa bonafide letter request',
                  description: 'Required for UK business visa travel.',
                  priority: 'HIGH',
                  status: 'OPEN',
                  channel: 'HR_PORTAL',
                  createdAt: new Date().toISOString().split('T')[0]
                };
                setServiceRequests(prev => [newReq, ...prev]);
                addNotification({ type: 'system', title: 'New HR Service Request logged', category: 'HR' });
              }}
              className="btn btn-primary btn-sm"
            >
              + Log New HR Request
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {serviceRequests.map((req) => (
              <div
                key={req.requestId}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-secondary">{req.requestId}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{req.subject}</span>
                    <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{req.priority}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Requested by <strong>{req.employeeName}</strong> • Category: {req.category}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    "{req.description}"
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setServiceRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, status: 'RESOLVED' } : r));
                      addNotification({ type: 'system', title: `Request ${req.requestId} marked as resolved`, category: 'HR' });
                    }}
                    className="btn btn-primary btn-xs"
                  >
                    {req.status === 'RESOLVED' ? '✓ Resolved' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: POLICIES & DOCUMENTS
      ======================================================== */}
      {activeTab === 'policies' && (
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2 className="crm-card-title">Company HR Policies & Document Templates</h2>
              <p className="crm-card-subtitle">Approved corporate handbooks and employment letter templates</p>
            </div>
            <button
              onClick={() => addNotification({ type: 'system', title: 'Policy registration dialog opened', category: 'HR' })}
              className="btn btn-primary btn-sm"
            >
              + Upload Policy
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {[
              { id: 'POL-01', title: 'Annual Leave & Holiday Calendar 2026', cat: 'Leave Policy', date: 'Jan 05, 2026' },
              { id: 'POL-02', title: 'Information Security & Device Access Policy', cat: 'IT & Security', date: 'Feb 12, 2026' },
              { id: 'POL-03', title: 'Remote Work & Hybrid Attendance Guidelines', cat: 'Workplace', date: 'Mar 01, 2026' },
              { id: 'DOC-TMP-01', title: 'Standard Employment Verification Letter Template', cat: 'Templates', date: 'Apr 10, 2026' }
            ].map((p, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <span className="badge badge-secondary" style={{ fontSize: '0.68rem', marginBottom: '6px' }}>{p.cat}</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>{p.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Published: {p.date}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => addNotification({ type: 'system', title: `Downloading ${p.title}`, category: 'HR' })}
                    className="btn btn-secondary btn-xs"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: HR AI ASSISTANT & AUTOMATIONS
      ======================================================== */}
      {activeTab === 'ai-assistant' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Live Chat with HR Helpdesk Assistant */}
          <div className="crm-card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
            <div className="crm-card-header" style={{ marginBottom: '8px' }}>
              <div>
                <h2 className="crm-card-title">HR Helpdesk AI Assistant (AI-HR-001)</h2>
                <p className="crm-card-subtitle">Autonomous query answering with human guardrails</p>
              </div>
              <span className="badge badge-qualified">● Online</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0' }}>
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
                    color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
                    border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                    fontSize: '0.8rem',
                    lineHeight: 1.45
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleAiSend} style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ask about leave rules, onboarding checklists, or verification letters..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                style={{ flex: 1, fontSize: '0.8rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Send size={14} />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* HR Automations Control Box */}
          <div className="crm-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="crm-card-header" style={{ marginBottom: 0 }}>
              <div>
                <h2 className="crm-card-title">Authorized HR Automations</h2>
                <p className="crm-card-subtitle">Execute compliant workflows with dry-run verification</p>
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>WF-ONBOARDING</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '4px 0 8px 0' }}>
                Triggers IT laptop provisioning and manager introduction tasks upon employee creation.
              </div>
              <button
                onClick={runOnboardingAutomation}
                className="btn btn-primary btn-xs"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Play size={12} />
                <span>Run Dry-Run Mode</span>
              </button>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#d97706' }}>
                <ShieldCheck size={14} />
                <span>Human-in-the-Loop Guardrail</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                AI-generated recommendations will not independently terminate staff, alter payroll, or make high-impact employment decisions without authorized HR sign-off.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD EMPLOYEE (EMP-1001)
      ======================================================== */}
      {showAddEmpModal && (
        <div className="modal-backdrop" onClick={() => setShowAddEmpModal(false)}>
          <div className="crm-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h2>+ Create New Employee Record</h2>
              <button type="button" className="btn-close" onClick={() => setShowAddEmpModal(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddEmployeeSubmit}>
              <div className="crm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Employee Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newEmpCode}
                    onChange={(e) => setNewEmpCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Joining Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newEmpJoin}
                    onChange={(e) => setNewEmpJoin(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Arun"
                    value={newEmpFirst}
                    onChange={(e) => setNewEmpFirst(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Kumar"
                    value={newEmpLast}
                    onChange={(e) => setNewEmpLast(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Work Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="arun.kumar@abctech.example"
                  value={newEmpEmail}
                  onChange={(e) => setNewEmpEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Department *</label>
                  <select
                    className="form-control"
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales & Business Dev">Sales & Business Dev</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Designation *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Java Developer"
                    value={newEmpDesig}
                    onChange={(e) => setNewEmpDesig(e.target.value)}
                    required
                  />
                </div>
              </div>

              </div>

              <div className="crm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEmpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD CANDIDATE (CAN-1001)
      ======================================================== */}
      {showAddCanModal && (
        <div className="modal-backdrop" onClick={() => setShowAddCanModal(false)}>
          <div className="crm-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h2>+ Add Candidate to ATS</h2>
              <button type="button" className="btn-close" onClick={() => setShowAddCanModal(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddCandidateSubmit}>
              <div className="crm-modal-body">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Meena Raj"
                  value={newCanName}
                  onChange={(e) => setNewCanName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="meena@example.com"
                    value={newCanEmail}
                    onChange={(e) => setNewCanEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+91-9000000011"
                    value={newCanPhone}
                    onChange={(e) => setNewCanPhone(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Skills (Comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Java, Spring Boot, MySQL"
                  value={newCanSkills}
                  onChange={(e) => setNewCanSkills(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Experience (Years)</label>
                <input
                  type="number"
                  className="form-control"
                  value={newCanExp}
                  onChange={(e) => setNewCanExp(e.target.value)}
                />
              </div>

              </div>

              <div className="crm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCanModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add to Pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
