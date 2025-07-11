// Application State
let state = {
    employees: [],
    currentShift: 'SHIFT 1',
    darkMode: false,
    assignments: {
        available: [],
        unavailable: [],
        gates: {},
        special: {}
    },
    supervisorAssignments: {},
    coordinatorAssignments: {}
};

// Gate Areas Configuration - Updated with exact gate listings
const GATE_AREAS = {
    NGL: {
        name: 'NGL Area',
        gates: ['Gate #1', 'Gate #2', 'Gate #3', 'Gate #21'],
        vipGates: ['V/P 05', 'V/P 014'],
        color: 'ngl'
    },
    YRD: {
        name: 'YRD Area',
        gates: ['Gate #16', 'Gate #17'],
        vipGates: ['V/P 07', 'V/P 011'],
        color: 'yrd'
    },
    BUP: {
        name: 'BUP Area',
        gates: ['Gate #18'],
        vipGates: ['V/P 03'],
        color: 'bup'
    },
    HUH: {
        name: 'HUH Area',
        gates: ['Gate #23', 'Gate #24'],
        vipGates: ['V/P 022', 'V/P 023'],
        color: 'huh'
    },
    YNT: {
        name: 'YNT Area',
        gates: ['Gate #9', 'Gate #11', 'Gate #4', 'Gate #5'],
        vipGates: ['V/P 06', 'V/P 09', 'V/P 010'],
        color: 'ynt'
    }
};

// Sample Data
const SAMPLE_EMPLOYEES = [
    {
        id: 'emp-1',
        name: 'John Smith',
        age: 35,
        gradeCode: 'SG-1',
        badge: '001',
        role: 'supervisor',
        shift: 'SHIFT 1',
        weapons: ['MP5', 'Glock']
    },
    {
        id: 'emp-2',
        name: 'Sarah Johnson',
        age: 28,
        gradeCode: 'SG-2',
        badge: '002',
        role: 'coordinator',
        shift: 'SHIFT 1',
        weapons: ['Glock']
    },
    {
        id: 'emp-3',
        name: 'Mike Wilson',
        age: 32,
        gradeCode: 'SG-3',
        badge: '003',
        role: 'patrol',
        shift: 'SHIFT 1',
        weapons: ['MP5', 'AirTaser']
    },
    {
        id: 'emp-4',
        name: 'Lisa Brown',
        age: 26,
        gradeCode: 'SG-4',
        badge: '004',
        role: 'guard',
        shift: 'SHIFT 1',
        weapons: ['Glock']
    },
    {
        id: 'emp-5',
        name: 'David Lee',
        age: 40,
        gradeCode: 'SG-1',
        badge: '005',
        role: 'supervisor',
        shift: 'SHIFT 2',
        weapons: ['MP5', 'Glock']
    },
    {
        id: 'emp-6',
        name: 'Maria Garcia',
        age: 29,
        gradeCode: 'SG-2',
        badge: '006',
        role: 'coordinator',
        shift: 'SHIFT 2',
        weapons: ['Glock', 'AirTaser']
    }
];

// Utility Functions
function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function showNotification(message, type = 'success') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize Application
function initializeApp() {
    state.employees = [...SAMPLE_EMPLOYEES];
    initializeAssignments();
    setupEventListeners();
    updateDisplay();
    loadTheme();
}

function initializeAssignments() {
    // Initialize available personnel
    state.assignments.available = state.employees.filter(emp => emp.shift === state.currentShift);
    
    // Initialize gates - Remove patrol units, only gates now
    Object.entries(GATE_AREAS).forEach(([areaCode, areaData]) => {
        [...areaData.gates, ...areaData.vipGates].forEach(gateName => {
            const gateId = `gate-${gateName.replace(/[^a-zA-Z0-9]/g, '')}`;
            state.assignments.gates[gateId] = {
                id: gateId,
                name: gateName,
                area: areaCode,
                employees: [],
                maxCapacity: 5,
                weaponAssigned: false
            };
        });
    });
    
    // Initialize special assignments
    ['Training', 'Vacation', 'Assignment', 'M-Time'].forEach(name => {
        const specialId = name.toLowerCase().replace(' ', '-');
        state.assignments.special[specialId] = {
            id: specialId,
            name: name,
            employees: [],
            maxCapacity: name === 'Training' ? 10 : 5
        };
    });
}

