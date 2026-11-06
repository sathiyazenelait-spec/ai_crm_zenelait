import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { X, UserPlus, Calendar, Upload, Shield, Bot, Briefcase } from 'lucide-react';
import { HRRegistrationModal } from './HRRegistrationModal';

export function ModalsContainer() {
  const {
    activeModal,
    setActiveModal,
    addLead,
    addCustomer,
    addAppointment,
    uploadDocument,
    inviteTeamMember,
    addAiAgent
  } = useCRM();

  if (!activeModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {activeModal === 'registerCompany' && <HRRegistrationModal onClose={() => setActiveModal(null)} />}
        {activeModal === 'addLead' && <AddLeadModal onClose={() => setActiveModal(null)} onAdd={addLead} />}
        {activeModal === 'addCustomer' && <AddCustomerModal onClose={() => setActiveModal(null)} onAdd={addCustomer} />}
        {activeModal === 'scheduleAppointment' && <ScheduleAptModal onClose={() => setActiveModal(null)} onAdd={addAppointment} />}
        {activeModal === 'uploadDoc' && <UploadDocModal onClose={() => setActiveModal(null)} onUpload={uploadDocument} />}
        {activeModal === 'inviteMember' && <InviteMemberModal onClose={() => setActiveModal(null)} onInvite={inviteTeamMember} />}
        {activeModal === 'createAgent' && <CreateAgentModal onClose={() => setActiveModal(null)} onAdd={addAiAgent} />}
      </div>
    </div>
  );
}

function AddLeadModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    companySize: '50-200',
    source: 'Website',
    status: 'New'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    onAdd(formData);
    onClose();
  };

  return (
    <div>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Add New Lead</h3>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Full Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Ramesh Patel"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Email *</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="ramesh@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="+91 98765 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Company</label>
              <input
                type="text"
                className="form-control"
                placeholder="Apex Infotech"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Designation</label>
              <input
                type="text"
                className="form-control"
                placeholder="CTO / Director"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Lead Source</label>
              <select
                className="form-control"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <option value="Website">Website</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Company Size</label>
              <select
                className="form-control"
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              >
                <option value="1-10">1-10 Employees</option>
                <option value="10-50">10-50 Employees</option>
                <option value="50-200">50-200 Employees</option>
                <option value="200-500">200-500 Employees</option>
                <option value="500+">500+ Employees</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Add Lead</button>
        </div>
      </form>
    </div>
  );
}

function AddCustomerModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    segment: 'Enterprise',
    plan: 'Enterprise Pro',
    mrr: '$1,200/mo'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onAdd(formData);
    onClose();
  };

  return (
    <div>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Add Customer</h3>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Customer Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Vikram Verma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Email</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="vikram@enterprise.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Company</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nexus Digital"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Segment</label>
              <select
                className="form-control"
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
              >
                <option value="Enterprise">Enterprise</option>
                <option value="SMB">SMB</option>
                <option value="Startup">Startup</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>MRR / Plan</label>
              <input
                type="text"
                className="form-control"
                placeholder="$999/mo"
                value={formData.mrr}
                onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create Customer</button>
        </div>
      </form>
    </div>
  );
}

function ScheduleAptModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    customer: '',
    company: '',
    dateTime: '',
    type: 'Product Demo',
    host: 'Rahul Kumar'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer) return;
    onAdd(formData);
    onClose();
  };

  return (
    <div>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Schedule Appointment</h3>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Customer Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Priya Sharma"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Date & Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="Oct 5, 2026 11:30 AM"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Meeting Type</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Product Demo">Product Demo</option>
                <option value="Consultation">Consultation</option>
                <option value="Support Call">Support Call</option>
                <option value="Tech Review">Tech Review</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Schedule Now</button>
        </div>
      </form>
    </div>
  );
}

function UploadDocModal({ onClose, onUpload }) {
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('PDF');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!docTitle) return;
    onUpload({ title: docTitle, type: docType, size: '2.8 MB' });
    onClose();
  };

  return (
    <div>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Upload Knowledge Doc</h3>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Document Title *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Sales Playbook 2026.pdf"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Doc Format</label>
            <select
              className="form-control"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="PDF">PDF File</option>
              <option value="DOCX">Word DOCX</option>
              <option value="URL">Live URL / Web Crawler</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Upload & Sync</button>
        </div>
      </form>
    </div>
  );
}

function InviteMemberModal({ onClose, onInvite }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Sales Executive');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    onInvite({ name, email, role });
    onClose();
  };

  return (
    <div>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Invite Team Member</h3>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Full Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Work Email *</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="aarav@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Role</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Sales Manager">Sales Manager</option>
              <option value="Sales Executive">Sales Executive</option>
              <option value="Support Agent">Support Agent</option>
              <option value="Analyst">Analyst / Admin</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Send Invite</button>
        </div>
      </form>
    </div>
  );
}

function CreateAgentModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAdd({ name, description });
    onClose();
  };

  return (
    <div>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Create AI Agent</h3>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Agent Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Lead Qualification Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Role & System Prompt</label>
            <textarea
              rows={4}
              className="form-control"
              placeholder="Describe what this AI agent should handle, tone of voice, knowledge access..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Deploy Agent</button>
        </div>
      </form>
    </div>
  );
}
