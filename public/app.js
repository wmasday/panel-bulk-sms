// App Constants
const API_BASE = '/api';

// State Management
const state = {
    apiKey: localStorage.getItem('apiKey') || '',
    currentRoute: 'phones',
    data: {
        phones: [],
        groups: [],
        templates: [],
        transactions: []
    }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    document.getElementById('login-form').addEventListener('submit', handleLogin);
});

// --- Auth Functions ---
function checkAuth() {
    if (state.apiKey) {
        showApp();
        router.navigate(state.currentRoute);
    } else {
        showLogin();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const key = document.getElementById('api-key').value;

    if (key) {
        state.apiKey = key;
        localStorage.setItem('apiKey', key);

        Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: 'You have successfully logged in.',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        }).then(() => {
            showApp();
            router.navigate('phones');
        });
    }
}

function logout() {
    Swal.fire({
        title: 'Sign Out?',
        text: "You will need to re-enter your API key to access the panel.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#f1f5f9',
        confirmButtonText: '<span class="px-4">Logout</span>',
        cancelButtonText: '<span class="text-slate-600">Cancel</span>',
        customClass: {
            confirmButton: 'rounded-xl',
            cancelButton: 'rounded-xl'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            state.apiKey = '';
            localStorage.removeItem('apiKey');
            showLogin();
        }
    });
}

function showLogin() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
}

// --- API Helper ---
async function apiCall(endpoint, method = 'GET', body = null) {
    // Add show_all=true for list requests from the panel
    const separator = endpoint.includes('?') ? '&' : '?';
    const finalEndpoint = method === 'GET' ? `${endpoint}${separator}show_all=true` : endpoint;

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': state.apiKey
        }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE}${finalEndpoint}`, options);
        if (response.status === 401) {
            state.apiKey = '';
            localStorage.removeItem('apiKey');
            showLogin();
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API Error');
        }
        return await response.json();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'API Error',
            text: error.message,
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
        });
        throw error;
    }
}

// --- Router ---
const router = {
    navigate: async (route) => {
        state.currentRoute = route;
        updateNavbar();
        renderLoader();

        try {
            switch (route) {
                case 'phones': await renderPhones(); break;
                case 'groups': await renderGroups(); break;
                case 'templates': await renderTemplates(); break;
                case 'transactions': await renderTransactions(); break;
            }
        } catch (e) {
            console.error(e);
        }
    }
};

function updateNavbar() {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('onclick').includes(state.currentRoute)) {
            link.classList.add('bg-blue-50', 'text-blue-600', 'font-bold');
        } else {
            link.classList.remove('bg-blue-50', 'text-blue-600', 'font-bold');
        }
    });
}

function renderLoader() {
    document.getElementById('content').innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 animate-pulse">
            <div class="loader ease-linear rounded-full border-4 border-t-4 border-slate-200 h-12 w-12 mb-4"></div>
            <p class="text-slate-500">Loading data...</p>
        </div>
    `;
}

// --- Utility: Toggle Component ---
function renderToggle(id, checked, label) {
    return `
        <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4 transition-all hover:bg-slate-100/50">
            <span class="text-sm font-semibold text-slate-700">${label}</span>
            <label class="switch">
                <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>
    `;
}

