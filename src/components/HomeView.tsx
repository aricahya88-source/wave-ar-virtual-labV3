import type { Lab } from "../types/lab";

export function HomeView({ labs, onStart }: { labs: Lab[]; onStart: () => void }) {
  return (
    <section className="home-grid">
      <div className="hero-card">
        <p className="eyebrow">Prototype Website Interaktif</p>
        <h2>Virtual Lab AR Laser untuk Gejala Gelombang Cahaya</h2>
        <p>
          Proyek ini dirancang sebagai fondasi awal laboratorium virtual berbasis laser. Setiap lab memiliki panduan, landasan teori, dan simulasi 3D yang dapat dikembangkan menjadi AR, gesture, evaluasi, serta laporan berbasis database pada tahap berikutnya.
        </p>
        <button className="primary-button" onClick={onStart}>Mulai Simulasi</button>
      </div>

      <div className="feature-grid">
        {labs.map((lab) => (
          <article key={lab.id} className="feature-card">
            <span>{lab.icon}</span>
            <h3>{lab.title}</h3>
            <p>{lab.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
