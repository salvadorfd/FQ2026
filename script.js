const OPCION_CUALQUIERA = "Cualquiera";

const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallas = Array.from(document.querySelectorAll(".screen"));

const btnIrEjercicios = document.getElementById("btn-ir-ejercicios");
const pantallaMenuEjercicios = document.getElementById("pantalla-menu-ejercicios");
const btnInicioDesdeMenuEjercicios = document.getElementById("btn-inicio-desde-menu-ejercicios");
const btnPracticarEjercicios = document.getElementById("btn-practicar-ejercicios");
const btnListaEjercicios = document.getElementById("btn-lista-ejercicios");

const pantallaBuscadorEjercicios = document.getElementById("pantalla-buscador");
const pantallaEjercicio = document.getElementById("pantalla-ejercicio");
const btnInicioDesdeEjBuscador = document.getElementById("btn-inicio-desde-ej-buscador");
const pantallaListaEjercicios = document.getElementById("pantalla-lista-ejercicios");
const btnVolverDesdeListaEjercicios = document.getElementById("btn-volver-desde-lista-ejercicios");
const listaEjerciciosContenido = document.getElementById("lista-ejercicios-contenido");
const temaListaEjerciciosSelect = document.getElementById("tema-lista-ejercicios");

const filtroForm = document.getElementById("filtro-form");
const temaSelect = document.getElementById("tema");
const dificultadSelect = document.getElementById("dificultad");
const busquedaError = document.getElementById("busqueda-error");

const tituloEjercicio = document.getElementById("titulo-ejercicio");
const metaEjercicio = document.getElementById("meta-ejercicio");
const enunciado = document.getElementById("enunciado");
const galeriaEjercicio = document.getElementById("galeria-ejercicio");
const respuesta = document.getElementById("respuesta");
const btnVolver = document.getElementById("btn-volver");
const btnRespuesta = document.getElementById("btn-respuesta");
const btnSiguiente = document.getElementById("btn-siguiente");

let ejerciciosFiltrados = [];
let indiceActual = 0;
let respuestaVisible = false;
let modoAleatorio = false;

function obtenerSegmentosNumero(numero) {
	if (typeof numero !== "string") {
		return [];
	}

	return numero
		.split(".")
		.map((segmento) => Number(segmento.trim()))
		.filter((segmento) => Number.isFinite(segmento));
}

function compararPorNumero(a, b) {
	const numeroA = typeof a?.numero === "string" ? a.numero.trim() : "";
	const numeroB = typeof b?.numero === "string" ? b.numero.trim() : "";

	if (!numeroA && !numeroB) {
		return 0;
	}

	if (!numeroA) {
		return 1;
	}

	if (!numeroB) {
		return -1;
	}

	const segmentosA = obtenerSegmentosNumero(numeroA);
	const segmentosB = obtenerSegmentosNumero(numeroB);
	const longitudMaxima = Math.max(segmentosA.length, segmentosB.length);

	for (let indice = 0; indice < longitudMaxima; indice += 1) {
		const valorA = segmentosA[indice] ?? 0;
		const valorB = segmentosB[indice] ?? 0;

		if (valorA !== valorB) {
			return valorA - valorB;
		}
	}

	return numeroA.localeCompare(numeroB, undefined, { numeric: true, sensitivity: "base" });
}

function obtenerNumeroOrdenTema(tema) {
	const primerEjercicio = EJERCICIOS
		.filter((ejercicio) => ejercicio.tema === tema)
		.sort(compararPorNumero)[0];

	if (!primerEjercicio || typeof primerEjercicio.numero !== "string") {
		return Number.POSITIVE_INFINITY;
	}

	const primerSegmento = obtenerSegmentosNumero(primerEjercicio.numero)[0];
	return Number.isFinite(primerSegmento) ? primerSegmento : Number.POSITIVE_INFINITY;
}

function ordenarEjerciciosPorNumero(listaEjercicios) {
	return [...listaEjercicios].sort(compararPorNumero);
}

function obtenerValoresUnicos(lista, campo) {
	return [...new Set(lista.map((item) => item[campo]))].sort((a, b) => a.localeCompare(b));
}

