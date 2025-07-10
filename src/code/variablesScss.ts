import type { ActionsType } from "../common/fromPlugin";
import { ROOT_FILE_PATH } from "../constants/github";
import { styleLintCode } from "./code";
import { rgbaToHex } from "./shared";

type StyleVarValue = {
  mode: string;
  value: string;
};

type StyleCollection = {
  id: string;
  name: string;
  modes: Array<object>;
  variables: Array<StyleVariable>;
  data: VariableCollection;
};

type StyleCollectionDict = Record<string, StyleCollection>;

type StyleVariable = {
  id: string;
  data: Variable;
  cssPropertyName: string;
  values: Array<StyleVarValue>;
};

type StyleVariableDict = Record<string, StyleVariable>;

type SCSSPropertyObject = {
  [key: string]: {
    [key: string]: string | { [key: string]: string };
  };
};

function findVariableById(id: string, variables: Array<Variable>) {
  return variables.find((variable) => variable.id === id);
}

function resolveVarAlias(
  alias: VariableAlias,
  variables: Array<Variable>,
  modeName?: string
): string {
  const variable = findVariableById(alias.id, variables);
  if (!variable) {
    console.error("Variable not found:", alias.id);
    return "";
  }
  const cssPropertyName = createCSSPropertyName(variable.name, modeName);
  return `${cssPropertyName}`;
}

function createCSSPropertyName(name: string, modeName?: string) {
  let cssName = name.replace(/[^a-zA-Z0-9-]/g, "-");
  cssName = modeName
    ? `_${cssName}-${modeName.toLocaleLowerCase()}`
    : `_${cssName}`;
  return cssName;
}

function parseVariableValue(
  variable: Variable,
  modeName: string | undefined,
  value: VariableValue,
  allVariables: Array<Variable>
) {
  let parsedValue = "";

  if (value === undefined) {
    console.error("Value is undefined");
    return null;
  }

  if (
    value instanceof Object &&
    "type" in value &&
    value.type === "VARIABLE_ALIAS"
  ) {
    // Fetch the alias value
    const resolvedValue = resolveVarAlias(value, allVariables, modeName);
    parsedValue = resolvedValue;
  } else if (value instanceof Object && variable.resolvedType === "COLOR") {
    // Color
    const color = value as RGBA;
    const _color = {
      ...color,
      r: color.r * 255,
      b: color.b * 255,
      g: color.g * 255,
    };
    const hexColor = rgbaToHex(_color.r, _color.g, _color.b, _color.a);

    parsedValue = hexColor;
  } else if (typeof value === "number") {
    // Number
    parsedValue = `${value}px`;
  } else {
    // this should be text so put it in quotes
    // unsure if this can be converted to a CSS value
    parsedValue = `'${value.toString()}'`;
  }

  return parsedValue;
}

const getPrefix = (name: string) => {
  if (name.startsWith("_")) {
    name = name.slice(1);
  }
  const segments = name.split(/[-/]/);
  return {
    prefix: segments[0],
    subPrefix: segments.length > 1 ? segments[1] : undefined,
  };
};

const getFileInfo = (name: string) => {
  const folderList = ["global", "font", "atomic", "semantic"];
  const prefix = getPrefix(name).prefix.toLocaleLowerCase();
  let file_path = "";
  if (folderList.includes(prefix)) {
    file_path = `${ROOT_FILE_PATH}/variables/${prefix}/_index.scss`;
  } else {
    file_path = `${ROOT_FILE_PATH}/variables/_index.scss`;
  }
  return file_path;
};

// 이중 객체인 경우, 단일 객체인 경우에 따라 SCSS Map으로 변환
function convertToScssMap(
  objName: string,
  obj: { [key: string]: string | { [key: string]: string } }
): string {
  let scssMap = `$${objName}: (\n`;

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "object" && value !== null) {
      scssMap += `  ${key}: (\n`;
      for (const subKey in value) {
        scssMap += `    ${subKey}: ${value[subKey]},\n`;
      }
      scssMap += `  ),\n`;
    } else {
      scssMap += `  ${key}: ${value},\n`;
    }
  }

  scssMap += ");";
  return scssMap;
}

function formatPropertyValue(valueString: string): string {
  if (valueString.startsWith("_")) {
    const { prefix } = getPrefix(valueString);
    return `map-get($${prefix}, ${valueString})`;
  }
  return valueString;
}

