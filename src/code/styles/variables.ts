import type { ActionsType } from "@/common/fromPlugin";
import { ROOT_FILE_PATH } from "@/constants/github";
import { toCamelCase } from "../shared";

type FormatType = "SCSS" | "TS";

export const getVariablesStyles = async (format: FormatType) => {
  const variables = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  const normalizeName = (name: string) =>
    name.replace(/[^\w-]/g, "").replace(/\s+/g, "");

  const makeCollectionName = (name: string) =>
    normalizeName(name).toLowerCase();

  const makeVariableName = (collection: string, variable: Variable) =>
    format === "TS"
      ? toCamelCase(`${collection}/${variable.name}`)
      : [
          normalizeName(collection),
          ...variable.name.split("/").map(normalizeName),
        ].join("-");

  const getVariableById = async (id: string) => {
    try {
      return await figma.variables.getVariableByIdAsync(id);
    } catch {
      return undefined;
    }
  };

  const getVariableCollectionById = async (id: string) => {
    try {
      return await figma.variables.getVariableCollectionByIdAsync(id);
    } catch {
      return undefined;
    }
  };

  const resolveValue = async (
    variable: Variable,
    registerRef: (ref: string) => void
  ): Promise<string> => {
    const modeId = Object.keys(variable.valuesByMode)[0];
    const value = variable.valuesByMode[modeId];

    if (value !== 0 && !value) return "undefined";

    if (
      typeof value === "object" &&
      "type" in value &&
      value.type === "VARIABLE_ALIAS"
    ) {
      const refVar = await getVariableById(value.id);
      const refCollection = await getVariableCollectionById(
        refVar?.variableCollectionId || ""
      );
      const refColName = makeCollectionName(refCollection?.name || "Unknown");

      registerRef(refColName);

      const refName = makeVariableName(refColName, refVar!);
      return format === "SCSS"
        ? `map-get($${refColName}, ${refName})`
        : `${refColName}.${refName}`;
    }

    if (
      typeof value === "object" &&
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
      const hex = [r, g, b, a]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
      return format === "SCSS" ? `#${hex}` : `'#${hex}'`;
    }

    if (typeof value === "number") {
      const isOpacity = variable.name.toLowerCase().includes("opacity");
      return format === "SCSS"
        ? isOpacity
          ? `${value / 100}`
          : `${value}px`
        : isOpacity
        ? `${value / 100}`
        : `${value}`;
    }

    return typeof value === "string" ? `'${value}'` : "undefined";
  };

  const grouped = new Map<string, Variable[]>();
  for (const variable of variables) {
    const list = grouped.get(variable.variableCollectionId) ?? [];
    list.push(variable);
    grouped.set(variable.variableCollectionId, list);
  }

  const rootLines: string[] = [];
  const actions: ActionsType[] = [
    {
      action: "create",
      file_path: `${ROOT_FILE_PATH}/variables/${
        format === "SCSS" ? "_index.scss" : "index.ts"
      }`,
      content: "", // 나중에 채움
    },
  ];

  for (const collection of collections) {
    const vars = grouped.get(collection.id) || [];
    const usedRefs = new Set<string>();
    const registerRef = (ref: string) => usedRefs.add(ref);

    const entries = await Promise.all(
      vars.map(async (v) => {
        const name = makeVariableName(collection.name, v);
        const val = await resolveValue(v, registerRef);
        return `  ${name}: ${val}`;
      })
    );

    const collectionName = makeCollectionName(collection.name);
    const scssMap = `@use "sass:map";`;
    const importLines = [
      ...(format === "SCSS" && usedRefs.size > 0 ? [scssMap] : []),
      ...[...usedRefs].map((r) =>
        format === "SCSS"
          ? `@use "../${r}" as *;`
          : `import { ${r} } from '../${r}';`
      ),
    ];

    const content =
      format === "SCSS"
        ? `${importLines.join("\n")}\n\n$${collectionName}: (\n${entries.join(
            ",\n"
          )}\n);`
        : `${importLines.join(
            "\n"
          )}\n\nexport const ${collectionName} = {\n${entries.join(",\n")}\n};`;

    actions.push({
      action: "create",
      file_path: `${ROOT_FILE_PATH}/variables/${collectionName}/${
        format === "SCSS" ? "_index.scss" : "index.ts"
      }`,
      content,
    });

    rootLines.push(
      format === "SCSS"
        ? `@forward "${collectionName}";`
        : `import { ${collectionName} } from './${collectionName}';`
    );
  }

  if (format === "TS") {
    rootLines.push(
      `export { ${collections
        .map((c) => makeCollectionName(c.name))
        .join(", ")} };`
    );
  }

  actions[0].content = rootLines.join("\n");

  return { actions };
};
