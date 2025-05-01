document.addEventListener("DOMContentLoaded", () => {
    const listaSalas = document.getElementById("listaSalas");
    const btnPrev = document.querySelector(".prev");
    const btnNext = document.querySelector(".next");
    const reservaForm = document.getElementById("reservaForm");
    const selectSala = document.getElementById("sala");
    const selectFecha = document.getElementById("fecha");
    const selectHora = document.getElementById("hora");
    const listaReservas = document.getElementById("listaReservas");
    const toast = document.getElementById("toast");
    const calendarBody = document.getElementById("calendarBody");
    const currentDateSpan = document.getElementById("currentDate");
    const prevDayBtn = document.getElementById("prevDay");
    const nextDayBtn = document.getElementById("nextDay");
  
    let currentDate = new Date();
  
    // Función auxiliar: fecha de hoy en formato ISO
    const today = () => new Date().toISOString().split("T")[0];
  
    // Inicializar reservas simuladas
    function initializeMockReservations() {
      const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      if (reservas.length === 0) {
        const mock = [
          { nombre: "Usuario Test", sala: "1", fecha: today(), hora: "09:00" },
          { nombre: "Usuario Test", sala: "3", fecha: today(), hora: "10:00" },
          { nombre: "Usuario Test", sala: "5", fecha: today(), hora: "14:00" }
        ];
        localStorage.setItem("reservas", JSON.stringify(mock));
      }
    }
  
    // Llenar opciones de salas en el selector
    function fillSalaOptions() {
      if (!selectSala) return;
      selectSala.innerHTML = "";
      for (let i = 1; i <= 20; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `Sala ${i}`;
        selectSala.appendChild(option);
      }
    }
  
    // Llenar opciones de fechas
    function generateDateOptions() {
      if (!selectFecha) return;
      selectFecha.innerHTML = "";
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const option = document.createElement("option");
        option.value = date.toISOString().split("T")[0];
        option.textContent = date.toLocaleDateString("es-ES", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
        selectFecha.appendChild(option);
      }
    }
  
    // Llenar opciones de horas
    function generateTimeOptions() {
      if (!selectHora) return;
      selectHora.innerHTML = "";
      for (let hour = 8; hour <= 18; hour++) {
        const option = document.createElement("option");
        option.value = `${hour.toString().padStart(2, "0")}:00`;
        option.textContent = option.value;
        selectHora.appendChild(option);
      }
    }
  
    // Mostrar mensaje tipo toast
    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.style.display = "block";
      setTimeout(() => {
        toast.style.display = "none";
      }, 3000);
    }
  
    // Guardar reserva
    function guardarReserva(reserva) {
      const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      reservas.push(reserva);
      localStorage.setItem("reservas", JSON.stringify(reservas));
    }
  
    // Eliminar reserva
    function eliminarReservaLocalStorage(sala, fecha, hora) {
      let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      reservas = reservas.filter(r => !(r.sala == sala && r.fecha == fecha && r.hora == hora));
      localStorage.setItem("reservas", JSON.stringify(reservas));
    }
  
    // Mostrar una reserva en la lista
    function agregarReservaDOM({ nombre, sala, fecha, hora }) {
      if (!listaReservas) return;
      const li = document.createElement("li");
      li.innerHTML = `<span><strong>${nombre}</strong> - Sala ${sala} - ${fecha} ${hora}</span>
      <button class="eliminar">Cancelar</button>`;
      listaReservas.appendChild(li);
  
      li.querySelector(".eliminar").addEventListener("click", () => {
        li.remove();
        eliminarReservaLocalStorage(sala, fecha, hora);
        restaurarSala(sala);
        renderCalendar();
      });
  
      marcarSalaReservada(sala, fecha, hora);
    }
  
    // Cargar reservas guardadas
    function cargarReservas() {
      const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      reservas.forEach(r => agregarReservaDOM(r));
    }
  
    // Marcar sala como reservada
    function marcarSalaReservada(sala, fecha, hora) {
      document.querySelectorAll(".sala-card").forEach(card => {
        const btn = card.querySelector(".seleccionar");
        if (btn?.dataset.sala == sala) {
          btn.disabled = true;
          btn.textContent = "Reservada";
          btn.classList.add("reservada");
        }
      });
    }
  
    // Restaurar botón de sala
    function restaurarSala(sala) {
      document.querySelectorAll(".sala-card").forEach(card => {
        const btn = card.querySelector(".seleccionar");
        if (btn?.dataset.sala == sala) {
          btn.disabled = false;
          btn.textContent = "Seleccionar";
          btn.classList.remove("reservada");
        }
      });
    }
  
    // Renderizar el calendario
    function renderCalendar() {
      if (!calendarBody || !currentDateSpan) return;
  
      calendarBody.innerHTML = "";
      const hours = Array.from({ length: 11 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`);
      const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      const dateStr = currentDate.toISOString().split("T")[0];
  
      hours.forEach(hour => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${hour}</td>`;
        for (let sala = 1; sala <= 20; sala++) {
          const ocupada = reservas.some(r => r.sala == sala && r.fecha === dateStr && r.hora === hour);
          row.innerHTML += `<td class="${ocupada ? "occupied" : "free"}">${ocupada ? "Ocupada" : "Libre"}</td>`;
        }
        calendarBody.appendChild(row);
      });
  
      currentDateSpan.textContent = currentDate.toLocaleDateString("es-ES", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });
    }
  
    // Navegación del calendario
    prevDayBtn?.addEventListener("click", () => {
      currentDate.setDate(currentDate.getDate() - 1);
      renderCalendar();
    });
  
    nextDayBtn?.addEventListener("click", () => {
      currentDate.setDate(currentDate.getDate() + 1);
      renderCalendar();
    });
  
    // Carrusel de salas
    if (listaSalas) {
      for (let i = 1; i <= 20; i++) {
        const sala = document.createElement("div");
        sala.classList.add("sala-card");
        sala.innerHTML = `
          <h3>Sala ${i}</h3>
          <p>Capacidad: ${10 + i} personas</p>
          <button class="seleccionar" data-sala="${i}">Seleccionar</button>
        `;
        listaSalas.appendChild(sala);
      }
  
      btnNext?.addEventListener("click", () => {
        listaSalas.scrollLeft += 200;
      });
  
      btnPrev?.addEventListener("click", () => {
        listaSalas.scrollLeft -= 200;
      });
  
      listaSalas.addEventListener("click", (e) => {
        if (e.target.classList.contains("seleccionar") && !e.target.disabled && selectSala) {
          selectSala.value = e.target.dataset.sala;
        }
      });
    }
  
    // Formulario de reserva
    if (reservaForm) {
      reservaForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const sala = selectSala.value;
        const fecha = selectFecha.value;
        const hora = selectHora.value;
  
        if (!nombre || !correo || !sala || !fecha || !hora) {
          showToast("Completa todos los campos.");
          return;
        }
  
        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        const yaReservada = reservas.find(r => r.sala === sala && r.fecha === fecha && r.hora === hora);
        if (yaReservada) {
          showToast("Esa sala ya está reservada para esa fecha y hora.");
          return;
        }
  
        const nueva = { nombre, sala, fecha, hora };
        agregarReservaDOM(nueva);
        guardarReserva(nueva);
        showToast("¡Reserva exitosa!");
        reservaForm.reset();
      });
    }
  
    // Inicialización final
    initializeMockReservations();
    fillSalaOptions();
    generateDateOptions();
    generateTimeOptions();
    cargarReservas();
    renderCalendar();
  });
  
  // Navbar toggle (responsive)
  document.querySelector(".toggle-btn")?.addEventListener("click", () => {
    document.querySelector(".nav-links")?.classList.toggle("active");
  });
  