// --- Module: Phones ---
async function renderPhones() {
    const phones = await apiCall('/phones');
    state.data.phones = phones;

    document.getElementById('content').innerHTML = `
        <div class="flex justify-between items-center mb-8 page-enter">
            <div>
                <h2 class="text-3xl font-extrabold text-slate-800">Phones</h2>
                <p class="text-slate-500">Manage individual sender numbers</p>
            </div>
            <button onclick="addPhone()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center">
                <i class="fas fa-plus mr-2 text-xs"></i> New Phone
            </button>
        </div>
        
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden page-enter">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50/50">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Number</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Linked Group</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                    ${phones.map(p => `
                        <tr class="hover:bg-slate-50/30 transition-colors group">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm font-bold text-slate-900">${p.phone}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                ${p.Group ? `<span class="bg-slate-100 px-2 py-1 rounded text-xs">${p.Group.title || `Group #${p.Group.id}`} (${p.Group.type})</span>` : '<span class="text-slate-400 italic">None</span>'}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2.5 py-1 text-[10px] font-black rounded-lg uppercase ${p.type === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">
                                    ${p.type}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="flex items-center text-xs font-bold ${p.status ? 'text-emerald-600' : 'text-slate-400'}">
                                    <span class="w-1.5 h-1.5 rounded-full ${p.status ? 'bg-emerald-500' : 'bg-slate-400'} mr-2"></span>
                                    ${p.status ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onclick="editPhone(${p.id})" class="text-blue-500 hover:text-blue-700 p-2"><i class="fas fa-edit"></i></button>
                                    <button onclick="deletePhone(${p.id})" class="text-red-400 hover:text-red-600 p-2"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                    ${phones.length === 0 ? '<tr><td colspan="5" class="px-6 py-12 text-center text-slate-400 italic">No records found</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
}

async function addPhone() {
    if (state.data.groups.length === 0) await apiCall('/groups').then(d => state.data.groups = d);

    const { value: formValues } = await Swal.fire({
        title: 'Register New Phone',
        html: `
            <div class="text-left space-y-4 pt-4">
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                    <input id="swal-phone" class="swal2-input !mt-1 w-full m-0 rounded-xl" placeholder="e.g. 08123456789">
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Channel Type</label>
                    <select id="swal-type" class="swal2-input !mt-1 !w-full rounded-xl">
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                    </select>
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Assign to Group</label>
                    <select id="swal-group-id" class="swal2-input !mt-1 !w-full rounded-xl">
                        <option value="">No Group</option>
                        ${state.data.groups.map(g => `<option value="${g.id}">${g.title || `Group #${g.id}`} (${g.type})</option>`).join('')}
                    </select>
                </div>
                ${renderToggle('swal-status', true, 'Set as Active Number')}
            </div>
        `,
        confirmButtonText: 'Create Phone',
        confirmButtonColor: '#2563eb',
        customClass: { confirmButton: 'rounded-xl py-3 px-8' },
        preConfirm: () => {
            return {
                phone: document.getElementById('swal-phone').value,
                type: document.getElementById('swal-type').value,
                group_id: document.getElementById('swal-group-id').value || null,
                status: document.getElementById('swal-status').checked
            }
        }
    });

    if (formValues) {
        if (!formValues.phone) return Swal.fire({ icon: 'error', title: 'Wait...', text: 'Phone number is required' });
        await apiCall('/phones', 'POST', formValues);
        Swal.fire({ icon: 'success', title: 'Saved!', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        router.navigate('phones');
    }
}

async function editPhone(id) {
    const p = state.data.phones.find(x => x.id === id);
    if (state.data.groups.length === 0) await apiCall('/groups').then(d => state.data.groups = d);

    const { value: formValues } = await Swal.fire({
        title: 'Update Phone Info',
        html: `
            <div class="text-left space-y-4 pt-4">
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                    <input id="swal-phone" class="swal2-input w-full m-0 !mt-1 rounded-xl" value="${p.phone}">
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Channel Type</label>
                    <select id="swal-type" class="swal2-input !mt-1 !w-full rounded-xl">
                        <option value="whatsapp" ${p.type === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                        <option value="sms" ${p.type === 'sms' ? 'selected' : ''}>SMS</option>
                    </select>
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Linked Group</label>
                    <select id="swal-group-id" class="swal2-input !mt-1 !w-full rounded-xl">
                        <option value="">No Group</option>
                        ${state.data.groups.map(g => `<option value="${g.id}" ${p.group_id == g.id ? 'selected' : ''}>${g.title || `Group #${g.id}`} (${g.type})</option>`).join('')}
                    </select>
                </div>
                ${renderToggle('swal-status', p.status, 'Phone Active Status')}
            </div>
        `,
        confirmButtonText: 'Save Changes',
        confirmButtonColor: '#2563eb',
        customClass: { confirmButton: 'rounded-xl py-3 px-8' },
        preConfirm: () => {
            return {
                phone: document.getElementById('swal-phone').value,
                type: document.getElementById('swal-type').value,
                group_id: document.getElementById('swal-group-id').value || null,
                status: document.getElementById('swal-status').checked
            }
        }
    });

    if (formValues) {
        await apiCall(`/phones/${id}`, 'PUT', formValues);
        Swal.fire({ icon: 'success', title: 'Updated!', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        router.navigate('phones');
    }
}

async function deletePhone(id) {
    const result = await Swal.fire({
        title: 'Delete Phone?',
        text: "This removal is permanent.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Yes, remove it'
    });
    if (result.isConfirmed) {
        await apiCall(`/phones/${id}`, 'DELETE');
        router.navigate('phones');
    }
}

// --- Module: Groups ---
async function renderGroups() {
    const groups = await apiCall('/groups');
    state.data.groups = groups;

    document.getElementById('content').innerHTML = `
        <div class="flex justify-between items-center mb-8 page-enter">
            <div>
                <h2 class="text-3xl font-extrabold text-slate-800">Groups</h2>
                <p class="text-slate-500">Categorize your sender numbers</p>
            </div>
            <button onclick="addGroup()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200">
                <i class="fas fa-plus mr-2 text-xs"></i> New Group
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-enter">
            ${groups.map(g => `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:scale-[1.02] transition-all duration-300 group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <i class="fas fa-layer-group fa-lg"></i>
                        </div>
                        <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onclick="editGroup(${g.id})" class="p-2 text-slate-400 hover:text-blue-600"><i class="fas fa-edit"></i></button>
                             <button onclick="deleteGroup(${g.id})" class="p-2 text-slate-400 hover:text-red-500"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <h3 class="font-bold text-slate-800 text-lg">${g.title || `Group #${g.id}`}</h3>
                    <div class="mt-2 flex space-x-2">
                         <span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 uppercase text-slate-600">${g.type}</span>
                         <span class="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${g.status ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}">${g.status ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            `).join('')}
            ${groups.length === 0 ? '<div class="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl mt-4">Start by creating a group</div>' : ''}
        </div>
    `;
}

async function addGroup() {
    const { value: formValues } = await Swal.fire({
        title: 'Create Group',
        html: `
            <div class="text-left space-y-4 pt-4">
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Group Title</label>
                    <input id="swal-title" class="swal2-input !mt-1 w-full m-0 rounded-xl" placeholder="e.g. VIP Customers">
                </div>
                <div>
                     <label class="text-xs font-bold text-slate-500 uppercase ml-1">Channel Type</label>
                     <select id="swal-type" class="swal2-input !mt-1 !w-full rounded-xl">
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                    </select>
                </div>
                ${renderToggle('swal-status', true, 'Enable Group')}
            </div>
        `,
        confirmButtonText: 'Initialize Group',
        confirmButtonColor: '#2563eb',
        preConfirm: () => {
            return {
                title: document.getElementById('swal-title').value,
                type: document.getElementById('swal-type').value,
                status: document.getElementById('swal-status').checked
            }
        }
    });

    if (formValues) {
        await apiCall('/groups', 'POST', formValues);
        router.navigate('groups');
    }
}

async function editGroup(id) {
    const g = state.data.groups.find(x => x.id === id);
    const { value: formValues } = await Swal.fire({
        title: 'Group Settings',
        html: `
            <div class="text-left space-y-4 pt-4">
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Group Title</label>
                    <input id="swal-title" class="swal2-input !mt-1 w-full m-0 rounded-xl" value="${g.title || ''}">
                </div>
                <div>
                     <label class="text-xs font-bold text-slate-500 uppercase ml-1">Channel Type</label>
                     <select id="swal-type" class="swal2-input !mt-1 !w-full rounded-xl">
                        <option value="whatsapp" ${g.type === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                        <option value="sms" ${g.type === 'sms' ? 'selected' : ''}>SMS</option>
                    </select>
                </div>
                ${renderToggle('swal-status', g.status, 'Group Active Status')}
            </div>
        `,
        confirmButtonText: 'Save Settings',
        confirmButtonColor: '#2563eb',
        preConfirm: () => {
            return {
                title: document.getElementById('swal-title').value,
                type: document.getElementById('swal-type').value,
                status: document.getElementById('swal-status').checked
            }
        }
    });

    if (formValues) {
        await apiCall(`/groups/${id}`, 'PUT', formValues);
        router.navigate('groups');
    }
}

async function deleteGroup(id) {
    const result = await Swal.fire({
        title: 'Destroy Group?',
        text: "This group and its connections will be removed",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444'
    });
    if (result.isConfirmed) {
        await apiCall(`/groups/${id}`, 'DELETE');
        router.navigate('groups');
    }
}

// --- Module: Templates ---
async function renderTemplates() {
    const templates = await apiCall('/templates');
    state.data.templates = templates;

    document.getElementById('content').innerHTML = `
        <div class="flex justify-between items-center mb-8 page-enter">
             <div>
                <h2 class="text-3xl font-extrabold text-slate-800">Templates</h2>
                <p class="text-slate-500">Reusable message payloads</p>
            </div>
            <button onclick="addTemplate()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200">
                <i class="fas fa-plus mr-2 text-xs"></i> New Template
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 page-enter">
            ${templates.map(t => `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 transition-all duration-300">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-quote-left text-blue-100 text-3xl absolute -mt-4 opacity-50"></i>
                            <span class="ml-2 px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">TPL-${t.id}</span>
                        </div>
                        <div class="flex space-x-2">
                             <button onclick="editTemplate(${t.id})" class="text-slate-300 hover:text-blue-600"><i class="fas fa-pen-nib"></i></button>
                             <button onclick="deleteTemplate(${t.id})" class="text-slate-300 hover:text-red-500"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                    <div class="min-h-[80px] text-slate-700 font-medium text-sm leading-relaxed mb-6">
                         "${t.message}"
                    </div>
                    <div class="flex items-center justify-between border-t border-slate-50 pt-4">
                        <span class="flex items-center text-[10px] font-black uppercase ${t.status ? 'text-blue-500' : 'text-slate-300'}">
                            <span class="w-1.5 h-1.5 rounded-full ${t.status ? 'bg-blue-500' : 'bg-slate-300'} mr-2"></span>
                            ${t.status ? 'Ready' : 'Draft'}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function addTemplate() {
    const { value: formValues } = await Swal.fire({
        title: 'Draft Template',
        html: `
            <div class="text-left space-y-4 pt-4">
                <div>
                     <label class="text-xs font-bold text-slate-500 uppercase ml-1">Message Content</label>
                     <textarea id="swal-message" class="swal2-textarea !mt-1 w-full m-0 !rounded-2xl" style="height: 120px"></textarea>
                </div>
                ${renderToggle('swal-status', true, 'Template Active Status')}
            </div>
        `,
        confirmButtonText: 'Create Template',
        confirmButtonColor: '#2563eb',
        preConfirm: () => {
            return {
                message: document.getElementById('swal-message').value,
                status: document.getElementById('swal-status').checked
            }
        }
    });

    if (formValues) {
        if (!formValues.message) return Swal.fire('Error', 'Content is missing', 'error');
        await apiCall('/templates', 'POST', formValues);
        router.navigate('templates');
    }
}

async function editTemplate(id) {
    const t = state.data.templates.find(x => x.id === id);
    const { value: formValues } = await Swal.fire({
        title: 'Revise Template',
        html: `
            <div class="text-left space-y-4 pt-4">
                <div>
                     <label class="text-xs font-bold text-slate-500 uppercase ml-1">Message Content</label>
                     <textarea id="swal-message" class="swal2-textarea w-full m-0 !mt-1 !rounded-2xl" style="height: 120px">${t.message}</textarea>
                </div>
                ${renderToggle('swal-status', t.status, 'Template Active Status')}
            </div>
        `,
        confirmButtonText: 'Apply Revisions',
        confirmButtonColor: '#2563eb',
        preConfirm: () => {
            return {
                message: document.getElementById('swal-message').value,
                status: document.getElementById('swal-status').checked
            }
        }
    });

    if (formValues) {
        await apiCall(`/templates/${id}`, 'PUT', formValues);
        router.navigate('templates');
    }
}

async function deleteTemplate(id) {
    const result = await Swal.fire({ title: 'Remove?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
        await apiCall(`/templates/${id}`, 'DELETE');
        router.navigate('templates');
    }
}

// --- Module: Transactions ---
async function renderTransactions() {
    const transactions = await apiCall('/transactions');
    state.data.transactions = transactions;

    document.getElementById('content').innerHTML = `
        <div class="flex justify-between items-center mb-8 page-enter">
            <div>
                <h2 class="text-3xl font-extrabold text-slate-800">History</h2>
                <p class="text-slate-500">Log of all message distributions</p>
            </div>
            <button onclick="addTransaction()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200">
                <i class="fas fa-paper-plane mr-2 text-xs"></i> New Broadcast
            </button>
        </div>
        
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden page-enter">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50/50">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Target Group</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Template</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                         <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                    ${transactions.map(t => `
                        <tr class="hover:bg-slate-50/30 transition-colors group">
                            <td class="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-400">
                                ${new Date(t.date).toLocaleString()}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm font-bold text-slate-700">${t.Group ? `${t.Group.title || `Group #${t.Group.id}`} (${t.Group.type})` : '<span class="text-red-300">Null</span>'}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 max-w-xs truncate italic">
                                "${t.Template ? t.Template.message : 'Missing'}"
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2.5 py-1 text-[10px] font-black rounded-lg uppercase ${t.status ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-400'}">
                                    ${t.status ? 'Broadcasted' : 'Failed'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button onclick="deleteTransaction(${t.id})" class="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 p-2"><i class="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function addTransaction() {
    if (state.data.groups.length === 0) await apiCall('/groups').then(d => state.data.groups = d);
    if (state.data.templates.length === 0) await apiCall('/templates').then(d => state.data.templates = d);

    const { value: formValues } = await Swal.fire({
        title: 'Execute Broadcast',
        html: `
            <div class="text-left space-y-4 pt-4">
                <div>
                     <label class="text-xs font-bold text-slate-500 uppercase ml-1">Target Group</label>
                     <select id="swal-group-id" class="swal2-input !mt-1 !w-full rounded-xl">
                        ${state.data.groups.map(g => `<option value="${g.id}">${g.title || `Group #${g.id}`} (${g.type})</option>`).join('')}
                    </select>
                </div>
                <div>
                     <label class="text-xs font-bold text-slate-500 uppercase ml-1">Select Payload</label>
                     <select id="swal-template-id" class="swal2-input !mt-1 !w-full rounded-xl">
                        ${state.data.templates.map(t => `<option value="${t.id}">${t.message.substring(0, 40)}...</option>`).join('')}
                    </select>
                </div>
                ${renderToggle('swal-status', true, 'Simulate Success')}
            </div>
        `,
        confirmButtonText: 'Start Broadcast',
        confirmButtonColor: '#2563eb',
        preConfirm: () => {
            return {
                group_id: document.getElementById('swal-group-id').value,
                template_id: document.getElementById('swal-template-id').value,
                status: document.getElementById('swal-status').checked,
                date: new Date()
            }
        }
    });

    if (formValues) {
        await apiCall('/transactions', 'POST', formValues);
        router.navigate('transactions');
    }
}

async function deleteTransaction(id) {
    const result = await Swal.fire({ title: 'Purge log?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
        await apiCall(`/transactions/${id}`, 'DELETE');
        router.navigate('transactions');
    }
}
