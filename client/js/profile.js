const USER_API = "http://localhost:4001/";

// Retrieve session info
const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");
const userRole = localStorage.getItem("userRole");

// Redirect to login if not logged in
if (!userId) {
    window.location.href = "login.html";
}

/* =====================================
   RENDER SIDEBAR DYNAMICALLY
===================================== */
function renderSidebar() {
    const sidebar = document.getElementById("dynamicSidebar");
    if (!sidebar) return;

    if (userRole === "HR") {
        sidebar.innerHTML = `
            <div class="logo">
                <div class="logo-icon"><i class="fa-solid fa-layer-group"></i></div>
                <h2>HRRS<span class="dot">.</span></h2>
            </div>
            <ul class="menu">
                <li onclick="window.location.href='dashboard.html'"><i class="fa-solid fa-chart-pie"></i> Dashboard</li>
                <li onclick="window.location.href='users.html'"><i class="fa-solid fa-users"></i> Users Management</li>
                <li onclick="window.location.href='vacancies.html'"><i class="fa-solid fa-briefcase"></i> Vacancies</li>
                <li onclick="window.location.href='applicants.html'"><i class="fa-solid fa-file-signature"></i> Applicants</li>
                <li onclick="window.location.href='interviews.html'"><i class="fa-solid fa-comments"></i> Interviews</li>
                <li onclick="window.location.href='reports.html'"><i class="fa-solid fa-chart-line"></i> Reports</li>
                <li class="active"><i class="fa-solid fa-gear"></i> Settings</li>
                <li onclick="handleLogout()" style="margin-top: 50px; color: #ef4444; cursor: pointer;"><i class="fa-solid fa-right-from-bracket"></i> Logout</li>
            </ul>
            <div class="sidebar-footer">
                <div class="system-status"><div class="indicator online"></div><span>System Online</span></div>
            </div>
        `;
    } else {
        sidebar.innerHTML = `
            <div class="logo">
                <div class="logo-icon"><i class="fa-solid fa-layer-group"></i></div>
                <h2>HRRS<span class="dot">.</span></h2>
            </div>
            <ul class="menu">
                <li onclick="window.location.href='pelamar_dashboard.html'"><i class="fa-solid fa-briefcase"></i> Available Vacancies</li>
                <li onclick="window.location.href='pelamar_applications.html'"><i class="fa-solid fa-file-signature"></i> My Applications</li>
                <li onclick="window.location.href='pelamar_interviews.html'"><i class="fa-solid fa-comments"></i> My Interviews</li>
                <li onclick="handleLogout()" style="margin-top: 50px; color: #ef4444; cursor: pointer;"><i class="fa-solid fa-right-from-bracket"></i> Logout</li>
            </ul>
            <div class="sidebar-footer">
                <div class="system-status"><div class="indicator online"></div><span>System Online</span></div>
            </div>
        `;
    }
}

let loadedUser = null;

/* =====================================
   TOGGLE EDIT MODE
===================================== */
function toggleEditMode(isEdit) {
    const nameInput = document.getElementById("profName");
    const emailInput = document.getElementById("profEmail");
    const passwordInput = document.getElementById("profPassword");
    
    const viewActions = document.getElementById("viewActions");
    const editActions = document.getElementById("editActions");

    if (isEdit) {
        nameInput.removeAttribute("disabled");
        emailInput.removeAttribute("disabled");
        passwordInput.removeAttribute("disabled");
        
        viewActions.style.display = "none";
        editActions.style.display = "flex";
    } else {
        nameInput.setAttribute("disabled", "true");
        emailInput.setAttribute("disabled", "true");
        passwordInput.setAttribute("disabled", "true");
        
        if (loadedUser) {
            nameInput.value = loadedUser.name;
            emailInput.value = loadedUser.email;
        }
        passwordInput.value = "";

        viewActions.style.display = "flex";
        editActions.style.display = "none";
    }
}

/* =====================================
   FETCH PROFILE DETAILS (READ)
===================================== */
async function loadProfile() {
    const query = `
    {
        getUserById(id: ${userId}) {
            id
            name
            email
            role
        }
    }`;

    try {
        const res = await fetch(USER_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query })
        });

        const result = await res.json();
        const user = result.data?.getUserById;

        if (!user) {
            alert("Gagal memuat profil atau sesi kedaluwarsa!");
            handleLogout();
            return;
        }

        loadedUser = user;

        // Update UI headers
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${user.role === 'HR' ? '0D8ABC' : 'E2E8F0'}&color=${user.role === 'HR' ? 'fff' : '333'}`;
        document.getElementById("topbarAvatar").src = avatarUrl;
        document.getElementById("topbarName").innerText = user.name;
        document.getElementById("topbarRole").innerText = user.role === 'HR' ? 'HR Administrator' : 'Applicant';

        document.getElementById("profileCardAvatar").src = avatarUrl;
        document.getElementById("profileCardName").innerText = user.name;
        document.getElementById("profileCardRole").innerText = user.role;

        // Populate Form Fields and lock them initially
        document.getElementById("profName").value = user.name;
        document.getElementById("profEmail").value = user.email;
        document.getElementById("profRole").value = user.role;

        toggleEditMode(false);

    } catch (err) {
        console.error("Load Profile Error:", err);
    }
}

/* =====================================
   UPDATE PROFILE (UPDATE)
===================================== */
async function handleUpdateProfile(event) {
    event.preventDefault();

    const name = document.getElementById("profName").value.trim();
    const email = document.getElementById("profEmail").value.trim();
    const password = document.getElementById("profPassword").value;

    let mutation = "";
    if (password) {
        mutation = `
        mutation {
            updateUser(
                id: ${userId},
                name: "${name}",
                email: "${email}",
                role: "${userRole}",
                password: "${password}"
            ){
                id
                name
                email
                role
            }
        }`;
    } else {
        mutation = `
        mutation {
            updateUser(
                id: ${userId},
                name: "${name}",
                email: "${email}",
                role: "${userRole}"
            ){
                id
                name
                email
                role
            }
        }`;
    }

    try {
        const res = await fetch(USER_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: mutation })
        });

        const result = await res.json();

        if (result.errors) {
            console.error(result.errors);
            return alert("Gagal mengupdate profil!");
        }

        const updatedUser = result.data?.updateUser;
        if (updatedUser) {
            localStorage.setItem("userName", updatedUser.name);
            alert("Profil berhasil diperbarui!");
            loadProfile(); // Reload data and automatically lock fields
        }
    } catch (err) {
        console.error("Update Profile Error:", err);
        alert("Server error saat memperbarui profil!");
    }
}

/* =====================================
   DELETE ACCOUNT (DELETE)
===================================== */
async function handleDeleteProfile() {
    if (!confirm("Apakah Anda yakin ingin menghapus akun Anda secara permanen? Semua data lamaran dan jadwal Anda akan hilang.")) {
        return;
    }

    const mutation = `
    mutation {
        deleteUser(id: ${userId})
    }`;

    try {
        const res = await fetch(USER_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: mutation })
        });

        const result = await res.json();

        if (result.errors) {
            console.error(result.errors);
            return alert("Gagal menghapus akun!");
        }

        alert("Akun Anda telah berhasil dihapus. Sampai jumpa!");
        handleLogout(); // Clear session and redirect to login

    } catch (err) {
        console.error("Delete Account Error:", err);
        alert("Server error saat menghapus akun!");
    }
}

// Auto Load
window.addEventListener("DOMContentLoaded", () => {
    renderSidebar();
    loadProfile();
});
