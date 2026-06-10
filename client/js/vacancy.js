// ======================================
// VACANCY SERVICE
// ======================================

const VACANCY_API = "http://localhost:4002/";

let currentVacancies = [];

// Fungsi helper untuk memformat tanggal pendaftaran (hanya tanggal, bulan, tahun)
function formatApplyDate(dateInput) {
    if (!dateInput) return "-";
    let date = !isNaN(dateInput) ? new Date(Number(dateInput)) : new Date(dateInput);
    
    if (isNaN(date.getTime())) return dateInput; // Fallback jika format string biasa

    return date.toLocaleDateString("id-ID", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

/* =====================================
   GET ALL VACANCIES (HR)
===================================== */
async function fetchVacanciesHR() {

    const query = `
    {
        getVacancies {
            id
            title
            department
            description
            status
            created_at
            start_apply
            end_apply
        }
    }`;

    try {

        const res = await fetch(VACANCY_API,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({query})
        });

        const result = await res.json();
        const vacancies = result.data?.getVacancies || [];
        currentVacancies = vacancies;

        const tbody = document.getElementById("vacanciesTableBody");
        if(!tbody) return;
        tbody.innerHTML = "";

        vacancies.forEach(job=>{

            let createdDate = "-";
            if(job.created_at){
                let date = !isNaN(job.created_at) ? new Date(Number(job.created_at)) : new Date(job.created_at);
                createdDate = date.toLocaleString("id-ID", {
                    timeZone: "UTC", 
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                });
            }

            // Format untuk tanggal start dan end apply
            let startApplyFormatted = formatApplyDate(job.start_apply);
            let endApplyFormatted = formatApplyDate(job.end_apply);

            tbody.innerHTML += `
            <tr>
                <td>#${job.id}</td>
                <td><strong>${job.title}</strong></td>
                <td>${job.department}</td>
                <td>
                    <div style="max-width:200px; white-space:normal; line-height:1.5;">
                        ${job.description || "-"}
                    </div>
                </td>
                <td>${startApplyFormatted}</td>
                <td>${endApplyFormatted}</td>
                <td>${createdDate}</td>
                <td>
                    <select onchange="updateVacancyStatus(${job.id},this.value)">
                        <option value="Open" ${job.status==="Open"?"selected":""}>Open</option>
                        <option value="Closed" ${job.status==="Closed"?"selected":""}>Closed</option>
                    </select>
                </td>
                <td>
                    <button
                        onclick="openEditVacancy(
                            ${job.id},
                            '${(job.title||"").replace(/'/g,"\\'")}',
                            '${(job.department||"").replace(/'/g,"\\'")}',
                            '${(job.description||"").replace(/'/g,"\\'")}',
                            '${job.status}',
                            '${job.start_apply || ""}',
                            '${job.end_apply || ""}'
                        )"
                        style="background:#3b82f6; color:white; border:none; padding:8px 10px; border-radius:8px; cursor:pointer; margin-right:5px;"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button
                        onclick="deleteVacancy(${job.id})"
                        style="background:#ef4444; color:white; border:none; padding:8px 10px; border-radius:8px; cursor:pointer;"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });

    } catch(err){
        console.error("FETCH VACANCIES ERROR:", err);
    }
}

/* =====================================
   CREATE VACANCY
===================================== */
async function handleCreateVacancy(){

    const title = document.getElementById("vacTitle").value.trim();
    const department = document.getElementById("vacDept").value;
    const description = document.getElementById("vacDescription").value.trim();
    const status = document.getElementById("vacStatus").value;
    const start_apply = document.getElementById("vacStartApply").value; // Input Type Date
    const end_apply = document.getElementById("vacEndApply").value;     // Input Type Date

    if(!title){
        return alert("Job Title wajib diisi!");
    }

    const mutation = `
    mutation {
        createVacancy(
            title:"${title}",
            department:"${department}",
            description:"${description}",
            status:"${status}",
            start_apply:"${start_apply}",
            end_apply:"${end_apply}"
        ){
            id
        }
    }`;

    try{
        const res = await fetch(VACANCY_API, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ query:mutation })
        });

        const result = await res.json();

        if(result.errors){
            console.error(result.errors);
            return alert("Gagal membuat vacancy");
        }

        alert("Vacancy berhasil ditambahkan");

        // Reset Form
        document.getElementById("vacTitle").value = "";
        document.getElementById("vacDescription").value = "";
        document.getElementById("vacStartApply").value = "";
        document.getElementById("vacEndApply").value = "";
        document.getElementById("vacDept").selectedIndex = 0;
        document.getElementById("vacStatus").selectedIndex = 0;

        fetchVacanciesHR();

    }catch(err){
        console.error(err);
        alert("Server Vacancy Error");
    }
}

/* =====================================
   UPDATE STATUS (Dropdown Cepat di Tabel)
===================================== */
async function updateVacancyStatus(id, status){
    const vacancy = currentVacancies.find(v => Number(v.id) === Number(id));
    if(!vacancy) return;

    const mutation = `
    mutation {
        updateVacancy(
            id:${id},
            title:"${vacancy.title}",
            department:"${vacancy.department}",
            description:"${vacancy.description || ""}",
            status:"${status}",
            start_apply:"${vacancy.start_apply || ""}",
            end_apply:"${vacancy.end_apply || ""}"
        ){
            id
        }
    }`;

    try{
        await fetch(VACANCY_API, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ query:mutation })
        });
    }catch(err){
        console.error(err);
    }
}

/* =====================================
   OPEN EDIT MODAL
===================================== */
function openEditVacancy(id, title, department, description, status, start_apply, end_apply){

    document.getElementById("editVacancyModal").style.display = "flex";
    document.getElementById("editVacancyId").value = id;
    document.getElementById("editVacTitle").value = title;
    document.getElementById("editVacDept").value = department;
    document.getElementById("editVacDescription").value = description;
    document.getElementById("editVacStatus").value = status;
    
    // Set nilai tanggal ke input type="date" (formatnya harus YYYY-MM-DD)
    document.getElementById("editVacStartApply").value = start_apply ? start_apply.split('T')[0] : "";
    document.getElementById("editVacEndApply").value = start_apply ? end_apply.split('T')[0] : "";
}

/* =====================================
   CLOSE EDIT MODAL
===================================== */
function closeEditModal(){
    document.getElementById("editVacancyModal").style.display = "none";
}

/* =====================================
   UPDATE VACANCY
===================================== */
async function updateVacancy(){

    const id = document.getElementById("editVacancyId").value;
    const title = document.getElementById("editVacTitle").value;
    const department = document.getElementById("editVacDept").value;
    const description = document.getElementById("editVacDescription").value;
    const status = document.getElementById("editVacStatus").value;
    const start_apply = document.getElementById("editVacStartApply").value;
    const end_apply = document.getElementById("editVacEndApply").value;

    const mutation = `
    mutation {
        updateVacancy(
            id:${id},
            title:"${title}",
            department:"${department}",
            description:"${description}",
            status:"${status}",
            start_apply:"${start_apply}",
            end_apply:"${end_apply}"
        ){
            id
        }
    }`;

    try{
        await fetch(VACANCY_API, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ query:mutation })
        });

        alert("Vacancy berhasil diupdate");
        closeEditModal();
        fetchVacanciesHR();

    }catch(err){
        console.error(err);
        alert("Update gagal");
    }
}

/* =====================================
   DELETE VACANCY
===================================== */
async function deleteVacancy(id){
    if(!confirm("Yakin hapus vacancy?")) return;

    const mutation = `
    mutation {
        deleteVacancy(id:${id})
    }`;

    try{
        await fetch(VACANCY_API, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ query:mutation })
        });

        alert("Vacancy berhasil dihapus");
        fetchVacanciesHR();
    }catch(err){
        console.error(err);
        alert("Delete gagal");
    }
}

/* =====================================
   AUTO LOAD
===================================== */
window.addEventListener("DOMContentLoaded", () => { fetchVacanciesHR(); });

window.openEditVacancy = openEditVacancy;
window.closeEditModal = closeEditModal;
window.updateVacancy = updateVacancy;
window.deleteVacancy = deleteVacancy;
window.updateVacancyStatus = updateVacancyStatus;