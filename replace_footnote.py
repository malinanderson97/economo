import re

with open('FINAL DOCUMENTATION/model_digraphs.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the footnote with a properly styled info-callout block containing list items
new_footnote = """
    <div class="info-callout" style="margin-top: 40px; max-width: 800px;">
      <strong>Engine Dependencies</strong><br>
      The edges strictly follow the actual code implementation in the engine:
      <ul style="margin-top: 10px; margin-bottom: 0; padding-left: 20px; color: var(--ink-2); line-height: 1.6;">
        <li><strong>IS Curve:</strong> <code>Y = isOutput(...)</code> depends on <code>G, T, r</code> (and <code>ε, m₁, Y*</code> in Open).</li>
        <li><strong>Fisher:</strong> <code>r = i − πᵉ</code></li>
        <li><strong>Phillips (PC):</strong> <code>π = πᵉ + α(Y−Yₙ)/Yₙ + z</code></li>
        <li><strong>Taylor Rule:</strong> <code>i ← ρ·i + (1−ρ)[rₙ + π̄ + φ(π−π̄) + ψ·gap]</code></li>
        <li><strong>Structural:</strong> <code>Yₙ</code> is derived from <code>m, z</code></li>
        <li><strong>Exchange (Open):</strong> <code>E = Eᵉ(1+i)/(1+i*)</code> and <code>ε = E·P/P*</code></li>
      </ul>
    </div>
"""

# Find the footnote paragraph and replace it
html = re.sub(r'<p class="footnote">.*?</p>', new_footnote, html, flags=re.DOTALL)

with open('FINAL DOCUMENTATION/model_digraphs.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Footnote replaced.")
