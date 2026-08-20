/**
 * MAA ENTERPRISES — ADMIN DASHBOARD CONTROLLER (js/admin.js)
 * Full Production Admin Suite:
 * - Real-time KPI statistics computation
 * - Requests & Applications management (Firestore 'requests' + 'applications' + Local)
 * - Dynamic Services Catalog CRUD (Firestore 'services')
 * - Resumes Management (Firestore 'resumes' + Local preview/print)
 * - Registered Users & Customer Profiles (Firestore 'users')
 * - Contact Inquiries & Center Settings
 * - Secure Firebase Auth Guard & Session Management
 */

import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  isFirebaseConfigured 
} from './firebase-config.js';
import { requireAdminAuth, logoutUser } from './auth.js';
import { showToast, formatDate, escapeHtml } from './app.js';

let applicationsList = [];
let servicesList = [];
let resumesList = [];
let usersList = [];
let tradeList = [];
let inquiriesList = [];

let currentEditingAppId = null;
let currentEditingServiceId = null;

// Initialize on DOM ready with auth guard
document.addEventListener('DOMContentLoaded', () => {
  requireAdminAuth((adminUser) => {
    initAdminDashboard(adminUser);
  });
});

function initAdminDashboard(adminUser) {
  const emailEl = document.getElementById('adminUserEmail');
  if (emailEl) {
    emailEl.textContent = adminUser.email || 'Center Admin';
  }

  document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => {
    await logoutUser();
  });

  initTabs();
  bindModals();
  loadAllDashboardData();
}

function initTabs() {
  const tabButtons = document.querySelectorAll('.admin-nav-tab');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      if (!targetId) return;

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = 'block';
      }
    });
  });
}

async function loadAllDashboardData() {
  await Promise.all([
    loadApplications(),
    loadServicesCatalog(),
    loadResumes(),
    loadUsers(),
    loadTradeRequests(),
    loadInquiries()
  ]);

  updateKPIMetrics();
}

/**
 * 1. Load Applications / Requests
 */
async function loadApplications() {
  applicationsList = [];

  // Local storage
  const stored = window.StorageService ? window.StorageService.getApplications() : [];
  stored.forEach(app => applicationsList.push(normalizeApplicationRecord(app)));

  // Firestore 'requests' & 'applications'
  if (isFirebaseConfigured && db) {
    try {
      const snap1 = await getDocs(collection(db, 'requests'));
      snap1.forEach(d => {
        const data = d.data();
        if (!applicationsList.some(a => a.requestId === d.id)) {
          applicationsList.push(normalizeApplicationRecord({ id: d.id, ...data }));
        }
      });

      const snap2 = await getDocs(collection(db, 'applications'));
      snap2.forEach(d => {
        const data = d.data();
        if (!applicationsList.some(a => a.requestId === d.id)) {
          applicationsList.push(normalizeApplicationRecord({ id: d.id, ...data }));
        }
      });
    } catch (err) {
      console.warn('[Admin] Firestore requests fetch notice:', err.message);
    }
  }

  // Sort descending by date
  applicationsList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  renderApplicationsTable(applicationsList);
  bindAppFilters();
}

function normalizeApplicationRecord(app) {
  return {
    id: app.id || app.requestId || 'REQ-UNKNOWN',
    requestId: app.requestId || app.id || 'REQ-UNKNOWN',
    userId: app.userId || 'guest',
    serviceName: app.serviceName || (app.serviceSnapshot && app.serviceSnapshot.name) || 'Online Service',
    category: app.category || app.serviceCategory || 'General',
    fullName: app.fullName || (app.customer && app.customer.name) || 'Applicant',
    mobile: app.mobile || (app.customer && app.customer.mobile) || '—',
    email: app.email || (app.customer && app.customer.email) || '',
    address: app.address || (app.customer && app.customer.address) || '',
    notes: app.notes || '',
    urgency: app.urgency || 'Standard',
    deliveryMode: app.deliveryMode || 'Counter / WhatsApp',
    attachedDocs: app.attachedDocs || [],
    status: app.status || 'pending',
    paymentStatus: app.paymentStatus || 'pending',
    publicRemark: app.publicRemark || '',
    adminNotes: app.adminNotes || '',
    createdAt: app.createdAt || new Date().toISOString(),
    updatedAt: app.updatedAt || new Date().toISOString()
  };
}

