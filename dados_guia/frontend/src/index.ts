import {
    FrontendRenderer,
    FrontendRendererArgs,
} from "@streamlit/component-v2-lib";

export type ComponentData = {
    date: string;
};

type InstanceState = {
    startDate: Date;
    endDate: Date | null;
    intervalId: number;
};

const instances = new WeakMap<
  FrontendRendererArgs["parentElement"],
  InstanceState
>();

function render(parent: FrontendRendererArgs["parentElement"], state: InstanceState): void {
    const bruh = document.getElementById('bruh-ddg')
    if (!bruh) {return}
    const t = state.endDate || new Date;

    if (t > state.startDate) {
        const n = t - state.startDate,
          a = Math.floor(n / 36e5),
          e = Math.floor(n / 6e4 % 60),
          o = String(a).padStart(2, "0"),
          s = String(e).padStart(2, "0");
        bruh!.textContent = `${o}:${s}`
    } else bruh!.textContent = "--:--"
}

const MyComponent: FrontendRenderer<ComponentData> = (args) => {
    const { parentElement, data } = args;
    console.log(data)

    let state = instances.get(parentElement);

    function buildDate(baseDate: string, time: string) {
        return new Date(`${baseDate}T${time}:00`);
    }

    const baseDate = data.DATA.split(" ")[0];

    // First render for this instance
    if (!state) {
        const startDate = buildDate(baseDate, data.GARAGEM);

        let endDate: Date | null = null;
        if (data.DATA_ENCERROU !== "NaT" && data.DATA_ENCERROU !== "None") {
            endDate = buildDate(baseDate, data.TERMINO_JORNADA);

            // Jornada vira o dia
            if (data.GARAGEM > data.TERMINO_JORNADA) {
                endDate.setDate(endDate.getDate() + 1);
            }
        }

        state = {
            startDate,
            endDate,
            intervalId: window.setInterval(() => {
                render(parentElement, state!);
            }, 1000),
        };

        instances.set(parentElement, state);
    } else {
        // Update dates if Streamlit re-renders
        state.startDate = buildDate(baseDate, data.GARAGEM);

        if (data.DATA_ENCERROU !== "NaT" && data.DATA_ENCERROU !== "None") {
            state.endDate = buildDate(baseDate, data.TERMINO_JORNADA);

            if (data.GARAGEM > data.TERMINO_JORNADA) {
                state.endDate.setDate(state.endDate.getDate() + 1);
            }
        } else {
            state.endDate = null;
        }
    }

    let e = 0;

    if (data.ROLETA_INICIAL && data.ROLETA_FINAL) {
        e = data.ROLETA_FINAL - data.ROLETA_INICIAL;

        // contador virou (overflow)
        if (e < 0) {
            e += 100000;
        }
    } else if (data.passageiro) {
        e = data.passageiro;
    }

    document.getElementById("t-ddg")!.innerHTML = `<p class=title><strong>Guia nº</strong> ${data.DOCUMENTO}</p>${data.TERMINO_VIAGENS?'<div class=encerrada>ENCERRADA</div>':""}<div class=flex-info><p>Motorista: <strong>${data.MATRICULA}</strong></p><p>Carro: <strong>${data.CARRO}</strong></p><p>Linha: <strong>${data.LINHA}</strong></p><p>Turno: <strong>${data.TURNO}</strong></p><p>Início Jornada: <strong>${data.GARAGEM}</strong></p><p>Início Viagens: <strong>${data.PONTO}</strong></p>${data.TERMINO_VIAGENS?`<p>Término Viagens: <strong>${data.TERMINO_VIAGENS}</strong></p>`:""}${data.TERMINO_JORNADA?`<p>Término Jornada: <strong>${data.TERMINO_JORNADA}</strong></p>`:""}\n<p>Carga horária: <strong id=bruh-ddg></strong></p>${data.placa?`<p>Placa: <strong>${data.placa}</strong></p>`:""}${data.ROLETA_INICIAL?`<p>Roleta inicial: <strong>${data.ROLETA_INICIAL}</strong></p>`:""}${data.ROLETA_FINAL?`<p>Roleta final: <strong>${data.ROLETA_FINAL}</strong></p>`:""}${e?`<p>Passageiros: <strong>${e}</strong></p>`:""}</div>`;

    render(parentElement, state);

    // Proper cleanup
    return () => {
        const state = instances.get(parentElement);
        if (!state) return;

        clearInterval(state.intervalId);
        instances.delete(parentElement);
    };
};

export default MyComponent;
