const normalizeEmailDomain = (emailDomain: string) =>
    emailDomain.trim().toLowerCase().replace(/^@/, "");

const getRouteParam = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : "";

const optionalTrimmedString = (value: unknown) =>
    typeof value === "string" ? value.trim() : undefined;

export { normalizeEmailDomain, getRouteParam, optionalTrimmedString };
