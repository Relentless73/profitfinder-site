# FlipProfit Design Directions

## Three approaches considered

### 1. Workshop Ledger
**Very Brief Intro:** An industrial field-notebook interface inspired by a mechanic’s work order, combining precise accounting with physical shop-floor cues. It makes a risky purchase decision feel clear, fast, and grounded.

**Probability:** 0.07

### 2. Auction Signal
**Very Brief Intro:** A high-contrast market-terminal direction, using compressed numerals and bid-card geometry to make deal screening feel like catching a live auction opportunity.

**Probability:** 0.03

### 3. Roadside Field Guide
**Very Brief Intro:** A warm, editorial guidebook style that pairs weathered-paper surfaces with practical checklists, aimed at careful independent operators.

**Probability:** 0.09

## Chosen Approach: Workshop Ledger

### Design Movement
**Utility Modernism** meets the visual language of a vehicle service invoice and a well-used garage notebook. The product is not a generic fintech dashboard; it is a practical decision instrument for people who buy, repair, transport, and resell real assets.

### Core Principles
1. **Decision before decoration:** the projected decision and money figures are visibly dominant.
2. **Measured toughness:** the interface is durable and direct, with disciplined spacing and no ornamental excess.
3. **Input-to-outcome traceability:** every result exposes the costs behind it, so the user can trust and adjust the numbers.
4. **Field-ready clarity:** tap targets, labels, and status language work on a phone at an auction, lot, or workshop.

### Color Philosophy
The base is a workshop mix of carbon-black, kiln-white, and concrete gray: neutral enough for dense numbers and long sessions. **Signal Orange (`#FF5C35`)** is the unmistakable FlipProfit brand color; it is used only for decisions, active controls, and the cost-of-mistake moments. A controlled safety-lime green signals a deal that clears the target, while a subdued red indicates a miss. The emotional aim is realistic confidence, not hype.

### Layout Paradigm
The desktop experience is a **split workbench** rather than a centered marketing page: a narrow dark tool rail establishes identity, the main panel holds the active worksheet, and a fixed visual result bay keeps the decision in sight. On mobile, the layout stacks as a sequential work order with the decision card placed immediately below the cost inputs.

### Signature Elements
1. A numbered **work-order rail** that marks each calculation stage.
2. A bold **BUY / BORDERLINE / PASS** decision stamp with a corner notch.
3. Ruled ledger lines and tiny component labels that echo a service invoice without reducing readability.

### Interaction Philosophy
Every interaction answers “what changes if I alter this cost?” Inputs have immediate, calm response; saved deals feel like filing a work order. Actions use direct verbs: **Calculate deal**, **Save work order**, and **Export ledger**. No fake urgency, gamification, or dark patterns.

### Animation
Inputs and buttons use short 140–180ms transform and color transitions with a firm ease-out. Result values crossfade on recalculation, while the decision stamp slides upward by 8px and settles into place. Saved-deal entries enter with a short stagger. All nonessential animation is disabled under `prefers-reduced-motion`.

### Typography System
**Barlow Condensed** is the display face for decisions, major numeric results, and section labels: compact, mechanical, and unmistakable. **DM Sans** carries body copy, input text, and helper information for high legibility. Display headings use uppercase with calibrated letter spacing; dense numbers use tabular figures.

### Brand Essence
**FlipProfit is the no-nonsense deal screen for independent vehicle and equipment resellers who need to know the real number before they buy.**

Personality: **practical, exact, grounded**.

### Brand Voice
Headlines state the decision problem plainly. CTAs use specific work language, not motivational filler. Microcopy explains assumptions without sounding legalistic.

Example lines: “Know your walk-away price before the gate opens.”

Example lines: “Every tow, title fee, and repair belongs in the number.”

### Wordmark & Logo
The wordmark combines a condensed **FLIP** with a clean **PROFIT** and a custom orange “F” mark built from a folded price tag and an upward ledger line. The mark stands alone in the left rail and favicon; it does not rely on the name to be recognizable.

### Signature Brand Color
**Signal Orange — `#FF5C35`**