function renderApplicationsTable(apps) {
  const tbody = document.getElementById('adminAppsTableBody');
  if (!tbody) return;

  if (apps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-secondary);">No customer applications matching criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = apps.map(app => {
    const statusClass = 'status-' + (app.status || 'pending').toLowerCase();
    const paymentClass = 'status-' + (app.paymentStatus === 'paid' ? 'completed' : 'pending');
    const dateStr = app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent';

    return `
      <tr>
        <td><strong style="color:var(--accent-cyan); font-family:monospace;">${escapeHtml(app.requestId)}</strong></td>
        <td>
          <strong style="color:#ffffff;">${escapeHtml(app.fullName)}</strong>
          <div style="font-size:0.8125rem; color:var(--text-secondary);">+91 ${escapeHtml(app.mobile)}</div>
        </td>
        <td>
          <div style="color:#ffffff; font-weight:500;">${escapeHtml(app.serviceName)}</div>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(app.category)}</span>
        </td>
        <td style="color:var(--text-secondary); font-size:0.8125rem;">${dateStr}</td>
        <td><span class="status-badge ${statusClass}">${escapeHtml(app.status)}</span></td>
        <td><span class="status-badge ${paymentClass}">${escapeHtml(app.paymentStatus || 'pending')}</span></td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <button type="button" class="btn btn-outline btn-xs" onclick="openAppDetailsModal('${escapeHtml(app.requestId)}')">Manage</button>
            <a href="https://wa.me/91${escapeHtml(app.mobile.replace(/[^0-9]/g,''))}?text=Hello%20${encodeURIComponent(app.fullName)},%20regarding%20your%20request%20${encodeURIComponent(app.requestId)}" target="_blank" class="btn btn-secondary btn-xs" title="WhatsApp Applicant">WA</a>
            <button type="button" class="btn btn-outline btn-xs" onclick="deleteAppRequest('${escapeHtml(app.requestId)}')" style="color:var(--danger);" title="Delete">&times;</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function bindAppFilters() {
  const searchInput = document.getElementById('adminAppSearch');
  const statusFilter = document.getElementById('adminStatusFilter');
  const paymentFilter = document.getElementById('adminPaymentFilter');

  function applyFilter() {
    const q = searchInput?.value.trim().toLowerCase() || '';
    const st = statusFilter?.value || 'all';
    const pay = paymentFilter?.value || 'all';

    const filtered = applicationsList.filter(app => {
      const matchesQ = !q || 
        app.requestId.toLowerCase().includes(q) ||
        app.fullName.toLowerCase().includes(q) ||
        app.mobile.includes(q) ||
        app.serviceName.toLowerCase().includes(q);

      const matchesSt = st === 'all' || (app.status && app.status.toLowerCase() === st.toLowerCase());
      const matchesPay = pay === 'all' || (app.paymentStatus && app.paymentStatus.toLowerCase() === pay.toLowerCase());

      return matchesQ && matchesSt && matchesPay;
    });

    renderApplicationsTable(filtered);
  }

  searchInput?.addEventListener('input', applyFilter);
  statusFilter?.addEventListener('change', applyFilter);
  paymentFilter?.addEventListener('change', applyFilter);
  document.getElementById('refreshAppsBtn')?.addEventListener('click', () => loadApplications());
}

window.openAppDetailsModal = (requestId) => {
  const app = applicationsList.find(a => a.requestId === requestId || a.id === requestId);
  if (!app) return;

  currentEditingAppId = requestId;

  document.getElementById('modalAppIdTitle').textContent = `Manage Request: ${app.requestId}`;
  document.getElementById('detailApplicantName').textContent = app.fullName;
  document.getElementById('detailApplicantMobile').textContent = `+91 ${app.mobile}`;
  document.getElementById('detailApplicantService').textContent = app.serviceName;
  document.getElementById('detailApplicantDate').textContent = app.createdAt ? new Date(app.createdAt).toLocaleString('en-IN') : 'Recent';
  
  const docsEl = document.getElementById('detailUploadedDocs');
  if (docsEl) {
    if (app.attachedDocs && app.attachedDocs.length > 0) {
      docsEl.innerHTML = app.attachedDocs.map(d => `<span class="badge badge-accent">📄 ${escapeHtml(d.name)}</span>`).join(' ');
    } else {
      docsEl.textContent = 'None attached online (Submitted at counter / WhatsApp)';
    }
  }

  document.getElementById('detailStatusSelect').value = app.status || 'pending';
  document.getElementById('detailPaymentSelect').value = app.paymentStatus || 'pending';
  document.getElementById('detailPublicRemark').value = app.publicRemark || '';
  document.getElementById('detailAdminNote').value = app.adminNotes || '';

  const modal = document.getElementById('adminAppModal');
  if (modal) modal.classList.add('modal-active');
};

window.deleteAppRequest = async (requestId) => {
  if (!confirm(`Are you sure you want to permanently delete request ${requestId}?`)) return;

  // Local storage remove
  applicationsList = applicationsList.filter(a => a.requestId !== requestId && a.id !== requestId);
  if (window.StorageService) {
    window.StorageService.saveApplications(applicationsList);
  }

  // Firestore remove
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'requests', requestId));
      try { await deleteDoc(doc(db, 'applications', requestId)); } catch(e) {}
    } catch (err) {
      console.warn('Firestore delete notice:', err.message);
    }
  }

  renderApplicationsTable(applicationsList);
  updateKPIMetrics();
  showToast(`Request ${requestId} deleted.`, 'info');
};

/**
 * 2. Load Dynamic Services Catalog CRUD
 */
async function loadServicesCatalog() {
  servicesList = [];

  // Start with default catalog
  if (typeof getAllServices === 'function') {
    servicesList = getAllServices(false).map(s => ({ ...s }));
  }

  // Sync from Firestore 'services'
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'services'));
      if (!snap.empty) {
        const map = new Map();
        servicesList.forEach(s => map.set(s.id, s));
        snap.forEach(d => {
          map.set(d.id, { id: d.id, ...d.data() });
        });
        servicesList = Array.from(map.values());
      }
    } catch (err) {
      console.warn('[Admin] Firestore services fetch notice:', err.message);
    }
  }

  renderServicesTable(servicesList);
  bindServiceFilters();
}

function renderServicesTable(services) {
  const tbody = document.getElementById('adminServicesTableBody');
  if (!tbody) return;

  if (services.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-secondary);">No services catalog records found.</td></tr>';
    return;
  }

  tbody.innerHTML = services.map(s => {
    const isActive = s.active !== false;
    return `
      <tr>
        <td><strong style="color:#ffffff;">${escapeHtml(s.name)}</strong></td>
        <td><span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-secondary);">${escapeHtml(s.category)}</span></td>
        <td style="color:var(--accent-cyan); font-weight:600;">${escapeHtml(s.fee || 'Official Govt Fee')}</td>
        <td style="color:var(--text-secondary); font-size:0.8125rem;">${escapeHtml(s.processingTime || 'Same day')}</td>
        <td>
          <button type="button" class="btn btn-xs ${isActive ? 'btn-primary' : 'btn-outline'}" onclick="toggleServiceActive('${escapeHtml(s.id)}')">
            ${isActive ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <button type="button" class="btn btn-outline btn-xs" onclick="openEditServiceModal('${escapeHtml(s.id)}')">Edit</button>
            <button type="button" class="btn btn-outline btn-xs" onclick="deleteService('${escapeHtml(s.id)}')" style="color:var(--danger);">&times;</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function bindServiceFilters() {
  const searchInput = document.getElementById('adminServiceSearch');
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = servicesList.filter(s => 
      s.name.toLowerCase().includes(q) || 
      (s.category && s.category.toLowerCase().includes(q))
    );
    renderServicesTable(filtered);
  });

  document.getElementById('addNewServiceBtn')?.addEventListener('click', () => {
    openEditServiceModal(null);
  });
}


