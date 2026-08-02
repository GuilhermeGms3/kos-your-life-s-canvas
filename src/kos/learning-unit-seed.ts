import { ACADEMY_NODES } from "./academy-seed";
import type { LearningUnitState, LearningUnitTemplate } from "./learning";

const PILOT_TEMPLATES: Record<string, LearningUnitTemplate> = {
  "mathematics.number": {
    nodeId: "mathematics.number",
    introduction:
      "Numero nao e apenas algarismo: e uma estrutura para representar quantidade, ordem, medida e relacoes. Esta unidade estabelece o vocabulário que sustentara toda a trilha.",
    objectives: [
      "Distinguir numeros naturais, inteiros, racionais, irracionais e reais",
      "Interpretar ordem de grandeza, estimativas e diferentes representacoes",
      "Justificar propriedades das operacoes em vez de apenas aplica-las",
      "Reconhecer limites e usos de diferentes sistemas numericos",
    ],
    challenge:
      "Escolha tres situacoes reais que usem numeros de maneiras diferentes. Modele cada uma, explique o sistema numerico adequado e mostre como verificaria a coerencia do resultado.",
    relationships: ["mathematics.division", "mathematics.proof"],
    estimatedSessions: 4,
  },
  "mathematics.division": {
    nodeId: "mathematics.division",
    introduction:
      "Dividir pode significar repartir, medir quantas vezes algo cabe, comparar razoes ou construir taxas. A unidade trata essas interpretacoes como uma ideia unica e transferivel.",
    objectives: [
      "Diferenciar divisao partitiva e quotativa",
      "Interpretar quociente e resto em diferentes contextos",
      "Construir razoes, taxas e escalas a partir da divisao",
      "Validar resultados por estimativa e operacao inversa",
    ],
    challenge:
      "Resolva um mesmo problema de divisao por duas estrategias, compare o que cada uma torna visivel e explique quando o resto deve ser mantido, arredondado ou reinterpretado.",
    relationships: ["mathematics.number", "mathematics.fractions"],
    estimatedSessions: 4,
  },
  "mathematics.fractions": {
    nodeId: "mathematics.fractions",
    introduction:
      "Fracoes expressam parte-todo, medida, quociente, razao e operador. Compreender essas leituras evita que regras de calculo se tornem procedimentos sem significado.",
    objectives: [
      "Interpretar os diferentes significados de uma fracao",
      "Demonstrar equivalencia com modelos e propriedades numericas",
      "Localizar e comparar racionais na reta numerica",
      "Justificar as operacoes com fracoes",
    ],
    challenge:
      "Compare duas fracoes por tres metodos distintos. Depois crie um exemplo em que uma regra mecanica comum induza a erro e explique conceitualmente a correcao.",
    relationships: ["mathematics.division", "mathematics.algebra"],
    estimatedSessions: 5,
  },
  "mathematics.algebra": {
    nodeId: "mathematics.algebra",
    introduction:
      "A algebra transforma relacoes em objetos manipulaveis. O foco aqui e compreender simbolos, equivalencia e modelagem antes de acelerar procedimentos.",
    objectives: [
      "Distinguir variavel, incognita, parametro e constante",
      "Preservar equivalencia ao transformar expressoes e equacoes",
      "Analisar desigualdades, polinomios e padroes",
      "Traduzir problemas entre linguagem natural, tabelas e simbolos",
    ],
    challenge:
      "Modele uma situacao concreta com uma equacao e uma desigualdade. Documente as hipoteses, resolva e interprete o significado e os limites da resposta.",
    relationships: ["mathematics.fractions", "mathematics.functions"],
    estimatedSessions: 6,
  },
  "mathematics.functions": {
    nodeId: "mathematics.functions",
    introduction:
      "Funcoes descrevem dependencia e transformacao. A unidade integra definicoes, tabelas, formulas e graficos para que nenhuma representacao fique isolada.",
    objectives: [
      "Analisar dominio, contradominio e imagem",
      "Converter entre representacoes verbal, tabular, grafica e algebrica",
      "Compor e inverter funcoes com atencao as restricoes",
      "Escolher familias de funcoes para modelar fenomenos",
    ],
    challenge:
      "Escolha um fenomeno variavel, proponha duas funcoes candidatas para representa-lo e defenda qual modelo e melhor, incluindo dominio, unidades e limitacoes.",
    relationships: ["mathematics.algebra", "mathematics.calculus-1"],
    estimatedSessions: 7,
  },
  "mathematics.calculus-1": {
    nodeId: "mathematics.calculus-1",
    introduction:
      "O calculo estuda mudanca e acumulacao. Limites conectam o comportamento local de funcoes a derivadas, integrais e ao Teorema Fundamental do Calculo.",
    objectives: [
      "Interpretar limites e continuidade numerica, grafica e formalmente",
      "Compreender derivada como taxa de variacao e aproximacao local",
      "Compreender integral como acumulacao e area orientada",
      "Relacionar derivacao e integracao pelo Teorema Fundamental",
    ],
    challenge:
      "Modele um processo de mudanca, obtenha e interprete sua taxa instantanea, depois formule uma quantidade acumulada. Registre hipoteses e limites do modelo.",
    relationships: ["mathematics.functions", "mathematics.calculus-2"],
    estimatedSessions: 10,
  },
};

