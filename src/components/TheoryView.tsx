import type { Lab } from "../types/lab";
import { Formula } from "./Formula";

export function TheoryView({ lab }: { lab: Lab }) {
  return (
    <section className="content-card">
      <p className="eyebrow">Landasan Teori</p>
      <h2>{lab.title}</h2>
      <p className="lead">Materi ringkas ini dapat dikembangkan menjadi modul pembelajaran atau bahan ajar pada versi berikutnya.</p>

      <div className="theory-list">
        {lab.theory.map((block) => (
          <article key={block.title} className="theory-block">
            <h3>{block.title}</h3>
            <p>{block.body}</p>
            {block.formulas?.map((formula) => (
              <Formula key={formula} latex={formula} />
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
