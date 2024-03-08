export class Tags {
  /**
   * Creates a template function for processing string literals with embedded
   * expressions. This function can optionally trim leading whitespace from each
   * line of the string based on the indentation of the first non-empty line.
   *
   * @param {boolean} [trimLeading=true] - When true, trims the leading whitespace
   * from each line of the string to match the indentation of the first non-empty
   * line. When false, it leaves the string as-is.
   * @returns {Function} A template function that takes a template literal and
   * its embedded expressions as arguments. The function processes the template
   * literal, optionally trims leading whitespace, and returns the resulting
   * string.
   *
   * @example
   * // Usage with template literal:
   * const trim = trimLeading();
   * const result = trim`
   *   Line 1
   *   Line 2
   *   Line 3
   * `;
   * // result is "Line 1\n Line 2\nLine 3"
   */
  static trimLeading(applyIndent = 0, metadata = undefined) {
    return function lineNumbersTemplateFn(strings, ...args) {
      const woven = [];
      const meta = metadata ?? {};

      for (let [index, string] of strings.entries()) {
        woven.push(string);
        if (index < args.length) {
          woven.push(String(args[index]));
        }
      }

      const output = [];
      const lines = woven.join('').split('\n');

      let lineIndent = 0;
      let minIndent = 0;
      let addIndent = Number(applyIndent)
        ? ' '.repeat(Number(applyIndent))
        : '';

      for (const [index, line] of lines.entries()) {
        if (index === 0 || index === lines.length - 1) {
          if (!line.trim()) {
            continue;
          }
        }

        lineIndent = /^(\s+)/.exec(line)?.[1]?.length ?? 0;

        if (minIndent === 0 && lineIndent > 0) {
          minIndent = lineIndent;
        }

        minIndent = Math.min(lineIndent, minIndent);
        output.push(`${addIndent}${line.substring(minIndent)}`);
      }

      Object.assign(meta, { minIndent, output })

      return output.join('\n');
    }
  }
}