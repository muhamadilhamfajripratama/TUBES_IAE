// client/js/dashboard.js

// URL Endpoints untuk ke-4 Microservices
const SERVICES = {
    USER: "http://localhost:4001/",
    VACANCY: "http://localhost:4002/",
    APPLICANT: "http://localhost:4003/",
    INTERVIEW: "http://localhost:4004/"
};

// Fungsi untuk mengeksekusi GraphQL Query
async function fetchGraphQL(url, query) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error(`Gagal mengambil data dari ${url}:`, error);
        return null;
    }
}

// Mengambil dan memperbarui metrik di Dashboard
async function loadDashboardMetrics() {
    // 1. Ambil Total Users
    const userData = await fetchGraphQL(SERVICES.USER, `{ getUsers { id } }`);
    if (userData && userData.getUsers) {
        document.getElementById('totalUsers').innerText = userData.getUsers.length;
    }

    // 2. Ambil Total Vacancies
    const vacancyData = await fetchGraphQL(SERVICES.VACANCY, `{ getVacancies { id } }`);
    if (vacancyData && vacancyData.getVacancies) {
        document.getElementById('totalVacancies').innerText = vacancyData.getVacancies.length;
    }

    // 3. Ambil Total Applicants
    const applicantData = await fetchGraphQL(SERVICES.APPLICANT, `{ getApplicants { id } }`);
    if (applicantData && applicantData.getApplicants) {
        document.getElementById('totalApplicants').innerText = applicantData.getApplicants.length;
    }

    // 4. Ambil Total Interviews
    const interviewData = await fetchGraphQL(SERVICES.INTERVIEW, `{ getInterviews { id } }`);
    if (interviewData && interviewData.getInterviews) {
        document.getElementById('totalInterviews').innerText = interviewData.getInterviews.length;
    }
}

// Inisialisasi Grafik (Chart.js)
function initChart() {
    const ctx = document.getElementById('dashboardChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['IT & Engineering', 'Marketing', 'Finance', 'Operations'],
            datasets: [{
                label: 'Applicant Distribution',
                data: [45, 25, 20, 10], // Data statis sementara, bisa dibuat dinamis nanti
                backgroundColor: ['#0D8ABC', '#F59E0B', '#8B5CF6', '#10B981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

// Jalankan semua fungsi saat halaman selesai dimuat
window.onload = () => {
    loadDashboardMetrics();
    initChart();
};