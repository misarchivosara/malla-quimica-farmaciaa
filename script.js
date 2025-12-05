document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES ---
    const asignaturas = document.querySelectorAll('.asignatura');
    const contadorSCT = document.getElementById('contador-sct');
    const barraSCT = document.getElementById('progreso-sct');
    const contadorPorcentaje = document.getElementById('contador-porcentaje');
    const barraMalla = document.getElementById('progreso-malla');
    const ramosAprobadosTexto = document.getElementById('ramos-aprobados');
    
    const totalSCT = 300; 

    // --- INICIO ---
    cargarProgreso();
    actualizarEstadoBloqueos();
    actualizarProgreso();

    // --- EVENTOS CLICK ---
    asignaturas.forEach(asignatura => {
        asignatura.addEventListener('click', () => {
            if (asignatura.classList.contains('bloqueada')) return;

            asignatura.classList.toggle('aprobada');
            
            // Guardar, verificar semestres y actualizar
            guardarProgreso();
            actualizarEstadoBloqueos();
            actualizarProgreso();
        });
    });

    // --- LÓGICA DE REQUISITOS (SOLUCIÓN FINAL) ---
    function actualizarEstadoBloqueos() {
        asignaturas.forEach(asignatura => {
            const requisitos = asignatura.getAttribute('data-requisito');

            if (!requisitos) {
                asignatura.classList.remove('bloqueada');
                return;
            }

            const listaRequisitos = requisitos.split(',');
            let cumpleTodo = true;

            listaRequisitos.forEach(req => {
                const idLimpio = req.trim();

                // CASO 1: REQUISITO DE SEMESTRE COMPLETO (Ej: "SEMESTRE_6")
                if (idLimpio.startsWith('SEMESTRE_')) {
                    const numeroSemestre = idLimpio.split('_')[1]; // Saca el número 6
                    
                    // Busca la caja del semestre por su ID
                    const semestreDiv = document.getElementById('semestre-' + numeroSemestre);
                    
                    if (semestreDiv) {
                        // Revisa si TODOS los ramos de ese semestre están aprobados
                        const ramosDelSemestre = semestreDiv.querySelectorAll('.asignatura');
                        let semestreCompleto = true;
                        
                        ramosDelSemestre.forEach(ramo => {
                            if (!ramo.classList.contains('aprobada')) {
                                semestreCompleto = false;
                            }
                        });

                        if (!semestreCompleto) cumpleTodo = false;
                    }
                } 
                // CASO 2: REQUISITO DE RAMO ESPECÍFICO (Ej: "DQUI1045")
                else {
                    const ramoReq = document.getElementById(idLimpio);
                    if (!ramoReq || !ramoReq.classList.contains('aprobada')) {
                        cumpleTodo = false;
                    }
                }
            });

            // APLICAR CANDADO
            if (!cumpleTodo) {
                asignatura.classList.add('bloqueada');
                asignatura.classList.remove('aprobada'); 
            } else {
                asignatura.classList.remove('bloqueada');
            }
        });
    }

    // --- MEMORIA ---
    function guardarProgreso() {
        const listaIDs = [];
        document.querySelectorAll('.asignatura.aprobada').forEach(elemento => {
            if (elemento.id) listaIDs.push(elemento.id);
        });
        localStorage.setItem('malla_ara_final_v2', JSON.stringify(listaIDs));
    }

    function cargarProgreso() {
        const datosGuardados = localStorage.getItem('malla_ara_final_v2');
        if (datosGuardados) {
            JSON.parse(datosGuardados).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.classList.add('aprobada');
            });
        }
    }

    // --- ESTADÍSTICAS ---
    function actualizarProgreso() {
        let sctAprobados = 0;
        const aprobadas = document.querySelectorAll('.asignatura.aprobada');
        
        aprobadas.forEach(asig => {
            const val = parseInt(asig.getAttribute('data-sct'));
            if (!isNaN(val)) sctAprobados += val;
        });
        
        if(contadorSCT) contadorSCT.innerText = sctAprobados;
        const pctSCT = (sctAprobados / totalSCT) * 100;
        if(barraSCT) barraSCT.style.width = pctSCT + "%";

        const totalRamos = asignaturas.length;
        const numAprobados = aprobadas.length;
        const pctMalla = totalRamos > 0 ? (numAprobados / totalRamos) * 100 : 0;

        if(contadorPorcentaje) contadorPorcentaje.innerText = pctMalla.toFixed(1) + "%";
        if(ramosAprobadosTexto) ramosAprobadosTexto.innerText = numAprobados;
        if(barraMalla) barraMalla.style.width = pctMalla + "%";
    }
});
