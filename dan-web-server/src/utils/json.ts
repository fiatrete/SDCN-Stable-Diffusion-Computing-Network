export type JsonValue = string | number | boolean | null | JsonObject | Array<JsonValue>;

export interface JsonObject {
  [key: string]: JsonValue;
}