function cargarSelect(selectElement, opciones, incluirCualquiera = false) {
	selectElement.innerHTML = "";

	if (incluirCualquiera) {
		const optionCualquiera = document.createElement("option");
		optionCualquiera.value = OPCION_CUALQUIERA;
		optionCualquiera.textContent = OPCION_CUALQUIERA;
		selectElement.appendChild(optionCualquiera);
	}

	opciones.forEach((opcion) => {
		const option = document.createElement("option");
		option.value = opcion;
		option.textContent = opcion;
		selectElement.appendChild(option);
	});
}

function mostrarPantalla(screenId) {
	pantallas.forEach((pantalla) => {
		pantalla.classList.toggle("active", pantalla.id === screenId);
	});
}

function navegarA(screenId, hash) {
	mostrarPantalla(screenId);
	window.location.hash = hash;
}

function obtenerImagenes(item) {
	if (Array.isArray(item.imagenes)) {
		return item.imagenes
			.filter((rutaImagen) => typeof rutaImagen === "string" && rutaImagen.trim() !== "")
			.slice(0, 3);
	}

	if (typeof item.imagen === "string" && item.imagen.trim() !== "") {
		return [item.imagen.trim()];
	}

	return [];
}

function renderizarGaleriaImagenes(container, rutasImagenes, altBase) {
	container.innerHTML = "";

	if (rutasImagenes.length === 0) {
		container.style.display = "none";
		return;
	}

	rutasImagenes.forEach((rutaImagen, indiceImagen) => {
		const imagen = document.createElement("img");
		imagen.src = rutaImagen;
		imagen.alt = `${altBase} ${indiceImagen + 1}`;
		imagen.loading = "lazy";
		container.appendChild(imagen);
	});

	container.style.display = "grid";
}

function insertarReferenciasImagenes(contenido, rutasImagenes) {
	if (typeof contenido !== "string") {
		return "";
	}

	return contenido.replace(/\{\{img([1-3])\}\}/g, (_coincidencia, numero) => {
		const indice = Number(numero) - 1;
		const ruta = rutasImagenes[indice];
		return typeof ruta === "string" ? ruta : "";
	});
}

function mezclarEjercicios(listaEjercicios) {
	const copia = [...listaEjercicios];

	for (let indice = copia.length - 1; indice > 0; indice -= 1) {
		const indiceAleatorio = Math.floor(Math.random() * (indice + 1));
		[copia[indice], copia[indiceAleatorio]] = [copia[indiceAleatorio], copia[indice]];
	}

	return copia;
}

function filtrarEjercicios(tema, dificultad) {
	const filtrados = EJERCICIOS.filter((ejercicio) => {
		const coincideTema = tema === OPCION_CUALQUIERA || ejercicio.tema === tema;
		const coincideDificultad =
			dificultad === OPCION_CUALQUIERA || ejercicio.dificultad === dificultad;

		return coincideTema && coincideDificultad;
	});

	return ordenarEjerciciosPorNumero(filtrados);
}