function setupEventListeners() {
    // Modal controls
    const modal = document.getElementById('employeeModal');
    const addBtn = document.getElementById('addEmployeeBtn');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('employeeForm');
    
    addBtn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    cancelBtn.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    form.onsubmit = handleAddEmployee;
    
    // Theme toggle
    document.getElementById('darkModeToggle').onchange = toggleTheme;
    
    // Shift selector
    document.querySelectorAll('.shift-btn').forEach(btn => {
        btn.onclick = () => switchShift(btn.dataset.shift);
    });
    
    // Drag and drop
    setupDragAndDrop();
}

function handleAddEmployee(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const employee = {
        id: generateId(),
        name: document.getElementById('employeeName').value,
        age: parseInt(document.getElementById('employeeAge').value),
        gradeCode: document.getElementById('employeeGrade').value,
        badge: document.getElementById('employeeBadge').value,
        role: document.getElementById('employeeRole').value,
        shift: document.getElementById('employeeShift').value,
        weapons: ['Glock'] // Default weapon
    };
    
    state.employees.push(employee);
    
    // Add to available if current shift
    if (employee.shift === state.currentShift) {
        state.assignments.available.push(employee);
    }
    
    updateDisplay();
    document.getElementById('employeeModal').style.display = 'none';
    e.target.reset();
    showNotification(`${employee.name} added successfully!`);
}

function deleteEmployee(employeeId) {
    if (confirm('Are you sure you want to delete this employee?')) {
        // Remove from employees array
        state.employees = state.employees.filter(emp => emp.id !== employeeId);
        
        // Remove from all assignments
        state.assignments.available = state.assignments.available.filter(emp => emp.id !== employeeId);
        state.assignments.unavailable = state.assignments.unavailable.filter(emp => emp.id !== employeeId);
        
        Object.values(state.assignments.gates).forEach(gate => {
            gate.employees = gate.employees.filter(emp => emp.id !== employeeId);
        });
        
        Object.values(state.assignments.special).forEach(special => {
            special.employees = special.employees.filter(emp => emp.id !== employeeId);
        });
        
        // Clear command assignments
        Object.keys(state.supervisorAssignments).forEach(shift => {
            if (state.supervisorAssignments[shift] === employeeId) {
                state.supervisorAssignments[shift] = null;
            }
        });
        
        Object.keys(state.coordinatorAssignments).forEach(shift => {
            if (state.coordinatorAssignments[shift] === employeeId) {
                state.coordinatorAssignments[shift] = null;
            }
        });
        
        updateDisplay();
        showNotification('Employee deleted successfully!');
    }
}

function switchShift(shift) {
    state.currentShift = shift;
    
    // Update active button
    document.querySelectorAll('.shift-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shift === shift);
    });
    
    // Update available personnel
    state.assignments.available = state.employees.filter(emp => emp.shift === shift);
    
    // Filter other assignments by shift
    Object.values(state.assignments.gates).forEach(gate => {
        gate.employees = gate.employees.filter(emp => emp.shift === shift);
    });
    
    Object.values(state.assignments.special).forEach(special => {
        special.employees = special.employees.filter(emp => emp.shift === shift);
    });
    
    updateDisplay();
}

function toggleTheme() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark', state.darkMode);
    localStorage.setItem('darkMode', state.darkMode);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        state.darkMode = true;
        document.body.classList.add('dark');
        document.getElementById('darkModeToggle').checked = true;
    }
}

function updateDisplay() {
    updateStats();
    updatePersonnelLists();
    updateCommandStructure();
    updateGateAssignments();
    updateSpecialAssignments();
    updateUnavailablePersonnel();
}

function updateStats() {
    const currentShiftEmployees = state.employees.filter(emp => emp.shift === state.currentShift);
    document.getElementById('activePersonnel').textContent = currentShiftEmployees.length;
    document.getElementById('currentShift').textContent = state.currentShift.replace('SHIFT ', '');
    
    // Update total gates count
    const totalGates = Object.values(GATE_AREAS).reduce((total, area) => {
        return total + area.gates.length + area.vipGates.length;
    }, 0);
    document.getElementById('totalGates').textContent = totalGates;
}

function updatePersonnelLists() {
    const availableContainer = document.getElementById('availablePersonnel');
    const availableCount = document.getElementById('availableCount');
    
    availableContainer.innerHTML = '';
    
    state.assignments.available.forEach(employee => {
        const employeeCard = createEmployeeCard(employee);
        availableContainer.appendChild(employeeCard);
    });
    
    availableCount.textContent = state.assignments.available.length;
}

