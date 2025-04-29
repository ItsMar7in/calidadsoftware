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
  
    // Generar salas
    for (let i = 1; i <= 20; i++) {
      const sala = document.createElement("div");
      sala.classList.add("sala-card");
      sala.innerHTML = `
        <h3>Sala ${i}</h3>
        <p>Capacidad: ${10 + i} personas</p>
        <button class="seleccionar" data-sala="${i}">Seleccionar</button>
      `;
      listaSalas.appendChild(sala);
  
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Sala ${i}`;
      selectSala.appendChild(option);
    }
  
    // Generar opciones de fecha (próximos 7 días)
    const generateDateOptions = () => {
      selectFecha.innerHTML = "";
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const option = document.createElement("option");
        option.value = dateStr;
        option.textContent = date.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        selectFecha.appendChild(option);
      }
    };
  
    // Generar opciones de hora (8:00 a 18:00, cada hora)
    const generateTimeOptions = () => {
      selectHora.innerHTML = "";
      for (let hour = 8; hour <= 18; hour++) {
        const timeStr = `${hour.toString().padStart(2, "0")}:00`;
        const option = document.createElement("option");
        option.value = timeStr;
        option.textContent = timeStr;
        selectHora.appendChild(option);
      }
    };
  
    // Simular reservas iniciales
    function initializeMockReservations() {
      const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      if (reservas.length === 0) {
        const mockReservas = [
          { nombre: "Usuario Test", sala: "1", fecha: new Date().toISOString().split("T")[0], hora: "09:00" },
          { nombre: "Usuario Test", sala: "3", fecha: new Date().toISOString().split("T")[0], hora: "10:00" },
          { nombre: "Usuario Test", sala: "5", fecha: new Date().toISOString().split("T")[0], hora: "14:00" },
          { nombre: "Usuario Test", sala: "10", fecha: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0], hora: "12:00" },
          { nombre: "Usuario Test", sala: "15", fecha: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0], hora: "16:00" },
        ];
        localStorage.setItem("reservas", JSON.stringify(mockReservas));
      }
    }
  
    // Carrusel
    const scrollStep = 200;
    btnNext.addEventListener("click", () => {
      listaSalas.scrollLeft += scrollStep;
    });
    btnPrev.addEventListener("click", () => {
      listaSalas.scrollLeft -= scrollStep;
    });
  
    listaSalas.addEventListener("click", (e) => {
      if (e.target.classList.contains("seleccionar") && !e.target.disabled) {
        selectSala.value = e.target.dataset.sala;
      }
    });
  
    // Funciones de notificación
    function showToast(msg) {
      toast.textContent = msg;
      toast.style.display = "block";
      setTimeout(() => {
        toast.style.display = "none";
      }, 3000);
    }
  
    // Funciones de almacenamiento
    function guardarReserva(reserva) {
      const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      reservas.push(reserva);
      localStorage.setItem("reservas", JSON.stringify(reservas));
    }
  
    function eliminarReservaLocalStorage(sala, fecha, hora) {
      let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      reservas = reservas.filter(
        (r) => !(r.sala == sala && r.fecha == fecha && r.hora == hora)
      );
      localStorage.setItem("reservas", JSON.stringify(reservas));
    }
  
    // Funciones de estado de salas
    function marcarSalaReservada(sala, fecha, hora) {
      document.querySelectorAll(".sala-card").forEach((card) => {
        const num = card.querySelector(".seleccionar")?.dataset?.sala;
        const mismaSala = num == sala;
        const boton = card.querySelector(".seleccionar");
  
        if (mismaSala && boton) {
          boton.disabled = true;
          boton.textContent = "Reservada";
          boton.classList.add("reservada");
        }
      });
    }
  
    function restaurarSala(sala) {
      document.querySelectorAll(".sala-card").forEach((card) => {
        const boton = card.querySelector(".seleccionar");
        if (boton?.dataset?.sala == sala) {
          boton.disabled = false;
          boton.textContent = "Seleccionar";
          boton.classList.remove("reservada");
        }
      });
    }
  
    // Mostrar reservas en DOM
    function agregarReservaDOM({ nombre, sala, fecha, hora }) {
      const li = document.createElement("li");
      li.innerHTML = `<span><strong>${nombre}</strong> - Sala ${sala} - ${fecha} ${hora}</span>
        <button class="eliminar">Cancelar</button>`;
      listaReservas.appendChild(li);
  
      marcarSalaReservada(sala, fecha, hora);
      renderCalendar();
  
      li.querySelector(".eliminar").addEventListener("click", () => {
        li.remove();
        eliminarReservaLocalStorage(sala, fecha, hora);
        restaurarSala(sala);
        renderCalendar();
      });
    }
  
    function cargarReservas() {
      const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      reservas.forEach((res) => agregarReservaDOM(res));
    }
  
    // Calendario
    function renderCalendar() {
      calendarBody.innerHTML = "";
      const hours = Array.from({ length: 11 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`);
      const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
      const dateStr = currentDate.toISOString().split("T")[0];
  
      hours.forEach((hour) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${hour}</td>`;
        for (let sala = 1; sala <= 20; sala++) {
          const isOccupied = reservas.some(
            (r) => r.sala == sala && r.fecha == dateStr && r.hora == hour
          );
          row.innerHTML += `<td class="${isOccupied ? "occupied" : "free"}">${
            isOccupied ? "Ocupada" : "Libre"
          }</td>`;
        }
        calendarBody.appendChild(row);
      });
  
      currentDateSpan.textContent = currentDate.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  
    prevDayBtn.addEventListener("click", () => {
      currentDate.setDate(currentDate.getDate() - 1);
      renderCalendar();
    });
  
    nextDayBtn.addEventListener("click", () => {
      currentDate.setDate(currentDate.getDate() + 1);
      renderCalendar();
    });
  
    // Formulario
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
      const yaReservada = reservas.find(
        (r) => r.sala === sala && r.fecha === fecha && r.hora === hora
      );
  
      if (yaReservada) {
        showToast("Esa sala ya está reservada para esa fecha y hora.");
        return;
      }
  
      const reserva = { nombre, sala, fecha, hora };
      agregarReservaDOM(reserva);
      guardarReserva(reserva);
      showToast("¡Reserva exitosa!");
  
      reservaForm.reset();
    });
  
    // Inicialización
    initializeMockReservations();
    generateDateOptions();
    generateTimeOptions();
    cargarReservas();
    renderCalendar();
  });