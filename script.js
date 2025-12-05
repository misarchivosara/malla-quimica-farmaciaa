document.addEventListener('DOMContentLoaded', () => {
    const asignaturas = document.querySelectorAll('.asignatura');
    const contadorSCT = document.getElementById('contador-sct');
    const barraSCT = document.getElementById('progreso-sct');
    const contadorPorcentaje = document.getElementById('contador-porcentaje');
    const barraMalla = document.getElementById('progreso-malla');
    const ramosAprobadosTexto = document.getElementById('ramos-aprobados');
    
    // Total aproximado de créditos (ajustable según tu malla real)
    const totalSCT = 300; 

    // 1. PRIMERO: Cargar lo que tenías guardado
    cargarProgreso();

    // 2. LUEGO: Calcular bloqueos y estadísticas iniciales
    actualizarEstadoBloqueos();
    actualizarProgreso();

    // Eventos Click
    asignaturas.forEach(asignatura => {
        asignatura.addEventListener('click', () => {
            toggleAsignatura(asignatura);
        });
    });

    function toggleAsignatura(elemento) {
        // Seguridad: si está bloqueada, no hacer nada
        if (elemento.classList.contains('bloqueada')) return;

        elemento.classList.toggle('aprobada');
        
        // Cada vez que cambiamos algo, GUARDAMOS y actualizamos
        guardarProgreso();
        actualizarEstadoBloqueos();
        actualizarProgreso();
    }

    // --- FUNCIONES DE MEMORIA (LOCALSTORAGE) ---

    function guardarProgreso() {
        const aprobadas = [];
        // Buscamos todas las que tienen la clase 'aprobada' y guardamos su ID
        document.querySelectorAll('.asignatura.aprobada').forEach(elemento => {
            aprobadas.push(elemento.id);
        });
        // Guardamos esa lista en el navegador
        localStorage.setItem('malla_ara_progreso', JSON.stringify(aprobadas));
    }

    function cargarProgreso() {
        // Leemos la lista guardada
        const guardado = JSON.parse(localStorage.getItem('malla_ara_progreso'));
        
        if (guardado) {
            guardado.forEach(id => {
                const elemento = document.getElementById(id);
                // Si el elemento existe, le ponemos la clase aprobada
                if (elemento) {
                    elemento.classList.add('aprobada');
                }
            });
        }
    }

    // --- LÓGICA DE REQUISITOS Y ESTADÍSTICAS ---

    function actualizarEstadoBloqueos() {
        asignaturas.forEach(asignatura => {
            const requisitos = asignatura.getAttribute('data-requisito');

            if (requisitos) {
                const listaRequisitos = requisitos.split(',');
                let requisitosCumplidos = true;

                listaRequisitos.forEach(reqID => {
                    const asignaturaRequisito = document.getElementById(reqID.trim());
                    if (!asignaturaRequisito || !asignaturaRequisito.classList.contains('aprobada')) {
                        requisitosCumplidos = false;
                    }
                });

                if (!requisitosCumplidos) {
                    asignatura.classList.add('bloqueada');
                    // Si se bloquea, nos aseguramos que no esté marcada como aprobada
                    asignatura.classList.remove('aprobada');
                } else {
                    asignatura.classList.remove('bloqueada');
                }
            }
        });
    }

    function actualizarProgreso() {
        // 1. Créditos SCT
        let sctAprobados = 0;
        const asignaturasAprobadas = document.querySelectorAll('.asignatura.aprobada');
        
        asignaturasAprobadas.forEach(asignatura => {
            sctAprobados += parseInt(asignatura.getAttribute('data-sct'));
        });
        
        animateValue(contadorSCT, parseInt(contadorSCT.innerText), sctAprobados, 400);
        
        const porcentajeSCT = (sctAprobados / totalSCT) * 100;
        barraSCT.style.width = porcentajeSCT + "%";

        // 2. Avance Malla
        const totalRamos = asignaturas.length;
        const ramosAprobados = asignaturasAprobadas.length;
        const porcentajeMalla = (ramosAprobados / totalRamos) * 100;

        contadorPorcentaje.innerText = porcentajeMalla.toFixed(1) + "%";
        ramosAprobadosTexto.innerText = ramosAprobados;
        barraMalla.style.width = porcentajeMalla + "%";
    }

    function animateValue(obj, start, end, duration) {
        if (start === end) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerText = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
