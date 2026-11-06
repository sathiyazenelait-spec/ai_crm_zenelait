import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { CheckSquare, Plus, Calendar, Clock, AlertCircle, CheckCircle2, User, Trash2, X, Check, Sparkles } from 'lucide-react';

export function TasksView() {
  const { tasks, toggleTaskStatus, addTask, deleteTask, addNotification, autoResolveDueTasks, aiEmployeesList } = useCRM();
  const [filter, setFilter] = useState('All'); // 'All' | 'Pending' | 'Completed' | 'High Priority'
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    relatedTo: 'General / Pipeline',
    priority: 'Medium',
    dueDate: 'Tomorrow',
    category: 'Follow-up'
  });

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addTask({
      title: quickTaskTitle.trim(),
      relatedTo: 'Quick Action',
      priority: 'Medium',
      dueDate: 'Today'
    });
    addNotification?.({
      type: 'crm',
      title: `Task created: ${quickTaskTitle.trim()}`,
      category: 'Tasks'
    });
    setQuickTaskTitle('');
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    addTask({
      title: taskForm.title.trim(),
      relatedTo: taskForm.relatedTo.trim() || 'General',
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      category: taskForm.category
    });
    addNotification?.({
      type: 'crm',
      title: `New task added: ${taskForm.title.trim()}`,
      category: 'Tasks'
    });
    setIsModalOpen(false);
    setTaskForm({
      title: '',
      relatedTo: 'General / Pipeline',
      priority: 'Medium',
      dueDate: 'Tomorrow',
      category: 'Follow-up'
    });
  };

  const handleDelete = (task) => {
    deleteTask(task.id);
    addNotification?.({
      type: 'warning',
      title: `Task removed: ${task.title}`,
      category: 'Tasks'
    });
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge-error';
      case 'Medium':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'Pending') return t.status !== 'Completed';
    if (filter === 'Completed') return t.status === 'Completed';
    if (filter === 'High Priority') return t.priority === 'High';
    return true;
  });

  return (
    <div className="tasks-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Tasks & Reminders</h1>
          <p>Organize daily sales follow-ups, meeting preparations, and customer action items</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>+ Add Task</span>
        </button>
      </div>

      {/* AI Task Workload Reducer Banner */}
      <div
        className="crm-card"
        style={{
          padding: '14px 20px',
          marginBottom: '18px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              fontSize: '1.2rem'
            }}
          >
            {aiEmployeesList?.[0]?.avatar || '⚡'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                AI Task Auto-Pilot & Workload Reducer
              </strong>
              <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>Automated Touchpoints</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Reduces manual staff workload by executing scheduled customer follow-up actions and auto-completing due reminders.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => autoResolveDueTasks()}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
        >
          <Sparkles size={14} />
          <span>⚡ AI Auto-Execute Pending Tasks</span>
        </button>
      </div>

      {/* Tabs & Quick Add Bar */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Pending', 'Completed', 'High Priority'].map((tab) => (
              <button
                key={tab}
                className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(tab)}
              >
                {tab === 'All' ? 'All Tasks' : tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleQuickAdd} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '420px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Quick add a new task and press Enter..."
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              style={{ height: '36px', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Task List Table Card */}
      <div className="crm-card">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Task Title</th>
                <th>Related To</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ width: 60, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No tasks found matching filter "{filter}". Click <strong>+ Add Task</strong> to create one.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isCompleted = t.status === 'Completed';

                  return (
                    <tr key={t.id} style={{ opacity: isCompleted ? 0.65 : 1 }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleTaskStatus(t.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                          title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                        />
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, textDecoration: isCompleted ? 'line-through' : 'none', color: 'var(--text-main)' }}>
                          {t.title}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{t.relatedTo || 'General'}</td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          <span>{t.dueDate}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isCompleted ? 'badge-qualified' : 'badge-new'}`}>
                          {t.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-xs"
                          style={{ color: '#ef4444' }}
                          title="Delete Task"
                          onClick={() => handleDelete(t)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD TASK MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="crm-modal" style={{ maxWidth: '500px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
                  Create Task or Reminder
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Assign priorities, due dates, and track completion progress.
                </p>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="crm-modal-body" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Task Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Follow up on Enterprise contract terms"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Related To (Lead / Deal / Account)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Corp / Rahul Sharma"
                    value={taskForm.relatedTo}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, relatedTo: e.target.value }))}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Priority</label>
                    <select
                      className="form-select"
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Due Date</label>
                    <select
                      className="form-select"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    >
                      <option value="Today">Today (EOD)</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="In 2 Days">In 2 Days</option>
                      <option value="Next Monday">Next Monday</option>
                      <option value="End of Month">End of Month</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Category</label>
                  <select
                    className="form-select"
                    value={taskForm.category}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  >
                    <option value="Follow-up">Customer Follow-up</option>
                    <option value="Meeting">Meeting Preparation</option>
                    <option value="Proposal">Contract / Proposal</option>
                    <option value="Support">Support Escalation</option>
                    <option value="Internal">Internal Review</option>
                  </select>
                </div>

              </div>

              <div className="crm-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Check size={16} /> Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