/**
 * Auto-Seed Baseline Services to Firestore (1-Click Setup for Fresh Firebase Projects)
 */
window.seedDefaultServicesToFirestore = async () => {
  if (!isFirebaseConfigured || !db) {
    showToast('Firebase is not yet configured or in offline mode.', 'warning');
    return;
  }
  if (!confirm('This will upload all 58+ default Cyber Cafe services to your Firebase Firestore. Proceed?')) return;

  const btn = document.getElementById('seedServicesBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Uploading Services...';
  }

  try {
    const services = typeof getAllServices === 'function' ? getAllServices(false) : [];
    let count = 0;
    for (const s of services) {
      await setDoc(doc(db, 'services', s.id), {
        ...s,
        serverTimestamp: serverTimestamp()
      });
      count++;
    }
    showToast(`Successfully initialized ${count} services in Firestore!`, 'success');
    await loadServicesCatalog();
  } catch (err) {
    showToast('Failed to seed services: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '⚡ Seed All Default Services';
    }
  }
};

window.toggleServiceActive = async (serviceId) => {
  const s = servicesList.find(item => item.id === serviceId);
  if (!s) return;

  s.active = !s.active;

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'services', serviceId), {
        active: s.active,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firestore service update notice:', e.message);
    }
  }

  renderServicesTable(servicesList);
  updateKPIMetrics();
  showToast(`Service "${s.name}" is now ${s.active ? 'Active' : 'Inactive'}.`, 'info');
};

