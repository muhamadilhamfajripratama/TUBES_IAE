// client/js/user.js
// USER_API already declared in auth.js

async function fetchUsers() {
    const query = `{ getUsers { id, name, email, role } }`;
    try {
        const res = await fetch(USER_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
        const result = await res.json();
        
        if (result.errors) throw new Error("GraphQL Error");
        
        const users = result.data.getUsers;
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        users.forEach(u => {
            tbody.innerHTML += `<tr>
                <td>#USR-${u.id}</td>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'HR' ? 'badge-active' : ''}" style="${u.role !== 'HR' ? 'background:#E2E8F0; color:#475569;' : ''}">${u.role}</span></td>
                <td>
                    <button class="action-btn delete" onclick="deleteUser(${u.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        });
    } catch (err) {
        console.error("Gagal menarik data user:", err);
    }
}

async function handleCreateUser() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('userRole').value;
    const pwd = document.getElementById('userPassword').value;

    if(!name || !email || !pwd) return alert("Lengkapi data!");

    const mutation = `mutation { createUser(name: "${name}", email: "${email}", role: "${role}", password: "${pwd}") { id } }`;
    try {
        await fetch(USER_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: mutation }) });
        alert("User berhasil ditambahkan!");
        
        // Bersihkan form
        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';
        document.getElementById('userPassword').value = '';
        
        fetchUsers(); // Refresh tabel
    } catch (err) {
        alert("Gagal menambahkan user.");
    }
}

async function deleteUser(id) {
    if(!confirm("Yakin ingin menghapus user ini?")) return;
    const mutation = `mutation { deleteUser(id: ${id}) }`;
    await fetch(USER_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: mutation }) });
    fetchUsers();
}

window.onload = fetchUsers;