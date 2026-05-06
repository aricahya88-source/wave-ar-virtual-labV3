import type { Lab } from "../types/lab";

export function GuideView({ lab }: { lab: Lab }) {
  return (
    <section className="content-card">
      <p className="eyebrow">Panduan Praktikum</p>
      <h2>{lab.title}</h2>
      <p className="lead">{lab.objective}</p>

      <ol className="step-list">
        {lab.guide.map((step, index) => (
          <li key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </li>
        ))}
      </ol>

      <div className="info-box">
        <strong>Catatan penggunaan</strong>
        <p>Gunakan mode simulasi biasa terlebih dahulu. Setelah parameter dan objek dipahami, mode AR dan gesture dapat diaktifkan atau dikembangkan pada tahap berikutnya.</p>
      </div>
    </section>
  );
}
