import type { ActionsType } from "@/common/fromPlugin";
import { ROOT_FILE_PATH } from "@/constants/github";

export const getVariablesStyles = async () => {
  const variables = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  const sanitizeName = (name: string) =>
    name.replace(/[^\w-]/g, "").replace(/\s+/g, "");

  const makeVariableName = (collectionName: string, variable: Variable) => {
    const parts = variable.name.split("/").map(sanitizeName);
    return [sanitizeName(collectionName), ...parts].join("-");
  };

  const getVariableById = async (id: string): Promise<Variable | undefined> => {
    try {
      return (await figma.variables.getVariableByIdAsync(id)) ?? undefined;
    } catch {
      return undefined;
    }
  };

  const getVariableCollectionById = async (
    id: string
  ): Promise<VariableCollection | undefined> => {
    try {
      return (
        (await figma.variables.getVariableCollectionByIdAsync(id)) ?? undefined
      );
    } catch {
      return undefined;
    }
  };

  const resolveVariableValue = async (
    variable: Variable,
    registerRef: (refCollectionName: string) => void
  ): Promise<string> => {
    const modeId = Object.keys(variable.valuesByMode)[0];
    const value = variable.valuesByMode[modeId];

    if (value !== 0 && !value) return "undefined";

    // [1] 참조 변수
    if (
      typeof value === "object" &&
      "type" in value &&
      value.type === "VARIABLE_ALIAS"
    ) {
      const refVar = await getVariableById(value.id);
      if (!refVar) return "undefined";

      const refCollection = await getVariableCollectionById(
        refVar.variableCollectionId
      );
      const refCollectionName = sanitizeName(refCollection?.name || "Unknown");

      registerRef(refCollectionName);

      const refName = makeVariableName(refCollectionName, refVar);
      return `map-get($${refCollectionName}, ${refName})`;
    }

    // [2] Color
    if (
      typeof value === "object" &&
      value !== null &&
      "r" in value &&
      "g" in value &&
      "b" in value
    ) {
      const r = Math.round(value.r * 255);
      const g = Math.round(value.g * 255);
      const b = Math.round(value.b * 255);
      const a =
        "a" in value && typeof value.a === "number"
          ? Math.round(value.a * 255)
          : 255;
      return `#${[r, g, b, a]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("")}`;
    }

    // [3] Number / String
    if (typeof value === "number") return `${value}px`;
    if (typeof value === "string") return value;

    return "undefined";
  };

  // 그룹핑
  const groupedByCollection = new Map<string, Variable[]>();
  for (const variable of variables) {
    const list = groupedByCollection.get(variable.variableCollectionId) ?? [];
    list.push(variable);
    groupedByCollection.set(variable.variableCollectionId, list);
  }

  // index.scss content 모음
  const rootForwardLines: string[] = [];

  // 컬렉션 단위 SCSS 생성
  const getSCSSMap = async (
    collectionName: string,
    variables: Variable[]
  ): Promise<string> => {
    const usedCollectionNames = new Set<string>();

    const registerRef = (refCollectionName: string) => {
      if (sanitizeName(refCollectionName) !== sanitizeName(collectionName)) {
        usedCollectionNames.add(refCollectionName);
      }
    };

    const entries = await Promise.all(
      variables.map(async (v) => {
        const name = makeVariableName(collectionName, v);
        const value = await resolveVariableValue(v, registerRef);
        return `  ${name}: ${value}`;
      })
    );

    const sanitized = sanitizeName(collectionName);

    const importLines: string[] = [];
    if (usedCollectionNames.size > 0) {
      importLines.push(`@use "sass:map";`);
      for (const ref of usedCollectionNames) {
        importLines.push(`@use "../${ref.toLowerCase()}" as *;`);
      }
    }

    return [
      ...importLines,
      `$${sanitized}: (\n${entries.join(",\n")}\n);`,
    ].join("\n\n");
  };

  const actions: ActionsType[] = [
    {
      file_path: `${ROOT_FILE_PATH}/variables/_index.scss`,
      content: "", // 나중에 forward 내용으로 채움
      action: "create",
    },
  ];

  for (const collection of collections) {
    const collectionName = collection.name;
    const vars = groupedByCollection.get(collection.id) || [];
    const content = await getSCSSMap(collectionName, vars);

    const sanitized = sanitizeName(collectionName);
    const filePath = `${ROOT_FILE_PATH}/variables/${sanitized.toLowerCase()}/_index.scss`;

    // 🔹 actions 배열에 컬렉션 파일 추가
    actions.push({
      file_path: filePath,
      content,
      action: "create",
    });

    // 🔹 root forward 라인 추가
    rootForwardLines.push(`@forward "${sanitized.toLowerCase()}";`);
  }

  // 마지막에 루트 index.scss 업데이트
  actions[0].content = rootForwardLines.join("\n");

  return {
    actions,
  };
};