function toCSSString(
  collections: StyleCollectionDict,
  vars: StyleVariableDict
) {
  const sortedCollections = sortCollectionsByName(collections);
  const cssPropertyObject: SCSSPropertyObject = {};
  const css: string[] = [];
  const actions: ActionsType[] = [
    {
      file_path: `${ROOT_FILE_PATH}/variables/_index.scss`,
      content: `@forward "global";\n@forward "font";\n@forward "atomic";\n@forward "semantic";`,
      action: "create",
    },
  ];

  sortedCollections.forEach((collection) => {
    processCollection(collection, vars, cssPropertyObject, css);
  });

  generateActions(cssPropertyObject, actions);

  return { css, actions };
}

function sortCollectionsByName(
  collections: StyleCollectionDict
): StyleCollection[] {
  return Object.values(collections).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

function processCollection(
  collection: StyleCollection,
  vars: StyleVariableDict,
  scssPropertyObject: SCSSPropertyObject,
  css: string[]
) {
  collection.data.variableIds.forEach((varID) => {
    const variable = vars[varID];

    if (variable.values?.length > 0) {
      variable.values.forEach((modeValue) => {
        const modeName =
          variable.values.length === 1
            ? ""
            : `-${modeValue.mode.toLowerCase()}`;
        const scssPropertyKey = `${createCSSPropertyName(
          variable.cssPropertyName
        )}${modeName}`;
        const scssPropertyValue = modeValue.value;
        const cssPropertyName = `${scssPropertyKey}: ${scssPropertyValue};`;

        css.push(cssPropertyName);

        const { prefix, subPrefix } = getPrefix(variable.cssPropertyName);

        if (!scssPropertyObject[prefix]) {
          scssPropertyObject[prefix] = {};
        }

        if (prefix === "Component" && subPrefix) {
          if (!scssPropertyObject[prefix][subPrefix]) {
            scssPropertyObject[prefix][subPrefix] = {};
          }
          (scssPropertyObject[prefix][subPrefix] as { [key: string]: string })[
            scssPropertyKey
          ] = formatPropertyValue(scssPropertyValue);
        } else {
          scssPropertyObject[prefix][scssPropertyKey] =
            formatPropertyValue(scssPropertyValue);
        }
      });
    }
  });
}

function generateActions(
  scssPropertyObject: SCSSPropertyObject,
  actions: ActionsType[]
) {
  for (const prefix in scssPropertyObject) {
    const file_path = getFileInfo(prefix);
    const levels = scssPropertyObject[prefix];
    const scssMap = convertToScssMap(prefix, levels);
    let content = "";

    if (prefix === "atomic") {
      content = `${styleLintCode}\n\n${scssMap}`;
    } else if (prefix === "semantic") {
      content = `${styleLintCode}\n\n@use "sass:map";\n@use "../atomic" as *;\n\n${scssMap}`;
    } else {
      // 예외 처리: atomic, semantic가 아닌 경우는 생성하지 않음
      console.warn(
        `Unknown prefix: ${prefix}. It will be excluded from the file.`
      );
      continue;
    }

    actions.push({
      file_path,
      content,
      action: "create",
    });
  }
}

export async function getVariablesStyles() {
  const variables = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  const collectionDictionary: StyleCollectionDict = {};
  const variableDictionary: StyleVariableDict = {};

  // process the collections
  for (const collection of collections) {
    const styleCollection = {} as StyleCollection;
    styleCollection.id = collection.id;
    styleCollection.name = collection.name;
    styleCollection.data = collection;
    styleCollection.modes = collection.modes;
    collectionDictionary[styleCollection.id] = styleCollection;
  }

  for (const variable of variables) {
    const styleVar = {} as StyleVariable;
    styleVar.id = variable.id;
    styleVar.data = variable;
    styleVar.cssPropertyName = variable.name;
    styleVar.values = [];
    variableDictionary[styleVar.id] = styleVar;

    const varCollection = collectionDictionary[variable.variableCollectionId];

    const modes = varCollection?.data.modes;

    Object.entries(variable.valuesByMode).forEach(([key]) => {
      const modeValue = variable.valuesByMode[key];
      const modeName =
        modes.length > 1
          ? modes?.find((mode) => mode.modeId === key)?.name
          : undefined;

      const parsedValue = parseVariableValue(
        variable,
        modeName,
        modeValue,
        variables
      );
      styleVar.values.push({ mode: modeName || "", value: parsedValue || "" });
    });
  }

  const cssString = toCSSString(collectionDictionary, variableDictionary);
  return cssString;
}