function updateCommandStructure() {
    document.getElementById('commandShift').textContent = state.currentShift;
    
    const supervisorSlot = document.getElementById('supervisorSlot');
    const coordinatorSlot = document.getElementById('coordinatorSlot');
    
    // Update supervisor
    const supervisor = state.supervisorAssignments[state.currentShift] 
        ? state.employees.find(emp => emp.id === state.supervisorAssignments[state.currentShift])
        : state.employees.find(emp => emp.shift === state.currentShift && emp.role === 'supervisor');
    
    if (supervisor) {
        supervisorSlot.innerHTML = createCommandEmployeeHTML(supervisor);
    } else {
        supervisorSlot.innerHTML = `
            <div class="empty-slot">
                <i class="fas fa-plus"></i>
                <span>Assign Supervisor</span>
            </div>
        `;
    }
    
    // Update coordinator
    const coordinator = state.coordinatorAssignments[state.currentShift]
        ? state.employees.find(emp => emp.id === state.coordinatorAssignments[state.currentShift])
        : state.employees.find(emp => emp.shift === state.currentShift && emp.role === 'coordinator');
    
    if (coordinator) {
        coordinatorSlot.innerHTML = createCommandEmployeeHTML(coordinator);
    } else {
        coordinatorSlot.innerHTML = `
            <div class="empty-slot">
                <i class="fas fa-plus"></i>
                <span>Assign Coordinator</span>
            </div>
        `;
    }
}