function renderizarListaEjercicios() {
	const temaSeleccionado = temaListaEjerciciosSelect.value || OPCION_CUALQUIERA;
	const ejerciciosVisibles = ordenarEjerciciosPorNumero(
		temaSeleccionado === OPCION_CUALQUIERA
			? EJERCICIOS
			: EJERCICIOS.filter((ejercicio) => ejercicio.tema === temaSeleccionado)
	);

	const temasOrdenados = obtenerValoresUnicos(ejerciciosVisibles, "tema").sort((temaA, temaB) => {
		const ordenTemaA = obtenerNumeroOrdenTema(temaA);
		const ordenTemaB = obtenerNumeroOrdenTema(temaB);

		if (ordenTemaA !== ordenTemaB) {
			return ordenTemaA - ordenTemaB;
		}

		return temaA.localeCompare(temaB);
	});
	listaEjerciciosContenido.innerHTML = "";

	if (ejerciciosVisibles.length === 0) {
		const vacio = document.createElement("p");
		vacio.className = "subtitle";
		vacio.textContent = "No hay ejercicios para el tema seleccionado.";
		listaEjerciciosContenido.appendChild(vacio);
		return;
	}

	temasOrdenados.forEach((tema) => {
		const bloqueTema = document.createElement("section");
		bloqueTema.className = "exercise-list-group";

		const tituloTema = document.createElement("h2");
		tituloTema.className = "exercise-list-title";
		tituloTema.textContent = tema;

		const listaTema = document.createElement("ul");
		listaTema.className = "exercise-list";

		ordenarEjerciciosPorNumero(
			ejerciciosVisibles.filter((ejercicio) => ejercicio.tema === tema)
		).forEach((ejercicio) => {
			const item = document.createElement("li");
			item.className = "exercise-list-item";

			const numero = document.createElement("span");
			numero.className = "exercise-list-number";
			numero.textContent = ejercicio.numero || "-";

			const texto = document.createElement("div");
			texto.className = "exercise-list-text";

			const cabecera = document.createElement("div");
			cabecera.className = "exercise-list-header";

			const enunciadoContenedor = document.createElement("div");
			enunciadoContenedor.className = "exercise-list-text-content";
			enunciadoContenedor.innerHTML = typeof ejercicio.enunciado === "string" ? ejercicio.enunciado : "";

			const dificultad = document.createElement("span");
			dificultad.className = "exercise-difficulty-chip";
			dificultad.textContent = ejercicio.dificultad || "Sin dificultad";

			cabecera.appendChild(enunciadoContenedor);
			cabecera.appendChild(dificultad);
			texto.appendChild(cabecera);

			const rutasImagenes = obtenerImagenes(ejercicio);
			if (rutasImagenes.length > 0) {
				const galeriaMini = document.createElement("div");
				galeriaMini.className = "exercise-list-image-gallery";

				rutasImagenes.forEach((rutaImagen, indiceImagen) => {
					const imagen = document.createElement("img");
					imagen.src = rutaImagen;
					imagen.alt = `Imagen ${indiceImagen + 1} del ejercicio ${ejercicio.numero || ""}`;
					imagen.loading = "lazy";
					galeriaMini.appendChild(imagen);
				});

				texto.appendChild(galeriaMini);
			}

			const acciones = document.createElement("div");
			acciones.className = "exercise-list-actions";

			const botonRespuesta = document.createElement("button");
			botonRespuesta.type = "button";
			botonRespuesta.className = "btn btn-list-toggle";
			botonRespuesta.textContent = "Mostrar respuesta";

			const respuesta = document.createElement("div");
			respuesta.className = "exercise-list-answer";
			respuesta.hidden = true;
			respuesta.innerHTML = typeof ejercicio.respuesta === "string" ? ejercicio.respuesta : "";

			botonRespuesta.addEventListener("click", () => {
				const visible = !respuesta.hidden;
				respuesta.hidden = visible;
				botonRespuesta.textContent = visible ? "Mostrar respuesta" : "Ocultar respuesta";
			});

			acciones.appendChild(botonRespuesta);
			texto.appendChild(acciones);
			texto.appendChild(respuesta);

			item.appendChild(numero);
			item.appendChild(texto);
			listaTema.appendChild(item);
		});

		bloqueTema.appendChild(tituloTema);
		bloqueTema.appendChild(listaTema);
		listaEjerciciosContenido.appendChild(bloqueTema);
	});
}

function mostrarEjercicio() {
	const ejercicio = ejerciciosFiltrados[indiceActual];
	const numeroEjercicio =
		typeof ejercicio.numero === "string" && ejercicio.numero.trim() !== ""
			? ejercicio.numero.trim()
			: "-";
	tituloEjercicio.textContent = `Ejercicio ${numeroEjercicio}`;
	metaEjercicio.textContent = `Tema: ${ejercicio.tema} · Dificultad: ${ejercicio.dificultad}`;
	enunciado.innerHTML = typeof ejercicio.enunciado === "string" ? ejercicio.enunciado : "";
	respuesta.innerHTML = typeof ejercicio.respuesta === "string" ? ejercicio.respuesta : "";

	renderizarGaleriaImagenes(
		galeriaEjercicio,
		obtenerImagenes(ejercicio),
		"Imagen del ejercicio"
	);

	respuestaVisible = false;
	respuesta.hidden = true;
	btnRespuesta.textContent = "Ver respuesta";
}

