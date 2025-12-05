document.addEventListener('DOMContentLoaded', () => {
    const asignaturas = document.querySelectorAll('.asignatura');
    const contadorSCT = document.getElementById('contador-sct');
    const barraSCT = document.getElementById('progreso-sct');
    const contadorPorcentaje = document.getElementById('contador-porcentaje');
    const barraMalla = document.getElementById('progreso-malla');
    const ramosAprobadosTexto = document.getElementById('ramos-aprobados');
    
    // Total aproximado de créditos (ajustable)
    const totalSCT = 300; 

    // Inicializamos el sistema
    actualizarEstadoBloqueos();

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
        
        actualizarProgreso();
        actualizarEstadoBloqueos();
    }

    function actualizarEstadoBloqueos() {
        asignaturas.forEach(asignatura => {
            const requisitos = asignatura.getAttribute('data-requisito');

            if (requisitos) {
                // Convertir la lista de requisitos en un array (ej: "REQ1,REQ2")
                const listaRequisitos = requisitos.split(',');
                let requisitosCumplidos = true;

                listaRequisitos.forEach(reqID => {
                    const asignaturaRequisito = document.getElementById(reqID.trim());
                    // Si el requisito no existe o no está aprobado
                    if (!asignaturaRequisito || !asignaturaRequisito.classList.contains('aprobada')) {
                        requisitosCumplidos = false;
                    }
                });

                if (!requisitosCumplidos) {
                    asignatura.classList.add('bloqueada');
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
            // El "+" convierte texto a número
            sctAprobados += parseInt(asignatura.getAttribute('data-sct'));
        });
        
        // Animación número SCT
        animateValue(contadorSCT, parseInt(contadorSCT.innerText), sctAprobados, 400);
        
        // Barra SCT
        const porcentajeSCT = (sctAprobados / totalSCT) * 100;
        barraSCT.style.width = porcentajeSCT + "%";

        // 2. Avance Malla (Conteo de Ramos)
        const totalRamos = asignaturas.length;
        const ramosAprobados = asignaturasAprobadas.length;
        const porcentajeMalla = (ramosAprobados / totalRamos) * 100;

        contadorPorcentaje.innerText = porcentajeMalla.toFixed(1) + "%";
        ramosAprobadosTexto.innerText = ramosAprobados;
        barraMalla.style.width = porcentajeMalla + "%";
    }

    // Función pequeña para animar los números al subir
    function animateValue(obj, start, end, duration) {
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
