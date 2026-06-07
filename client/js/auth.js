const USER_API = "http://localhost:4001/";

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) return alert("Email dan Password wajib diisi!");

    const query = `{ getUsers { id, name, email, role } }`;
    
    try {
        const res = await fetch(USER_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
        const result = await res.json();
        
        if (result.errors) throw new Error("Server Error");

        const users = result.data.getUsers;
        const validUser = users.find(u => u.email === email); // Simulasi verifikasi

        if (validUser) {
            // Simpan data user ke Local Storage agar bisa dipakai saat melamar kerja
            localStorage.setItem('userId', validUser.id);
            localStorage.setItem('userName', validUser.name);
            localStorage.setItem('userRole', validUser.role);
            
            alert(`Login Berhasil sebagai ${validUser.role}!`);
            
            if (validUser.role === 'HR') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'pelamar_dashboard.html';
            }
        } else {
            alert("Email tidak terdaftar di sistem! Silakan Register.");
        }
    } catch (error) {
        alert("Gagal terhubung ke Backend (Port 4001). Pastikan Docker berjalan.");
    }
}

async function handleRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const role = document.getElementById('regRole').value;
    const pwd = document.getElementById('regPassword').value;

    if(!name || !email || !pwd) return alert("Lengkapi semua form pendaftaran!");

    const mutation = `mutation { createUser(name: "${name}", email: "${email}", role: "${role}", password: "${pwd}") { id } }`;
    
    try {
        await fetch(USER_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: mutation }) });
        alert("Registrasi berhasil! Silakan Sign In menggunakan akun baru Anda.");
        window.location.href = 'login.html';
    } catch (err) {
        alert("Gagal mendaftar, periksa koneksi server.");
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.href = 'login.html';
}