window.openEditServiceModal = (serviceId) => {
  currentEditingServiceId = serviceId;
  const isNew = !serviceId;

  document.getElementById('serviceModalTitle').textContent = isNew ? 'Add New Cyber Cafe Service' : 'Edit Service';
  document.getElementById('editServiceId').value = serviceId || '';

  const s = isNew ? null : servicesList.find(item => item.id === serviceId);

  document.getElementById('serviceNameInput').value = s ? s.name : '';
  document.getElementById('serviceCategorySelect').value = s ? s.category : 'Government Jobs & Recruitment';
  document.getElementById('serviceShortDescInput').value = s ? s.shortDescription : '';
  document.getElementById('serviceFullDescInput').value = s ? (s.description || s.shortDescription) : '';
  document.getElementById('serviceDocsInput').value = s && Array.isArray(s.documents) ? s.documents.join(', ') : '';
  document.getElementById('serviceFeeInput').value = s ? (s.fee || '') : '';
  document.getElementById('serviceTurnaroundInput').value = s ? (s.processingTime || '') : '';
  document.getElementById('serviceActiveCheck').checked = s ? s.active !== false : true;

  document.getElementById('adminServiceModal')?.classList.add('modal-active');
};

window.deleteService = async (serviceId) => {
  const s = servicesList.find(item => item.id === serviceId);
  if (!confirm(`Are you sure you want to delete service "${s?.name || serviceId}"?`)) return;

  servicesList = servicesList.filter(item => item.id !== serviceId);

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch (e) {
      console.warn('Firestore service delete notice:', e.message);
    }
  }

  renderServicesTable(servicesList);
  updateKPIMetrics();
  showToast('Service deleted from catalog.', 'info');
};

/**
 * 3. Load Resumes (Firestore 'resumes' + localStorage)
 */
async function loadResumes() {
  resumesList = [];

  try {
    resumesList = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'resumes'));
      snap.forEach(d => {
        const data = d.data();
        if (!resumesList.some(r => (r.id === d.id || r.resumeId === d.id))) {
          resumesList.push({ id: d.id, ...data });
        }
      });
    } catch (e) {
      console.warn('Firestore resumes fetch notice:', e.message);
    }
  }

  renderResumesTable(resumesList);
}

