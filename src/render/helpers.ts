
const htmlUnescapes: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
  '&#160;': ' ',
};

const reEscapedHtml = /&(?:amp|lt|gt|quot|nbsp|#(?:0+)?(?:39|160));/g;
const reHasEscapedHtml = RegExp(reEscapedHtml.source);

export const unescapeHtml = (string: string = ''): string => {
    return reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, (match) => htmlUnescapes[match] || "'") : string;
};

export const joinBase = (path: string, base?: string) => {
    if(!base) return path;

    try{
        return new URL(path, base).href;
    } catch {
        return path;
    }
};