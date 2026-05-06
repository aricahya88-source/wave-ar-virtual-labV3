import katex from "katex";

type FormulaProps = {
  latex: string;
  block?: boolean;
};

export function Formula({ latex, block = true }: FormulaProps) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: block,
    strict: false
  });

  return (
    <div
      className={block ? "formula formula-block" : "formula formula-inline"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