function renderResumesTable(resumes) {
  const tbody = document.getElementById('adminResumesTableBody');
  if (!tbody) return;

  if (resumes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-secondary);">No customer resumes stored.</td></tr>';
    return;
  }

  tbody.innerHTML = resumes.map(r => {
    const candidateName = r.personal?.fullName || 'Untitled Candidate';
    const title = r.title || 'Professional Resume';
    const template = r.template || 'classic-professional';
    const dateStr = r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent';
    const resId = r.id || r.resumeId || 'RES-0';

    return `
      <tr>
        <td><strong style="color:#ffffff;">${escapeHtml(candidateName)}</strong></td>
        <td style="color:var(--accent-cyan);">${escapeHtml(title)}</td>
        <td><span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-secondary); text-transform:capitalize;">${escapeHtml(template)}</span></td>
        <td style="color:var(--text-secondary); font-size:0.8125rem;">${dateStr}</td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <a href="resume-maker.html?load=${encodeURIComponent(resId)}" target="_blank" class="btn btn-outline btn-xs">Open in Builder</a>
            <button type="button" class="btn btn-outline btn-xs" onclick="deleteAdminResume('${encodeURIComponent(resId)}')" style="color:var(--danger);">&times;</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteAdminResume = async (resumeId) => {
  if (!confirm('Delete this resume record?')) return;

  resumesList = resumesList.filter(r => r.id !== resumeId && r.resumeId !== resumeId);
  try {
    localStorage.setItem('maa_saved_resumes', JSON.stringify(resumesList));
  } catch(e) {}

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'resumes', resumeId));
    } catch(e) {}
  }

  renderResumesTable(resumesList);
  updateKPIMetrics();
  showToast('Resume deleted.', 'info');
};

/**
 * 4. Load Registered Customers (Firestore 'users' + localStorage)
 */
async function loadUsers() {
  usersList = [];

  try {
    usersList = JSON.parse(localStorage.getItem('maa_registered_users') || '[]');
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.forEach(d => {
        const data = d.data();
        if (!usersList.some(u => u.uid === d.id || u.email === data.email)) {
          usersList.push({ uid: d.id, ...data });
        }
      });
    } catch (e) {}
  }

  renderUsersTable(usersList);
}

function renderUsersTable(users) {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-secondary);">No customer profiles registered.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => {
    const name = u.name || u.fullName || 'Customer';
    const mobile = u.mobile ? `+91 ${u.mobile}` : '—';
    const email = u.email || '—';
    const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent';

    return `
      <tr>
        <td><strong style="color:#ffffff;">${escapeHtml(name)}</strong></td>
        <td style="color:var(--text-secondary);">${escapeHtml(mobile)}</td>
        <td style="color:var(--accent-cyan);">${escapeHtml(email)}</td>
        <td style="color:var(--text-secondary); font-size:0.8125rem;">${dateStr}</td>
        <td>
          <a href="https://wa.me/91${escapeHtml(u.mobile ? u.mobile.replace(/[^0-9]/g,'') : '')}" target="_blank" class="btn btn-secondary btn-xs">WhatsApp</a>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 5. Load Inquiries & Trade Requests
 */
async function loadTradeRequests() {
  tradeList = [];
  try {
    tradeList = JSON.parse(localStorage.getItem('maa_trade_requests') || '[]');
  } catch (e) {}

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'tradeRequests'));
      snap.forEach(d => tradeList.push({ id: d.id, ...d.data() }));
    } catch (e) {}
  }
}

async function loadInquiries() {
  inquiriesList = [];
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'inquiries'));
      snap.forEach(d => inquiriesList.push({ id: d.id, ...d.data() }));
    } catch (e) {}
  }

  const tbody = document.getElementById('adminInquiriesTableBody');
  if (tbody) {
    if (inquiriesList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-secondary);">No new customer contact inquiries.</td></tr>';
    } else {
      tbody.innerHTML = inquiriesList.map(inq => `
        <tr>
          <td><strong style="color:#ffffff;">${escapeHtml(inq.name || 'Visitor')}</strong></td>
          <td>${escapeHtml(inq.phone || '')}</td>
          <td>${escapeHtml(inq.message || '')}</td>
          <td>${inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-IN') : 'Recent'}</td>
          <td><a href="https://wa.me/91${escapeHtml((inq.phone||'').replace(/[^0-9]/g,''))}" target="_blank" class="btn btn-secondary btn-xs">Reply</a></td>
        </tr>
      `).join('');
    }
  }
}

/**
 * KPI Metric Aggregators
 */
function updateKPIMetrics() {
  const total = applicationsList.length;
  const pending = applicationsList.filter(a => a.status === 'pending').length;
  const processing = applicationsList.filter(a => a.status === 'processing' || a.status === 'in_progress').length;
  const completed = applicationsList.filter(a => a.status === 'completed').length;

  const todayStr = new Date().toDateString();
  const today = applicationsList.filter(a => a.createdAt && new Date(a.createdAt).toDateString() === todayStr).length;

  const activeSrv = servicesList.filter(s => s.active !== false).length;
  const totalRes = resumesList.length;
  const totalUsers = usersList.length;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setVal('kpiTotalApps', total);
  setVal('kpiPendingApps', pending);
  setVal('kpiProcessingApps', processing);
  setVal('kpiCompletedApps', completed);
  setVal('kpiTodayApps', today);
  setVal('kpiActiveServices', activeSrv);
  setVal('kpiTotalResumes', totalRes);
  setVal('kpiTotalUsers', totalUsers);
}

/**
 * Modal Event Handlers
 */