export function getLearningUnitTemplate(nodeId: string): LearningUnitTemplate {
  const pilot = PILOT_TEMPLATES[nodeId];
  if (pilot) return pilot;
  const node = ACADEMY_NODES.find((item) => item.id === nodeId);
  return {
    nodeId,
    introduction:
      node?.summary ?? "Esta unidade organiza materiais, producao pessoal e evidencias de dominio.",
    objectives: [
      `Explicar os conceitos centrais de ${node?.title ?? "este nucleo"}`,
      "Relacionar teoria, exemplos e contraexemplos",
      "Aplicar o conhecimento em um problema aberto",
    ],
    challenge: `Produza uma sintese aplicada de ${node?.title ?? "este nucleo"}, explicando suas decisoes e as evidencias usadas.`,
    relationships: node?.prerequisites ?? [],
    estimatedSessions: Math.max(3, node?.level ? node.level + 2 : 3),
  };
}

const QUESTION_FRAMES = [
  (objective: string) =>
    `Explique com suas palavras: "${objective}". Use um exemplo e diga como verificaria sua explicacao.`,
  (objective: string) =>
    `Crie um problema que exija "${objective}", resolva-o e justifique cada decisao.`,
  (objective: string) =>
    `Qual erro conceitual alguem poderia cometer ao tentar "${objective}"? Diagnostique e corrija o erro.`,
  (objective: string) =>
    `Compare duas abordagens para "${objective}". Em que contexto cada uma e mais poderosa?`,
  (objective: string) =>
    `Conecte "${objective}" a um conceito estudado anteriormente e mostre por que a relacao e valida.`,
];

export function generateLearningQuestion(
  template: LearningUnitTemplate,
  state: Pick<LearningUnitState, "attempts" | "customObjectives">,
) {
  const objectives = state.customObjectives.length ? state.customObjectives : template.objectives;
  const index = state.attempts.length;
  const objective = objectives[index % objectives.length];
  const frame = QUESTION_FRAMES[index % QUESTION_FRAMES.length];
  return frame(objective);
}

export function createEmptyLearningUnitState(nodeId: string, profileId: string): LearningUnitState {
  return {
    nodeId,
    profileId,
    materialAssetIds: [],
    primaryAssetId: "",
    note: "",
    teacherExplanation: "",
    customObjectives: [],
    challengePrompt: "",
    challengeEvidence: "",
    materialStudied: false,
    reviewDueAt: "",
    reviewCompletedAt: "",
    attempts: [],
    updatedAt: new Date().toISOString(),
  };
}
