import Scene from '@/components/Scene';
import BookingForm from '@/components/BookingForm';
import { INSTAGRAM } from '@/lib/data';

const acc = (c: string) => ({ '--acc': `var(--${c})` }) as React.CSSProperties;

export default function Home() {
  return (
    <>
      <Scene />
      <main id="main">
        <section className="stop hero" id="s0" aria-label="Intro">
          <div className="hero-copy">
            <p className="eyebrow">NextGEN DJ / Artist &middot; Sunburn Campus DJ</p>
            <h1 aria-label="Rubz">RUB<span>Z</span></h1>
            <p className="lede">Over a thousand shows, from college fests across India to stages in Malaysia, Thailand and Indonesia. Scroll to walk through the night.</p>
            <div className="cta">
              <a className="btn solid" href="#s5">Book Rubz</a>
              <a className="btn" href={INSTAGRAM} target="_blank" rel="noopener">@the_dj_rubz</a>
            </div>
            <div className="stats">
              <div className="stat"><b data-count="1000" data-suffix="+">1,000+</b><span>Shows played</span></div>
              <div className="stat"><b data-count="3">3</b><span>Countries abroad</span></div>
              <div className="stat"><b>12.7K</b><span>On Instagram</span></div>
            </div>
          </div>
        </section>

        <section className="stop" id="s1" aria-label="Sunburn Campus DJ">
          <div className="card" style={acc('gold')}>
            <p className="eyebrow">Sunburn Campus DJ</p>
            <h2>Built for the campus floor.</h2>
            <p>Rubz is a <strong>Sunburn Campus DJ</strong> and a NextGEN artist who plays college fests, where the crowd is young, loud and knows every drop. He has also shared stages as a supporting act for established performers.</p>
            <p className="hint" id="deckHint">Grab a record and drag it in a circle to scratch.</p>
          </div>
        </section>

        <section className="stop right" id="s2" aria-label="The campus run">
          <div className="card" style={acc('red')}>
            <p className="eyebrow">The campus run</p>
            <h2>1,000+ shows and counting.</h2>
            <p>A few of the campuses and cities from Rubz&apos;s Instagram highlights. Click a card in the ring, or pick one here.</p>
            <ul className="chips" id="tileChips" />
            <p className="pick" id="pick" aria-live="polite"><b>Pick a show</b><span>Cards are placeholders until dates and photos are added</span></p>
          </div>
        </section>

        <section className="stop" id="s3" aria-label="Shared stages">
          <div className="card wide" style={acc('violet')}>
            <p className="eyebrow">Shared stages</p>
            <h2>Supporting act for</h2>
            <ul className="acts" id="acts" />
            <p className="hint">Hover a name or a slab to light it up.</p>
          </div>
        </section>

        <section className="stop right" id="s4" aria-label="Beyond India">
          <div className="card" style={acc('gold')}>
            <p className="eyebrow">Beyond India</p>
            <h2>Malaysia. Thailand. Indonesia.</h2>
            <p>Rubz has performed at events in all three. The arcs on the globe start in India and land on each stop.</p>
            <ul className="chips"><li className="chip static">Malaysia</li><li className="chip static">Thailand</li><li className="chip static">Indonesia</li></ul>
            <p className="hint">Drag the globe to spin it.</p>
          </div>
        </section>

        <section className="stop right last" id="s5" aria-label="Book Rubz">
          <div className="card wide" style={acc('red')}>
            <p className="eyebrow">Book Rubz</p>
            <h2>Tell us about your fest.</h2>
            <BookingForm />
            <div className="foot">
              <span>Also: music page <a href="https://www.instagram.com/quinuxo/" target="_blank" rel="noopener">@quinuxo</a></span>
              <span><a href="https://www.threads.net/@the_dj_rubz" target="_blank" rel="noopener">Threads</a></span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