function bindModals() {
  // App Details Modal
  document.getElementById('closeAppModalBtn')?.addEventListener('click', () => {
    document.getElementById('adminAppModal')?.classList.remove('modal-active');
  });
  document.getElementById('cancelAppModalBtn')?.addEventListener('click', () => {
    document.getElementById('adminAppModal')?.classList.remove('modal-active');
  });

  document.getElementById('saveAppModalBtn')?.addEventListener('click', async () => {
    if (!currentEditingAppId) return;

    const newStatus = document.getElementById('detailStatusSelect').value;
    const newPayment = document.getElementById('detailPaymentSelect').value;
    const newPublicRemark = document.getElementById('detailPublicRemark').value.trim();
    const newNote = document.getElementById('detailAdminNote').value.trim();

    const app = applicationsList.find(a => (a.requestId === currentEditingAppId || a.id === currentEditingAppId));
    if (app) {
      app.status = newStatus;
      app.paymentStatus = newPayment;
      app.publicRemark = newPublicRemark;
      app.adminNotes = newNote;
      app.updatedAt = new Date().toISOString();
    }

    // Save to Local
    if (window.StorageService) {
      window.StorageService.saveApplications(applicationsList);
    }

    // Save to Firestore
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'requests', currentEditingAppId), {
          status: newStatus,
          paymentStatus: newPayment,
          publicRemark: newPublicRemark,
          adminNotes: newNote,
          updatedAt: serverTimestamp()
        });
        try {
          await updateDoc(doc(db, 'applications', currentEditingAppId), {
            status: newStatus,
            paymentStatus: newPayment,
            publicRemark: newPublicRemark,
            adminNotes: newNote,
            updatedAt: serverTimestamp()
          });
        } catch(e) {}
      } catch (err) {
        console.warn('Firestore update notice:', err.message);
      }
    }

    document.getElementById('adminAppModal')?.classList.remove('modal-active');
    renderApplicationsTable(applicationsList);
    updateKPIMetrics();
    showToast('Application updated successfully.', 'success');
  });

  // Service Modal
  document.getElementById('closeServiceModalBtn')?.addEventListener('click', () => {
    document.getElementById('adminServiceModal')?.classList.remove('modal-active');
  });
  document.getElementById('cancelServiceModalBtn')?.addEventListener('click', () => {
    document.getElementById('adminServiceModal')?.classList.remove('modal-active');
  });

  document.getElementById('saveServiceModalBtn')?.addEventListener('click', async () => {
    const editId = document.getElementById('editServiceId').value.trim();
    const name = document.getElementById('serviceNameInput').value.trim();
    const category = document.getElementById('serviceCategorySelect').value;
    const shortDescription = document.getElementById('serviceShortDescInput').value.trim();
    const description = document.getElementById('serviceFullDescInput').value.trim();
    const docsRaw = document.getElementById('serviceDocsInput').value.trim();
    const fee = document.getElementById('serviceFeeInput').value.trim();
    const processingTime = document.getElementById('serviceTurnaroundInput').value.trim();
    const active = document.getElementById('serviceActiveCheck').checked;

    if (!name || name.length < 3) {
      showToast('Please enter a valid service title.', 'warning');
      return;
    }
    if (!shortDescription) {
      showToast('Please provide a short description.', 'warning');
      return;
    }

    const documents = docsRaw ? docsRaw.split(',').map(d => d.trim()).filter(Boolean) : [];
    const serviceId = editId || ('srv-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

    const serviceRecord = {
      id: serviceId,
      name,
      category,
      shortDescription,
      description: description || shortDescription,
      documents,
      fee: fee || 'As per official notification',
      processingTime: processingTime || 'Same day counter processing',
      active,
      featured: true,
      updatedAt: new Date().toISOString()
    };

    const existingIdx = servicesList.findIndex(s => s.id === serviceId);
    if (existingIdx >= 0) {
      servicesList[existingIdx] = serviceRecord;
    } else {
      servicesList.unshift(serviceRecord);
    }

    // Save to Firestore
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'services', serviceId), {
          ...serviceRecord,
          serverTimestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore service save notice:', err.message);
      }
    }

    document.getElementById('adminServiceModal')?.classList.remove('modal-active');
    renderServicesTable(servicesList);
    updateKPIMetrics();
    showToast(`Service "${name}" saved to catalog.`, 'success');
  });
}