btnIrEjercicios.addEventListener("click", () => {
	navegarA(pantallaMenuEjercicios.id, "#ejercicios");
});

btnInicioDesdeEjBuscador.addEventListener("click", () => {
	navegarA(pantallaMenuEjercicios.id, "#ejercicios");
});

btnInicioDesdeMenuEjercicios.addEventListener("click", () => {
	navegarA(pantallaInicio.id, "#inicio");
});

btnPracticarEjercicios.addEventListener("click", () => {
	navegarA(pantallaBuscadorEjercicios.id, "#ejercicios-practicar");
});

btnListaEjercicios.addEventListener("click", () => {
	renderizarListaEjercicios();
	navegarA(pantallaListaEjercicios.id, "#ejercicios-lista");
});

temaListaEjerciciosSelect.addEventListener("change", () => {
	renderizarListaEjercicios();
});

btnVolverDesdeListaEjercicios.addEventListener("click", () => {
	navegarA(pantallaMenuEjercicios.id, "#ejercicios");
});

filtroForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const temaSeleccionado = temaSelect.value;
	const dificultadSeleccionada = dificultadSelect.value;
	modoAleatorio =
		temaSeleccionado === OPCION_CUALQUIERA || dificultadSeleccionada === OPCION_CUALQUIERA;

	const ejerciciosEncontrados = filtrarEjercicios(temaSeleccionado, dificultadSeleccionada);
	ejerciciosFiltrados = modoAleatorio
		? mezclarEjercicios(ejerciciosEncontrados)
		: ejerciciosEncontrados;

	if (ejerciciosFiltrados.length === 0) {
		busquedaError.textContent = "No hay ejercicios para esa combinación.";
		return;
	}

	busquedaError.textContent = "";
	indiceActual = 0;
	mostrarEjercicio();
	navegarA(pantallaEjercicio.id, "#ejercicio");
});

btnSiguiente.addEventListener("click", () => {
	if (ejerciciosFiltrados.length === 0) {
		return;
	}

	if (indiceActual === ejerciciosFiltrados.length - 1) {
		if (modoAleatorio) {
			ejerciciosFiltrados = mezclarEjercicios(ejerciciosFiltrados);
		}
		indiceActual = 0;
	} else {
		indiceActual += 1;
	}

	mostrarEjercicio();
});

btnRespuesta.addEventListener("click", () => {
	respuestaVisible = !respuestaVisible;
	respuesta.hidden = !respuestaVisible;
	btnRespuesta.textContent = respuestaVisible ? "Ocultar respuesta" : "Ver respuesta";
});

btnVolver.addEventListener("click", () => {
	navegarA(pantallaBuscadorEjercicios.id, "#ejercicios-practicar");
});

window.addEventListener("hashchange", () => {
	switch (window.location.hash) {
		case "#ejercicios":
			mostrarPantalla(pantallaMenuEjercicios.id);
			break;
		case "#ejercicios-practicar":
			mostrarPantalla(pantallaBuscadorEjercicios.id);
			break;
		case "#ejercicios-lista":
			renderizarListaEjercicios();
			mostrarPantalla(pantallaListaEjercicios.id);
			break;
		case "#ejercicio":
			if (ejerciciosFiltrados.length > 0) {
				mostrarPantalla(pantallaEjercicio.id);
			} else {
				mostrarPantalla(pantallaBuscadorEjercicios.id);
			}
			break;
		case "#inicio":
			mostrarPantalla(pantallaInicio.id);
			break;
		default:
			mostrarPantalla(pantallaInicio.id);
			break;
	}
});

function iniciarAplicacion() {
	cargarSelect(temaListaEjerciciosSelect, obtenerValoresUnicos(EJERCICIOS, "tema"), true);
	renderizarListaEjercicios();

	cargarSelect(temaSelect, obtenerValoresUnicos(EJERCICIOS, "tema"), true);
	cargarSelect(dificultadSelect, obtenerValoresUnicos(EJERCICIOS, "dificultad"), true);

	if (window.location.hash) {
		window.dispatchEvent(new HashChangeEvent("hashchange"));
	} else {
		navegarA(pantallaInicio.id, "#inicio");
	}
}

iniciarAplicacion();
