import React from 'react';
import { Book, Cpu, Zap, Beaker } from 'lucide-react';

const TheoryCodex = () => {
  return (
    <div className="theory-container" style={{maxWidth: '800px', margin: '0 auto'}}>
      <div className="bio-card theory-content">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
          <Book size={32} style={{color: 'var(--bio-accent)'}} />
          <h2>The Genetic Mixology Codex</h2>
        </div>

        <section>
          <h3>1. The Fitness Architecture</h3>
          <p>
            The survival of a cocktail sequence is determined by a multi-objective fitness function that balances creative vibe alignment with biological (palatability) feasibility.
          </p>
          <div className="equation">
            F_total = (w_vibe * S_vibe) + (w_struct * S_struct) + (w_novel * S_novel)
          </div>
          <p>
            Where:
            <ul>
              <li><code className="mono">w_vibe = 0.40</code>: Alignment to target sensory input.</li>
              <li><code className="mono">w_struct = 0.40</code>: Adherence to balance guardrails.</li>
              <li><code className="mono">w_novel = 0.20</code>: Penalty for genetic redundancy.</li>
            </ul>
          </p>
        </section>

        <section>
          <h3>2. Vibe Alignment (Neural Embeddings)</h3>
          <p>
            We transform ingredients and target vibes into high-dimensional vectors using Sentence-Transformers. The similarity is calculated via Cosine Similarity in the vector space.
          </p>
          <div className="equation">
            S_vibe = (cos(θ) + 1) / 2
          </div>
          <p>
            This ensures that even completely novel ingredient combinations can be mapped accurately to user-defined "vibes" by their semantic proximity in the NLP model.
          </p>
        </section>

        <section>
          <h3>3. Structural Balance (Mixology Homeostasis)</h3>
          <p>
            The engine enforces two primary biological constraints to ensure every "specimen" is commercially viable:
          </p>
          <p><strong>Total Volume:</strong> Restricted between 90ml and 250ml.</p>
          <p><strong>Acid-to-Sweet Ratio:</strong> Optimized between 0.8 and 1.2.</p>
          <div className="equation">
            R_balance = V_acid / V_sweetener
          </div>
          <p>
            Specimens falling outside these metabolic bounds receive exponential fitness penalties.
          </p>
        </section>

        <section>
          <h3>4. Genetic Operators</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem'}}>
            <div className="stat-box">
              <Zap style={{color: 'var(--bio-accent)'}} />
              <div className="stat-label">Mutation: Volume Creep</div>
              <p style={{fontSize: '0.8rem', marginTop: '0.5rem'}}>Adjusts ML values by ±5-15ml to explore small phenotypic drifts.</p>
            </div>
            <div className="stat-box">
              <Cpu style={{color: 'var(--bio-secondary)'}} />
              <div className="stat-label">Crossover: Base Preservation</div>
              <p style={{fontSize: '0.8rem', marginTop: '0.5rem'}}>Swaps modifiers while keeping the 'Base Spirit' block intake, mimicking biological gene clusters.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TheoryCodex;