function createCommandEmployeeHTML(employee) {
    return `
        <div class="employee-card">
            <div class="employee-avatar">
                ${getInitials(employee.name)}
            </div>
            <div class="employee-info">
                <div class="employee-name">${employee.name}</div>
                <div class="employee-badge">#${employee.badge}</div>
            </div>
            <button class="employee-delete" onclick="deleteEmployee('${employee.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

function updateGateAssignments() {
    Object.entries(GATE_AREAS).forEach(([areaCode, areaData]) => {
        const container = document.getElementById(`${areaCode.toLowerCase()}Gates`);
        container.innerHTML = '';
        
        [...areaData.gates, ...areaData.vipGates].forEach(gateName => {
            const gateId = `gate-${gateName.replace(/[^a-zA-Z0-9]/g, '')}`;
            const gate = state.assignments.gates[gateId];
            
            if (gate) {
                const gateCard = createGateCard(gate);
                container.appendChild(gateCard);
            }
        });
    });
}

function updateSpecialAssignments() {
    const container = document.getElementById('specialAssignments');
    container.innerHTML = '';
    
    Object.values(state.assignments.special).forEach(special => {
        const specialCard = createGateCard(special);
        container.appendChild(specialCard);
    });
}

function updateUnavailablePersonnel() {
    // Collect all employees from special assignments
    const unavailableEmployees = [];
    Object.values(state.assignments.special).forEach(special => {
        unavailableEmployees.push(...special.employees);
    });
    
    state.assignments.unavailable = unavailableEmployees;
    
    const container = document.getElementById('unavailablePersonnel');
    const count = document.getElementById('unavailableCount');
    
    container.innerHTML = '';
    
    unavailableEmployees.forEach(employee => {
        const employeeCard = createEmployeeCard(employee, true);
        container.appendChild(employeeCard);
    });
    
    count.textContent = unavailableEmployees.length;
}

function createEmployeeCard(employee, readonly = false) {
    const card = document.createElement('div');
    card.className = 'employee-card';
    card.draggable = !readonly;
    card.dataset.employeeId = employee.id;
    
    card.innerHTML = `
        <div class="employee-avatar">
            ${getInitials(employee.name)}
        </div>
        <div class="employee-info">
            <div class="employee-name">${employee.name}</div>
            <div class="employee-badge">#${employee.badge}</div>
        </div>
        ${!readonly ? `
            <button class="employee-delete" onclick="deleteEmployee('${employee.id}')">
                <i class="fas fa-trash"></i>
            </button>
        ` : ''}
    `;
    
    if (!readonly) {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    }
    
    return card;
}

function createGateCard(assignment) {
    const card = document.createElement('div');
    card.className = 'gate-card';
    
    // Check if it's a vehicle patrol
    const isVehiclePatrol = assignment.name.startsWith('V/P');
    
    card.innerHTML = `
        <div class="gate-header">
            <div class="gate-name">
                ${isVehiclePatrol ? '<i class="fas fa-car"></i> ' : ''}
                ${assignment.name}
            </div>
            ${assignment.weaponAssigned !== undefined ? `
                <button class="weapon-toggle ${assignment.weaponAssigned ? 'active' : ''}" 
                        onclick="toggleWeapon('${assignment.id}')">
                    <i class="fas fa-gun"></i>
                </button>
            ` : ''}
        </div>
        <div class="gate-content" data-drop-zone="${assignment.id}" data-assignment-type="gate">
            ${assignment.employees.length > 0 ? '' : '<div class="empty">Drop employee here</div>'}
        </div>
    `;
    
    const content = card.querySelector('.gate-content');
    
    assignment.employees.forEach(employee => {
        const employeeCard = createEmployeeCard(employee);
        content.appendChild(employeeCard);
    });
    
    content.addEventListener('dragover', handleDragOver);
    content.addEventListener('drop', handleDrop);
    
    return card;
}

function toggleWeapon(assignmentId) {
    const assignment = state.assignments.gates[assignmentId];
    if (assignment) {
        assignment.weaponAssigned = !assignment.weaponAssigned;
        updateDisplay();
        showNotification(`Weapon ${assignment.weaponAssigned ? 'assigned to' : 'removed from'} ${assignment.name}`);
    }
}

// Drag and Drop Functions
let draggedEmployee = null;

function setupDragAndDrop() {
    // Setup drop zones
    document.querySelectorAll('[data-drop-zone]').forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedEmployee = {
        id: e.target.dataset.employeeId,
        source: findEmployeeSource(e.target.dataset.employeeId)
    };
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedEmployee = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedEmployee) return;
    
    const dropZone = e.currentTarget.dataset.dropZone;
    const assignmentType = e.currentTarget.dataset.assignmentType;
    
    if (dropZone === 'unavailable') {
        showNotification('Cannot assign directly to unavailable. Use special assignments.', 'error');
        return;
    }
    
    const employee = state.employees.find(emp => emp.id === draggedEmployee.id);
    if (!employee) return;
    
    // Check capacity
    const targetAssignment = getAssignmentByZone(dropZone, assignmentType);
    if (targetAssignment && targetAssignment.employees.length >= targetAssignment.maxCapacity) {
        showNotification(`${targetAssignment.name} is at maximum capacity`, 'error');
        return;
    }
    
    // Remove from source
    removeEmployeeFromSource(draggedEmployee.id, draggedEmployee.source);
    
    // Add to target
    addEmployeeToTarget(employee, dropZone, assignmentType);
    
    updateDisplay();
    showNotification(`${employee.name} assigned to ${targetAssignment ? targetAssignment.name : dropZone}`);
}

function findEmployeeSource(employeeId) {
    if (state.assignments.available.find(emp => emp.id === employeeId)) {
        return { type: 'available' };
    }
    
    for (const [gateId, gate] of Object.entries(state.assignments.gates)) {
        if (gate.employees.find(emp => emp.id === employeeId)) {
            return { type: 'gate', id: gateId };
        }
    }
    
    for (const [specialId, special] of Object.entries(state.assignments.special)) {
        if (special.employees.find(emp => emp.id === employeeId)) {
            return { type: 'special', id: specialId };
        }
    }
    
    return null;
}

function removeEmployeeFromSource(employeeId, source) {
    if (!source) return;
    
    switch (source.type) {
        case 'available':
            state.assignments.available = state.assignments.available.filter(emp => emp.id !== employeeId);
            break;
        case 'gate':
            if (state.assignments.gates[source.id]) {
                state.assignments.gates[source.id].employees = 
                    state.assignments.gates[source.id].employees.filter(emp => emp.id !== employeeId);
            }
            break;
        case 'special':
            if (state.assignments.special[source.id]) {
                state.assignments.special[source.id].employees = 
                    state.assignments.special[source.id].employees.filter(emp => emp.id !== employeeId);
            }
            break;
    }
}

function addEmployeeToTarget(employee, dropZone, assignmentType) {
    if (dropZone === 'available') {
        state.assignments.available.push(employee);
    } else if (assignmentType === 'gate' && state.assignments.gates[dropZone]) {
        state.assignments.gates[dropZone].employees.push(employee);
    } else if (state.assignments.special[dropZone]) {
        state.assignments.special[dropZone].employees.push(employee);
    }
}

function getAssignmentByZone(dropZone, assignmentType) {
    if (dropZone === 'available') {
        return { name: 'Available Personnel', maxCapacity: 45 };
    }
    
    return state.assignments.gates[dropZone] || 
           state.assignments.special[dropZone];
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
