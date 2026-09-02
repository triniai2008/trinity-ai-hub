// Trini AI — Sri Lankan G.C.E. A/L Technology Stream syllabus content.
// Plain data (client-safe types) consumed by the Turso seeder.
// Stream-agnostic on purpose: add another `stream` value to extend.

export type SeedQuiz = {
  q: string;
  options: string[];
  answer: string; // must match one option exactly
  explanation?: string;
  difficulty?: 1 | 2 | 3;
};

export type SeedCard = { front: string; back: string };

export type SeedTopic = {
  slug: string;
  title: string;
  body: string;
  definitions: { term: string; meaning: string }[];
  formulas?: { name: string; expr: string }[];
  practicals?: string[];
  quizzes: SeedQuiz[];
  cards: SeedCard[];
};

export type SeedLesson = {
  slug: string;
  title: string;
  outcomes: string[];
  topics: SeedTopic[];
};

export type SeedUnit = {
  slug: string;
  title: string;
  summary: string;
  lessons: SeedLesson[];
};

export type SeedSubject = {
  slug: string;
  code: string;
  name: string;
  description: string;
  stream: string;
  units: SeedUnit[];
  pastPapers: { year: number; paper: string; url: string }[];
  modelPapers: { title: string; url: string }[];
};

const DOE = "https://doenets.lk/examination/al";

export const SYLLABUS: SeedSubject[] = [
  // ─────────────────────────── ENGINEERING TECHNOLOGY ───────────────────────
  {
    slug: "et",
    code: "ET",
    name: "Engineering Technology",
    description:
      "Mechanical, civil, electrical and electronic technology for the A/L Technology Stream.",
    stream: "technology",
    units: [
      {
        slug: "et-u1",
        title: "Unit 1 — Engineering Materials",
        summary: "Classification, properties, testing and selection of engineering materials.",
        lessons: [
          {
            slug: "et-u1-l1",
            title: "Classification and Properties of Materials",
            outcomes: [
              "Classify engineering materials into metals, polymers, ceramics and composites.",
              "Describe mechanical, thermal and electrical properties.",
              "Select a suitable material for a given engineering application.",
            ],
            topics: [
              {
                slug: "et-u1-l1-t1",
                title: "Material Classification and Mechanical Properties",
                body: [
                  "Engineering materials are grouped as **metals**, **polymers**, **ceramics** and **composites**.",
                  "",
                  "- **Ferrous metals** contain iron (mild steel, cast iron, stainless steel) and are usually magnetic and prone to rust.",
                  "- **Non-ferrous metals** (aluminium, copper, brass, zinc) resist corrosion and are lighter.",
                  "- **Thermoplastics** soften on heating and can be re-shaped; **thermosets** set permanently.",
                  "- **Composites** (GFRP, reinforced concrete) combine a matrix and a reinforcement to gain properties neither has alone.",
                  "",
                  "Key mechanical properties tested at A/L level: strength, hardness, toughness, ductility, malleability, brittleness, elasticity and fatigue resistance.",
                ].join("\n"),
                definitions: [
                  { term: "Ductility", meaning: "Ability of a material to be drawn into wires without fracture." },
                  { term: "Toughness", meaning: "Ability to absorb energy and deform plastically before fracture." },
                  { term: "Hardness", meaning: "Resistance of a surface to indentation, scratching or abrasion." },
                ],
                formulas: [
                  { name: "Stress", expr: "σ = F / A" },
                  { name: "Strain", expr: "ε = ΔL / L" },
                  { name: "Young's modulus", expr: "E = σ / ε" },
                ],
                practicals: [
                  "Carry out a tensile test on a mild-steel specimen and plot the stress–strain curve.",
                  "Compare Brinell hardness values of mild steel, brass and aluminium.",
                ],
                quizzes: [
                  {
                    q: "Which property allows a metal to be drawn into a wire?",
                    options: ["Hardness", "Ductility", "Brittleness", "Toughness"],
                    answer: "Ductility",
                    explanation: "Ductility is plastic deformation under tensile stress — wire drawing.",
                    difficulty: 1,
                  },
                  {
                    q: "A rod of area 200 mm² carries an axial load of 10 kN. The direct stress is:",
                    options: ["5 MPa", "20 MPa", "50 MPa", "2 MPa"],
                    answer: "50 MPa",
                    explanation: "σ = F/A = 10 000 N / 200 mm² = 50 N/mm² = 50 MPa.",
                    difficulty: 2,
                  },
                  {
                    q: "Which of the following is a thermosetting plastic?",
                    options: ["Polythene", "PVC", "Bakelite", "Polypropylene"],
                    answer: "Bakelite",
                    explanation: "Bakelite cures irreversibly and cannot be re-melted.",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "Define elasticity", back: "The ability of a material to return to its original shape once the load is removed." },
                  { front: "Young's modulus formula", back: "E = σ / ε (stress ÷ strain), units N/m² or Pa." },
                  { front: "Ferrous vs non-ferrous", back: "Ferrous metals contain iron and rust; non-ferrous do not contain iron and resist corrosion." },
                ],
              },
            ],
          },
          {
            slug: "et-u1-l2",
            title: "Heat Treatment and Material Testing",
            outcomes: [
              "Explain annealing, normalising, hardening and tempering.",
              "Describe destructive and non-destructive testing methods.",
            ],
            topics: [
              {
                slug: "et-u1-l2-t1",
                title: "Heat Treatment Processes",
                body: [
                  "Heat treatment changes the internal structure of a metal to obtain required properties.",
                  "",
                  "- **Annealing** — heat, hold, then cool very slowly in the furnace. Softens the metal and relieves internal stress.",
                  "- **Normalising** — heat then cool in still air. Gives a fine, uniform grain structure.",
                  "- **Hardening** — heat then quench rapidly in water or oil. Produces a hard, brittle structure.",
                  "- **Tempering** — reheat a hardened part to a lower temperature and cool. Reduces brittleness and restores toughness.",
                  "",
                  "Surface treatments such as **case hardening** give a hard skin over a tough core — used for gears and camshafts.",
                ].join("\n"),
                definitions: [
                  { term: "Quenching", meaning: "Rapid cooling of a heated metal in water, oil or brine." },
                  { term: "Case hardening", meaning: "Hardening only the surface layer while the core stays tough." },
                ],
                practicals: ["Harden and temper a small steel specimen and compare its hardness before and after."],
                quizzes: [
                  {
                    q: "Which heat treatment is carried out AFTER hardening to reduce brittleness?",
                    options: ["Annealing", "Normalising", "Tempering", "Case hardening"],
                    answer: "Tempering",
                    explanation: "Tempering reheats the hardened part to relieve stress and restore toughness.",
                    difficulty: 1,
                  },
                  {
                    q: "Annealing is best described as heating and then:",
                    options: ["Quenching in water", "Cooling very slowly in the furnace", "Cooling in still air", "Cooling in oil"],
                    answer: "Cooling very slowly in the furnace",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "Purpose of annealing", back: "Soften the metal, refine grain and relieve internal stresses by very slow cooling." },
                  { front: "Case hardening gives…", back: "A hard wear-resistant surface with a tough, shock-absorbing core." },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "et-u2",
        title: "Unit 2 — Mechanics and Structures",
        summary: "Forces, moments, equilibrium, simple machines and structural members.",
        lessons: [
          {
            slug: "et-u2-l1",
            title: "Forces, Moments and Equilibrium",
            outcomes: [
              "Resolve forces into components and find resultants.",
              "Apply the principle of moments to solve beam problems.",
            ],
            topics: [
              {
                slug: "et-u2-l1-t1",
                title: "Coplanar Forces and the Principle of Moments",
                body: [
                  "A body is in **static equilibrium** when the resultant force and the resultant moment are both zero.",
                  "",
                  "Conditions of equilibrium for coplanar forces:",
                  "1. ΣFx = 0 — algebraic sum of horizontal components is zero.",
                  "2. ΣFy = 0 — algebraic sum of vertical components is zero.",
                  "3. ΣM = 0 — algebraic sum of moments about any point is zero.",
                  "",
                  "For a simply supported beam, take moments about one support to find the other reaction, then use ΣFy = 0.",
                ].join("\n"),
                definitions: [
                  { term: "Moment of a force", meaning: "The turning effect of a force about a point: force × perpendicular distance." },
                  { term: "Couple", meaning: "Two equal, opposite, parallel forces whose only effect is rotation." },
                ],
                formulas: [
                  { name: "Moment", expr: "M = F × d" },
                  { name: "Resultant of perpendicular forces", expr: "R = √(Fx² + Fy²)" },
                  { name: "Direction", expr: "tan θ = Fy / Fx" },
                ],
                practicals: ["Verify the principle of moments using a metre rule, knife-edge and slotted weights."],
                quizzes: [
                  {
                    q: "A force of 20 N acts at a perpendicular distance of 0.5 m from a pivot. The moment is:",
                    options: ["4 N m", "10 N m", "20 N m", "40 N m"],
                    answer: "10 N m",
                    explanation: "M = F × d = 20 × 0.5 = 10 N m.",
                    difficulty: 1,
                  },
                  {
                    q: "For a body in equilibrium under coplanar forces, which set of conditions must hold?",
                    options: ["ΣFx = 0 only", "ΣM = 0 only", "ΣFx = 0, ΣFy = 0 and ΣM = 0", "ΣFy = 0 and ΣM ≠ 0"],
                    answer: "ΣFx = 0, ΣFy = 0 and ΣM = 0",
                    difficulty: 2,
                  },
                ],
                cards: [
                  { front: "State the principle of moments", back: "For a body in equilibrium, the sum of clockwise moments about a point equals the sum of anticlockwise moments." },
                  { front: "Resultant of two perpendicular forces", back: "R = √(Fx² + Fy²), acting at tan θ = Fy/Fx to the x-axis." },
                ],
              },
            ],
          },
          {
            slug: "et-u2-l2",
            title: "Simple Machines and Efficiency",
            outcomes: [
              "Calculate mechanical advantage, velocity ratio and efficiency.",
              "Analyse levers, pulleys, screw jacks and inclined planes.",
            ],
            topics: [
              {
                slug: "et-u2-l2-t1",
                title: "Mechanical Advantage, Velocity Ratio and Efficiency",
                body: [
                  "A **simple machine** lets a small effort overcome a large load by trading force for distance.",
                  "",
                  "- **Mechanical advantage (MA)** = Load ÷ Effort.",
                  "- **Velocity ratio (VR)** = distance moved by effort ÷ distance moved by load.",
                  "- **Efficiency (η)** = MA ÷ VR × 100 %.",
                  "",
                  "Because friction always wastes energy, MA < VR and η < 100 % for every real machine.",
                ].join("\n"),
                definitions: [
                  { term: "Velocity ratio", meaning: "Ratio of the distance moved by the effort to the distance moved by the load — depends only on geometry." },
                  { term: "Self-locking machine", meaning: "A machine with efficiency below 50 %, which will not run backwards under load." },
                ],
                formulas: [
                  { name: "Mechanical advantage", expr: "MA = W / P" },
                  { name: "Efficiency", expr: "η = (MA / VR) × 100 %" },
                  { name: "Screw jack VR", expr: "VR = 2πL / p" },
                ],
                practicals: ["Determine the efficiency of a screw jack for varying loads and plot η against load."],
                quizzes: [
                  {
                    q: "A machine lifts a 400 N load with an effort of 100 N. Its mechanical advantage is:",
                    options: ["0.25", "2", "4", "40"],
                    answer: "4",
                    explanation: "MA = W/P = 400/100 = 4.",
                    difficulty: 1,
                  },
                  {
                    q: "If MA = 4 and VR = 5, the efficiency of the machine is:",
                    options: ["20 %", "45 %", "80 %", "125 %"],
                    answer: "80 %",
                    explanation: "η = MA/VR × 100 = 4/5 × 100 = 80 %.",
                    difficulty: 2,
                  },
                ],
                cards: [
                  { front: "Why is efficiency always < 100 %?", back: "Friction and the weight of moving parts waste part of the input energy." },
                  { front: "Condition for a self-locking machine", back: "Efficiency less than 50 %." },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "et-u3",
        title: "Unit 3 — Electrical and Electronic Technology",
        summary: "DC circuits, AC fundamentals, semiconductor devices and digital logic.",
        lessons: [
          {
            slug: "et-u3-l1",
            title: "DC Circuits and Network Laws",
            outcomes: [
              "Apply Ohm's law and Kirchhoff's laws to resistive networks.",
              "Compute equivalent resistance for series and parallel combinations.",
            ],
            topics: [
              {
                slug: "et-u3-l1-t1",
                title: "Ohm's Law and Kirchhoff's Laws",
                body: [
                  "**Ohm's law**: at constant temperature, the current through a conductor is directly proportional to the potential difference across it.",
                  "",
                  "**Kirchhoff's Current Law (KCL)** — the algebraic sum of currents at a junction is zero.",
                  "**Kirchhoff's Voltage Law (KVL)** — the algebraic sum of EMFs and potential drops around any closed loop is zero.",
                  "",
                  "Series resistors add directly; parallel resistors add as reciprocals. Always mark current directions before writing loop equations.",
                ].join("\n"),
                definitions: [
                  { term: "EMF", meaning: "The energy supplied by a source per unit charge driven around the circuit." },
                  { term: "Internal resistance", meaning: "The resistance within a source that causes terminal voltage to fall under load." },
                ],
                formulas: [
                  { name: "Ohm's law", expr: "V = I R" },
                  { name: "Series resistance", expr: "Rs = R1 + R2 + R3" },
                  { name: "Parallel resistance", expr: "1/Rp = 1/R1 + 1/R2" },
                  { name: "Power", expr: "P = VI = I²R = V²/R" },
                ],
                practicals: ["Verify Ohm's law and determine the internal resistance of a dry cell."],
                quizzes: [
                  {
                    q: "Two 6 Ω resistors are connected in parallel. The equivalent resistance is:",
                    options: ["12 Ω", "6 Ω", "3 Ω", "1.5 Ω"],
                    answer: "3 Ω",
                    explanation: "1/Rp = 1/6 + 1/6 = 1/3, so Rp = 3 Ω.",
                    difficulty: 1,
                  },
                  {
                    q: "Kirchhoff's Current Law is a statement of the conservation of:",
                    options: ["Energy", "Charge", "Momentum", "Power"],
                    answer: "Charge",
                    difficulty: 2,
                  },
                  {
                    q: "A 12 V supply drives 2 A through a resistor. The power dissipated is:",
                    options: ["6 W", "14 W", "24 W", "144 W"],
                    answer: "24 W",
                    explanation: "P = VI = 12 × 2 = 24 W.",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "State Kirchhoff's Voltage Law", back: "Around any closed loop, the algebraic sum of EMFs equals the algebraic sum of potential drops." },
                  { front: "Three expressions for electrical power", back: "P = VI, P = I²R, P = V²/R." },
                ],
              },
            ],
          },
          {
            slug: "et-u3-l2",
            title: "Semiconductors and Digital Logic",
            outcomes: [
              "Explain p–n junction behaviour, rectification and transistor switching.",
              "Simplify and implement basic logic gate circuits.",
            ],
            topics: [
              {
                slug: "et-u3-l2-t1",
                title: "Diodes, Transistors and Logic Gates",
                body: [
                  "A **p–n junction diode** conducts in forward bias (≈0.7 V for silicon) and blocks in reverse bias — the basis of rectification.",
                  "",
                  "- **Half-wave rectifier** uses one diode; **full-wave bridge** uses four and gives a smoother output.",
                  "- A **BJT** used as a switch is either in **cut-off** (off) or **saturation** (on).",
                  "",
                  "Digital logic: AND, OR, NOT, NAND, NOR, XOR. NAND and NOR are *universal gates* — any circuit can be built from them alone.",
                ].join("\n"),
                definitions: [
                  { term: "Rectification", meaning: "The conversion of alternating current into unidirectional (DC) current." },
                  { term: "Universal gate", meaning: "A gate (NAND or NOR) from which all other logic functions can be constructed." },
                ],
                formulas: [
                  { name: "Transistor current", expr: "IE = IB + IC" },
                  { name: "Current gain", expr: "β = IC / IB" },
                ],
                practicals: ["Build a full-wave bridge rectifier with a smoothing capacitor and observe the output on a CRO."],
                quizzes: [
                  {
                    q: "How many diodes are used in a full-wave bridge rectifier?",
                    options: ["1", "2", "4", "6"],
                    answer: "4",
                    difficulty: 1,
                  },
                  {
                    q: "Which gate pair is described as universal?",
                    options: ["AND and OR", "NAND and NOR", "XOR and NOT", "OR and NOT"],
                    answer: "NAND and NOR",
                    difficulty: 2,
                  },
                ],
                cards: [
                  { front: "Forward voltage drop of a silicon diode", back: "Approximately 0.7 V (germanium ≈ 0.3 V)." },
                  { front: "Transistor as a switch — two states", back: "Cut-off (fully OFF) and saturation (fully ON)." },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "et-u4",
        title: "Unit 4 — Construction Technology and Fluid Mechanics",
        summary: "Building materials, structural elements, water supply and fluid principles.",
        lessons: [
          {
            slug: "et-u4-l1",
            title: "Construction Materials and Structural Elements",
            outcomes: [
              "Describe concrete constituents, mix ratios and curing.",
              "Identify foundations, beams, columns and slabs and their functions.",
            ],
            topics: [
              {
                slug: "et-u4-l1-t1",
                title: "Concrete and Reinforced Concrete Elements",
                body: [
                  "Concrete = **cement + fine aggregate + coarse aggregate + water** (plus admixtures).",
                  "",
                  "- Concrete is strong in **compression** but weak in **tension**, so steel bars carry the tensile forces — hence *reinforced* concrete.",
                  "- A common nominal mix is 1 : 2 : 4 (cement : sand : metal) by volume.",
                  "- **Curing** keeps the concrete moist for at least 7 days so hydration continues and design strength develops.",
                  "",
                  "Structural elements: foundation → column → beam → slab, each transferring load to the element below it.",
                ].join("\n"),
                definitions: [
                  { term: "Workability", meaning: "The ease with which fresh concrete can be mixed, placed and compacted — measured by the slump test." },
                  { term: "Curing", meaning: "Maintaining moisture and temperature so cement hydration continues after placing." },
                ],
                formulas: [{ name: "Water–cement ratio", expr: "w/c = mass of water / mass of cement" }],
                practicals: ["Perform a slump test on fresh concrete and relate the slump to workability."],
                quizzes: [
                  {
                    q: "Steel reinforcement is provided in concrete mainly to resist:",
                    options: ["Compression", "Tension", "Corrosion", "Heat"],
                    answer: "Tension",
                    explanation: "Concrete is weak in tension; steel carries the tensile stresses.",
                    difficulty: 1,
                  },
                  {
                    q: "The slump test measures the ___ of fresh concrete.",
                    options: ["Strength", "Workability", "Density", "Curing time"],
                    answer: "Workability",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "Constituents of concrete", back: "Cement, fine aggregate (sand), coarse aggregate (metal) and water." },
                  { front: "Why cure concrete?", back: "To retain moisture so hydration continues and the design strength is achieved." },
                ],
              },
            ],
          },
          {
            slug: "et-u4-l2",
            title: "Fluid Mechanics Fundamentals",
            outcomes: [
              "Apply pressure, continuity and Bernoulli relations.",
              "Explain water supply and drainage arrangements in buildings.",
            ],
            topics: [
              {
                slug: "et-u4-l2-t1",
                title: "Pressure, Continuity and Bernoulli's Equation",
                body: [
                  "Pressure at a depth h in a liquid is p = ρgh, independent of the shape of the container.",
                  "",
                  "The **continuity equation** states that for an incompressible fluid, A₁v₁ = A₂v₂ — narrower pipe, faster flow.",
                  "",
                  "**Bernoulli's equation** expresses conservation of energy along a streamline: pressure energy + kinetic energy + potential energy is constant.",
                ].join("\n"),
                definitions: [
                  { term: "Laminar flow", meaning: "Smooth flow in which fluid layers slide over one another without mixing." },
                  { term: "Turbulent flow", meaning: "Irregular flow with eddies and mixing, occurring at high Reynolds number." },
                ],
                formulas: [
                  { name: "Hydrostatic pressure", expr: "p = ρ g h" },
                  { name: "Continuity", expr: "A₁v₁ = A₂v₂" },
                  { name: "Bernoulli", expr: "p + ½ρv² + ρgh = constant" },
                ],
                practicals: ["Measure the discharge of a small orifice and compare with the theoretical value."],
                quizzes: [
                  {
                    q: "Water pressure at 2 m depth (ρ = 1000 kg/m³, g = 10 m/s²) is:",
                    options: ["2 kPa", "20 kPa", "200 kPa", "2000 kPa"],
                    answer: "20 kPa",
                    explanation: "p = ρgh = 1000 × 10 × 2 = 20 000 Pa = 20 kPa.",
                    difficulty: 2,
                  },
                  {
                    q: "When a pipe narrows, the velocity of an incompressible fluid:",
                    options: ["Decreases", "Increases", "Stays the same", "Becomes zero"],
                    answer: "Increases",
                    explanation: "A₁v₁ = A₂v₂, so a smaller area means a larger velocity.",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "Continuity equation", back: "A₁v₁ = A₂v₂ for steady, incompressible flow." },
                  { front: "Bernoulli's equation", back: "p + ½ρv² + ρgh = constant along a streamline." },
                ],
              },
            ],
          },
        ],
      },
    ],
    pastPapers: [
      { year: 2023, paper: "Paper I (MCQ)", url: `${DOE}` },
      { year: 2022, paper: "Paper II (Structured & Essay)", url: `${DOE}` },
    ],
    modelPapers: [{ title: "Trini AI Model Paper — ET 01", url: `${DOE}` }],
  },

  // ─────────────────────────── SCIENCE FOR TECHNOLOGY ───────────────────────
  {
    slug: "sft",
    code: "SFT",
    name: "Science for Technology",
    description:
      "The scientific foundation behind technology: matter, energy, biology, environment and food.",
    stream: "technology",
    units: [
      {
        slug: "sft-u1",
        title: "Unit 1 — World of Matter",
        summary: "Structure of matter, bonding, solutions, acids, bases and polymers.",
        lessons: [
          {
            slug: "sft-u1-l1",
            title: "Atomic Structure and Chemical Bonding",
            outcomes: [
              "Describe atomic structure and electronic configuration.",
              "Distinguish ionic, covalent and metallic bonding.",
            ],
            topics: [
              {
                slug: "sft-u1-l1-t1",
                title: "Bonding and Properties of Substances",
                body: [
                  "Atoms combine to reach a stable outer electron arrangement.",
                  "",
                  "- **Ionic bonding** — electrons are transferred (metal + non-metal). High melting point, conducts when molten or dissolved.",
                  "- **Covalent bonding** — electrons are shared (non-metal + non-metal). Usually low melting point, poor conductor.",
                  "- **Metallic bonding** — positive ions in a sea of delocalised electrons. Good conductor, malleable, ductile.",
                  "",
                  "Physical properties follow directly from the bonding type — this is a very common structured-question link.",
                ].join("\n"),
                definitions: [
                  { term: "Electronegativity", meaning: "The tendency of an atom to attract a shared pair of electrons towards itself." },
                  { term: "Isotopes", meaning: "Atoms of the same element with equal proton number but different neutron number." },
                ],
                practicals: ["Test the electrical conductivity of NaCl solution, sugar solution and copper wire."],
                quizzes: [
                  {
                    q: "Which bonding type explains why metals conduct electricity?",
                    options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
                    answer: "Metallic",
                    explanation: "Delocalised electrons are free to move and carry charge.",
                    difficulty: 1,
                  },
                  {
                    q: "Solid sodium chloride does NOT conduct electricity because:",
                    options: ["It has no ions", "Its ions are fixed in the lattice", "It is covalent", "It has free electrons"],
                    answer: "Its ions are fixed in the lattice",
                    difficulty: 2,
                  },
                ],
                cards: [
                  { front: "Ionic bond forms between…", back: "A metal and a non-metal, by transfer of electrons." },
                  { front: "Why are metals malleable?", back: "Layers of positive ions can slide over each other while the electron sea holds them together." },
                ],
              },
            ],
          },
          {
            slug: "sft-u1-l2",
            title: "Acids, Bases and Solutions",
            outcomes: ["Apply the pH scale.", "Perform and interpret simple titrations."],
            topics: [
              {
                slug: "sft-u1-l2-t1",
                title: "pH, Neutralisation and Concentration",
                body: [
                  "The **pH scale** runs 0–14: below 7 acidic, 7 neutral, above 7 basic.",
                  "",
                  "Neutralisation: acid + base → salt + water. In titration, an indicator marks the end point where the reaction is just complete.",
                  "",
                  "Concentration is normally expressed in mol dm⁻³; always convert cm³ to dm³ by dividing by 1000.",
                ].join("\n"),
                definitions: [
                  { term: "Strong acid", meaning: "An acid that ionises completely in water (HCl, H₂SO₄, HNO₃)." },
                  { term: "End point", meaning: "The point in a titration at which the indicator changes colour." },
                ],
                formulas: [
                  { name: "Concentration", expr: "c = n / V   (mol dm⁻³)" },
                  { name: "Titration relation", expr: "c₁V₁ / n₁ = c₂V₂ / n₂" },
                ],
                practicals: ["Titrate 25.0 cm³ of NaOH against standard HCl using methyl orange."],
                quizzes: [
                  {
                    q: "A solution of pH 3 is:",
                    options: ["Strongly basic", "Weakly basic", "Acidic", "Neutral"],
                    answer: "Acidic",
                    difficulty: 1,
                  },
                  {
                    q: "0.5 mol of solute in 250 cm³ of solution gives a concentration of:",
                    options: ["0.125 mol dm⁻³", "0.5 mol dm⁻³", "2 mol dm⁻³", "125 mol dm⁻³"],
                    answer: "2 mol dm⁻³",
                    explanation: "c = n/V = 0.5 / 0.250 = 2 mol dm⁻³.",
                    difficulty: 2,
                  },
                ],
                cards: [
                  { front: "Neutralisation word equation", back: "Acid + Base → Salt + Water." },
                  { front: "Convert cm³ to dm³", back: "Divide by 1000 (250 cm³ = 0.250 dm³)." },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "sft-u2",
        title: "Unit 2 — Energy and Its Applications",
        summary: "Forms of energy, conversions, renewable sources and efficiency.",
        lessons: [
          {
            slug: "sft-u2-l1",
            title: "Energy Forms, Conversion and Conservation",
            outcomes: [
              "State the law of conservation of energy.",
              "Calculate work, power and efficiency in practical situations.",
            ],
            topics: [
              {
                slug: "sft-u2-l1-t1",
                title: "Work, Power and Efficiency",
                body: [
                  "Energy cannot be created or destroyed, only converted from one form to another.",
                  "",
                  "- Work done = force × distance moved in the direction of the force.",
                  "- Power = rate of doing work.",
                  "- Efficiency = useful output energy ÷ total input energy × 100 %.",
                  "",
                  "In every real conversion some energy is degraded to heat and sound, so efficiency is always below 100 %.",
                ].join("\n"),
                definitions: [
                  { term: "Power", meaning: "The rate of doing work or transferring energy, measured in watts." },
                  { term: "Renewable energy", meaning: "Energy from a source that is naturally replenished, such as solar, wind, hydro or biomass." },
                ],
                formulas: [
                  { name: "Work", expr: "W = F × d" },
                  { name: "Power", expr: "P = W / t" },
                  { name: "Kinetic energy", expr: "Ek = ½ m v²" },
                  { name: "Potential energy", expr: "Ep = m g h" },
                ],
                practicals: ["Determine the power output of a student climbing a staircase."],
                quizzes: [
                  {
                    q: "A motor does 600 J of work in 10 s. Its power output is:",
                    options: ["6 W", "60 W", "600 W", "6000 W"],
                    answer: "60 W",
                    explanation: "P = W/t = 600/10 = 60 W.",
                    difficulty: 1,
                  },
                  {
                    q: "Which of the following is NOT a renewable energy source?",
                    options: ["Solar", "Wind", "Natural gas", "Biomass"],
                    answer: "Natural gas",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "Efficiency formula", back: "η = (useful output energy ÷ input energy) × 100 %." },
                  { front: "Unit of energy and power", back: "Energy: joule (J). Power: watt (W) = J/s." },
                ],
              },
            ],
          },
          {
            slug: "sft-u2-l2",
            title: "Heat Transfer",
            outcomes: ["Distinguish conduction, convection and radiation.", "Apply heat capacity calculations."],
            topics: [
              {
                slug: "sft-u2-l2-t1",
                title: "Conduction, Convection and Radiation",
                body: [
                  "- **Conduction** — energy passes through a material by particle vibration and free electrons; best in metals.",
                  "- **Convection** — hot fluid becomes less dense, rises, and sets up a convection current.",
                  "- **Radiation** — energy travels as infrared electromagnetic waves and needs no medium.",
                  "",
                  "Dull black surfaces are the best emitters and absorbers; shiny silver surfaces are the best reflectors.",
                ].join("\n"),
                definitions: [
                  { term: "Specific heat capacity", meaning: "Energy needed to raise the temperature of 1 kg of a substance by 1 K." },
                  { term: "Latent heat", meaning: "Energy absorbed or released during a change of state at constant temperature." },
                ],
                formulas: [
                  { name: "Heat energy", expr: "Q = m c ΔT" },
                  { name: "Latent heat", expr: "Q = m L" },
                ],
                practicals: ["Compare cooling rates of black and shiny calorimeters filled with hot water."],
                quizzes: [
                  {
                    q: "Which method of heat transfer does NOT need a medium?",
                    options: ["Conduction", "Convection", "Radiation", "All need a medium"],
                    answer: "Radiation",
                    difficulty: 1,
                  },
                  {
                    q: "Energy to heat 2 kg of water (c = 4200 J kg⁻¹K⁻¹) by 10 K is:",
                    options: ["8.4 kJ", "42 kJ", "84 kJ", "840 kJ"],
                    answer: "84 kJ",
                    explanation: "Q = mcΔT = 2 × 4200 × 10 = 84 000 J.",
                    difficulty: 2,
                  },
                ],
                cards: [
                  { front: "Q = m c ΔT — what is c?", back: "Specific heat capacity, in J kg⁻¹ K⁻¹." },
                  { front: "Best emitter of radiation", back: "A dull black surface." },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "sft-u3",
        title: "Unit 3 — Biological Resources and Environment",
        summary: "Microorganisms, biotechnology, ecosystems and pollution control.",
        lessons: [
          {
            slug: "sft-u3-l1",
            title: "Microorganisms and Biotechnology",
            outcomes: ["Classify microorganisms.", "Describe fermentation and its industrial uses."],
            topics: [
              {
                slug: "sft-u3-l1-t1",
                title: "Microorganisms and Fermentation",
                body: [
                  "Microorganisms include bacteria, fungi, viruses, algae and protozoa.",
                  "",
                  "**Fermentation** is the anaerobic breakdown of sugars by microbes. Yeast converts glucose to ethanol and carbon dioxide — the basis of baking and brewing.",
                  "",
                  "Industrial biotechnology uses controlled fermentation for antibiotics, enzymes, yoghurt, vinegar and biogas.",
                ].join("\n"),
                definitions: [
                  { term: "Fermentation", meaning: "Anaerobic breakdown of carbohydrates by microorganisms producing alcohol or acids." },
                  { term: "Pasteurisation", meaning: "Heating a food to a set temperature for a set time to kill pathogens while preserving quality." },
                ],
                formulas: [{ name: "Alcoholic fermentation", expr: "C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂" }],
                practicals: ["Investigate CO₂ production by yeast at different temperatures."],
                quizzes: [
                  {
                    q: "Yeast converts glucose into ethanol and:",
                    options: ["Oxygen", "Carbon dioxide", "Methane", "Nitrogen"],
                    answer: "Carbon dioxide",
                    difficulty: 1,
                  },
                  {
                    q: "Fermentation by yeast takes place under which condition?",
                    options: ["Aerobic", "Anaerobic", "High pressure only", "Freezing"],
                    answer: "Anaerobic",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "Equation for alcoholic fermentation", back: "C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ (anaerobic, by yeast)." },
                  { front: "Two industrial uses of fermentation", back: "Antibiotic production and yoghurt/vinegar manufacture (also biogas, bread)." },
                ],
              },
            ],
          },
          {
            slug: "sft-u3-l2",
            title: "Environmental Pollution and Waste Management",
            outcomes: ["Identify pollutants and their effects.", "Describe 3R waste management."],
            topics: [
              {
                slug: "sft-u3-l2-t1",
                title: "Pollution Control and the 3R Concept",
                body: [
                  "Pollution is the addition of harmful substances to air, water or soil beyond the capacity of the environment to absorb them.",
                  "",
                  "- Air: CO, SO₂, NOₓ, particulates → acid rain and respiratory disease.",
                  "- Water: sewage, fertiliser runoff → eutrophication and oxygen depletion.",
                  "",
                  "The **3R** hierarchy — Reduce, Reuse, Recycle — is the preferred waste-management strategy, with composting and sanitary landfill for residues.",
                ].join("\n"),
                definitions: [
                  { term: "Eutrophication", meaning: "Nutrient enrichment of water causing algal bloom and oxygen depletion." },
                  { term: "BOD", meaning: "Biochemical oxygen demand — oxygen required by microbes to decompose organic matter in water." },
                ],
                practicals: ["Compare the turbidity and pH of water samples from three local sources."],
                quizzes: [
                  {
                    q: "Excess fertiliser reaching a lake most directly causes:",
                    options: ["Acid rain", "Eutrophication", "Global warming", "Ozone depletion"],
                    answer: "Eutrophication",
                    difficulty: 2,
                  },
                  {
                    q: "In the 3R concept, the most preferred option is to:",
                    options: ["Recycle", "Reuse", "Reduce", "Landfill"],
                    answer: "Reduce",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "What does BOD indicate?", back: "The amount of biodegradable organic pollution in water — high BOD means heavy pollution." },
                  { front: "Main gas causing acid rain", back: "Sulphur dioxide (with nitrogen oxides)." },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "sft-u4",
        title: "Unit 4 — Food Technology and Health",
        summary: "Nutrients, food preservation, safety and quality standards.",
        lessons: [
          {
            slug: "sft-u4-l1",
            title: "Food Preservation Methods",
            outcomes: ["Explain the principles of food spoilage and preservation."],
            topics: [
              {
                slug: "sft-u4-l1-t1",
                title: "Principles of Food Preservation",
                body: [
                  "Food spoils because of microbial growth, enzyme action, moisture and oxidation.",
                  "",
                  "Preservation works by removing one requirement for microbial growth:",
                  "- **Drying / salting / sugaring** — removes available water.",
                  "- **Chilling / freezing** — slows microbial and enzyme activity.",
                  "- **Canning / pasteurisation** — heat kills microorganisms.",
                  "- **Vacuum packing** — removes oxygen.",
                ].join("\n"),
                definitions: [
                  { term: "Water activity", meaning: "The amount of free water available in food for microbial growth." },
                  { term: "SLS mark", meaning: "The Sri Lanka Standards certification mark indicating a product meets national quality standards." },
                ],
                practicals: ["Compare the shelf life of fresh and salted fish samples over one week."],
                quizzes: [
                  {
                    q: "Salting preserves food mainly by:",
                    options: ["Killing all microbes instantly", "Reducing available water", "Adding nutrients", "Raising the pH"],
                    answer: "Reducing available water",
                    difficulty: 2,
                  },
                  {
                    q: "The Sri Lankan national quality certification mark for products is the:",
                    options: ["ISO mark", "SLS mark", "CE mark", "FDA mark"],
                    answer: "SLS mark",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "Four causes of food spoilage", back: "Microorganisms, enzymes, moisture and oxidation." },
                  { front: "How does freezing preserve food?", back: "Low temperature slows microbial growth and enzyme reactions (it does not sterilise)." },
                ],
              },
            ],
          },
        ],
      },
    ],
    pastPapers: [
      { year: 2023, paper: "Paper I (MCQ)", url: `${DOE}` },
      { year: 2022, paper: "Paper II (Structured & Essay)", url: `${DOE}` },
    ],
    modelPapers: [{ title: "Trini AI Model Paper — SFT 01", url: `${DOE}` }],
  },

  // ──────────────────── INFORMATION & COMMUNICATION TECHNOLOGY ──────────────
  {
    slug: "ict",
    code: "ICT",
    name: "Information & Communication Technology",
    description:
      "Data representation, systems, networking, databases, programming and web development.",
    stream: "technology",
    units: [
      {
        slug: "ict-u1",
        title: "Unit 1 — Data Representation and Logic",
        summary: "Number systems, character codes, Boolean algebra and logic circuits.",
        lessons: [
          {
            slug: "ict-u1-l1",
            title: "Number Systems and Conversions",
            outcomes: ["Convert between binary, octal, decimal and hexadecimal.", "Perform binary arithmetic and 2's complement."],
            topics: [
              {
                slug: "ict-u1-l1-t1",
                title: "Binary, Hexadecimal and 2's Complement",
                body: [
                  "Computers store everything in binary. A/L ICT expects fluent conversion between base 2, 8, 10 and 16.",
                  "",
                  "- Decimal → binary: repeated division by 2, read remainders upwards.",
                  "- Binary → hex: group bits in fours from the right.",
                  "- **2's complement** represents negative numbers: invert all bits, then add 1.",
                  "",
                  "1 byte = 8 bits, so an 8-bit signed range is −128 to +127.",
                ].join("\n"),
                definitions: [
                  { term: "Bit", meaning: "A binary digit — the smallest unit of data, 0 or 1." },
                  { term: "2's complement", meaning: "A method of representing signed integers where the negative is formed by inverting bits and adding 1." },
                ],
                formulas: [
                  { name: "Signed range (n bits)", expr: "−2ⁿ⁻¹ … +2ⁿ⁻¹ − 1" },
                  { name: "Unsigned range (n bits)", expr: "0 … 2ⁿ − 1" },
                ],
                practicals: ["Convert a set of decimal numbers to binary/hex and verify with a programmer's calculator."],
                quizzes: [
                  {
                    q: "The decimal number 13 in binary is:",
                    options: ["1011", "1101", "1110", "1001"],
                    answer: "1101",
                    explanation: "8 + 4 + 1 = 13 → 1101.",
                    difficulty: 1,
                  },
                  {
                    q: "The hexadecimal equivalent of binary 10111010 is:",
                    options: ["BA", "AB", "A5", "5B"],
                    answer: "BA",
                    explanation: "1011 = B, 1010 = A.",
                    difficulty: 2,
                  },
                  {
                    q: "The range of an 8-bit signed integer in 2's complement is:",
                    options: ["0 to 255", "−127 to +127", "−128 to +127", "−255 to +255"],
                    answer: "−128 to +127",
                    difficulty: 2,
                  },
                ],
                cards: [
                  { front: "Binary → hex grouping rule", back: "Group bits in fours from the right; each group is one hex digit." },
                  { front: "How to form 2's complement", back: "Invert every bit (1's complement), then add 1." },
                ],
              },
            ],
          },
          {
            slug: "ict-u1-l2",
            title: "Boolean Algebra and Logic Circuits",
            outcomes: ["Simplify Boolean expressions.", "Draw and interpret logic circuits and truth tables."],
            topics: [
              {
                slug: "ict-u1-l2-t1",
                title: "Logic Gates, Truth Tables and Simplification",
                body: [
                  "Boolean algebra formalises digital logic. Key laws: identity, null, idempotent, complement, De Morgan's.",
                  "",
                  "**De Morgan's theorems**:",
                  "- (A·B)' = A' + B'",
                  "- (A + B)' = A' · B'",
                  "",
                  "Karnaugh maps give a fast visual route to a minimal sum-of-products expression — group 1s in powers of two.",
                ].join("\n"),
                definitions: [
                  { term: "Truth table", meaning: "A table listing the output for every possible combination of inputs." },
                  { term: "Sum of products", meaning: "A Boolean expression written as ORed AND-terms, e.g. A·B + A'·C." },
                ],
                formulas: [
                  { name: "De Morgan 1", expr: "(A·B)' = A' + B'" },
                  { name: "De Morgan 2", expr: "(A+B)' = A'·B'" },
                ],
                practicals: ["Build an XOR function using only NAND gates and verify its truth table."],
                quizzes: [
                  {
                    q: "According to De Morgan's theorem, (A + B)' equals:",
                    options: ["A' + B'", "A' · B'", "A · B", "A + B"],
                    answer: "A' · B'",
                    difficulty: 2,
                  },
                  {
                    q: "How many rows does the truth table of a 3-input gate have?",
                    options: ["3", "6", "8", "9"],
                    answer: "8",
                    explanation: "2³ = 8 combinations.",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "A + A' = ?", back: "1 (complement law)." },
                  { front: "Rows in an n-input truth table", back: "2ⁿ." },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "ict-u2",
        title: "Unit 2 — Computer Systems and Networking",
        summary: "Hardware, operating systems, network topologies, protocols and security.",
        lessons: [
          {
            slug: "ict-u2-l1",
            title: "Computer Architecture and Operating Systems",
            outcomes: ["Describe the CPU fetch–decode–execute cycle.", "Explain OS functions and memory types."],
            topics: [
              {
                slug: "ict-u2-l1-t1",
                title: "CPU, Memory and the Operating System",
                body: [
                  "The CPU contains the **ALU**, **Control Unit** and **registers**, and runs the fetch–decode–execute cycle continuously.",
                  "",
                  "Memory hierarchy (fast/small → slow/large): registers → cache → RAM → secondary storage.",
                  "",
                  "Operating system functions: process management, memory management, file management, device management and providing a user interface.",
                ].join("\n"),
                definitions: [
                  { term: "Cache memory", meaning: "Very fast memory between the CPU and RAM that stores frequently used data." },
                  { term: "Virtual memory", meaning: "Use of secondary storage as an extension of RAM when physical memory is insufficient." },
                ],
                practicals: ["Identify motherboard components and record RAM/CPU specifications of a lab machine."],
                quizzes: [
                  {
                    q: "Which CPU component performs arithmetic and logical operations?",
                    options: ["Control Unit", "ALU", "Cache", "Register"],
                    answer: "ALU",
                    difficulty: 1,
                  },
                  {
                    q: "Which memory is volatile?",
                    options: ["ROM", "RAM", "Hard disk", "Flash drive"],
                    answer: "RAM",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "Three stages of the machine cycle", back: "Fetch → Decode → Execute (then store)." },
                  { front: "Five OS functions", back: "Process, memory, file, device management and user interface." },
                ],
              },
            ],
          },
          {
            slug: "ict-u2-l2",
            title: "Networking Fundamentals",
            outcomes: ["Compare LAN/WAN and topologies.", "Explain IP addressing and common protocols."],
            topics: [
              {
                slug: "ict-u2-l2-t1",
                title: "Topologies, Protocols and IP Addressing",
                body: [
                  "Networks are classified by size (PAN, LAN, MAN, WAN) and by topology (bus, star, ring, mesh, hybrid).",
                  "",
                  "**Star** is the most common LAN topology — each node connects to a central switch, so one cable fault affects only one node.",
                  "",
                  "Protocols: HTTP/HTTPS (web), FTP (files), SMTP/POP3/IMAP (email), TCP/IP (transport & addressing), DNS (name resolution), DHCP (automatic IP allocation).",
                ].join("\n"),
                definitions: [
                  { term: "Protocol", meaning: "An agreed set of rules governing how data is transmitted between devices." },
                  { term: "IP address", meaning: "A unique numerical identifier assigned to a device on a network (IPv4 is 32-bit)." },
                ],
                formulas: [{ name: "Usable hosts in a subnet", expr: "2ʰ − 2, where h = number of host bits" }],
                practicals: ["Build a small star LAN, assign static IPs and test connectivity with ping."],
                quizzes: [
                  {
                    q: "Which protocol automatically assigns IP addresses to devices?",
                    options: ["DNS", "DHCP", "FTP", "SMTP"],
                    answer: "DHCP",
                    difficulty: 1,
                  },
                  {
                    q: "In a star topology, the failure of one cable:",
                    options: ["Brings down the whole network", "Affects only the connected node", "Affects half the network", "Has no effect at all"],
                    answer: "Affects only the connected node",
                    difficulty: 2,
                  },
                  {
                    q: "An IPv4 address is how many bits long?",
                    options: ["16", "32", "64", "128"],
                    answer: "32",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "Job of DNS", back: "Translates human-readable domain names into IP addresses." },
                  { front: "Device that connects different networks", back: "A router." },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "ict-u3",
        title: "Unit 3 — Databases and Information Systems",
        summary: "Relational model, normalisation, SQL and system development life cycle.",
        lessons: [
          {
            slug: "ict-u3-l1",
            title: "Relational Databases and Normalisation",
            outcomes: ["Draw ER diagrams.", "Normalise a relation to 3NF.", "Write basic SQL queries."],
            topics: [
              {
                slug: "ict-u3-l1-t1",
                title: "Keys, Normalisation and SQL Basics",
                body: [
                  "A **relation** (table) stores rows (records) and columns (fields). A **primary key** uniquely identifies each row; a **foreign key** links to a primary key in another table.",
                  "",
                  "Normalisation removes redundancy:",
                  "- **1NF** — no repeating groups; all values atomic.",
                  "- **2NF** — 1NF and no partial dependency on part of a composite key.",
                  "- **3NF** — 2NF and no transitive dependency.",
                  "",
                  "Core SQL: `SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY`.",
                ].join("\n"),
                definitions: [
                  { term: "Primary key", meaning: "An attribute (or set) that uniquely identifies each tuple in a relation." },
                  { term: "Transitive dependency", meaning: "A non-key attribute depending on another non-key attribute." },
                ],
                formulas: [{ name: "Basic query", expr: "SELECT col FROM table WHERE condition ORDER BY col;" }],
                practicals: ["Create a two-table student/marks database and run join queries."],
                quizzes: [
                  {
                    q: "A relation is in 1NF when:",
                    options: ["It has no transitive dependency", "All values are atomic with no repeating groups", "It has a foreign key", "It has no partial dependency"],
                    answer: "All values are atomic with no repeating groups",
                    difficulty: 2,
                  },
                  {
                    q: "Which SQL clause filters rows BEFORE grouping?",
                    options: ["HAVING", "WHERE", "ORDER BY", "GROUP BY"],
                    answer: "WHERE",
                    explanation: "WHERE filters rows; HAVING filters groups after aggregation.",
                    difficulty: 2,
                  },
                ],
                cards: [
                  { front: "Primary key vs foreign key", back: "Primary key uniquely identifies a row in its own table; a foreign key references a primary key in another table." },
                  { front: "Condition for 3NF", back: "Already in 2NF and no transitive dependency between non-key attributes." },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "ict-u4",
        title: "Unit 4 — Programming and Web Development",
        summary: "Algorithms, Python/pseudocode, HTML/CSS and client–server web concepts.",
        lessons: [
          {
            slug: "ict-u4-l1",
            title: "Algorithms and Programming Constructs",
            outcomes: ["Write pseudocode and flowcharts.", "Use sequence, selection and iteration correctly."],
            topics: [
              {
                slug: "ict-u4-l1-t1",
                title: "Sequence, Selection and Iteration",
                body: [
                  "Every algorithm is built from three control structures: **sequence**, **selection** (if/else) and **iteration** (loops).",
                  "",
                  "Flowchart symbols: oval = start/stop, parallelogram = input/output, rectangle = process, diamond = decision.",
                  "",
                  "A **trace table** records the value of each variable at each step — a standard structured-question task.",
                ].join("\n"),
                definitions: [
                  { term: "Algorithm", meaning: "A finite, ordered set of unambiguous steps that solves a problem." },
                  { term: "Iteration", meaning: "Repetition of a block of statements while a condition holds." },
                ],
                formulas: [{ name: "Python loop", expr: "for i in range(1, n+1): total += i" }],
                practicals: ["Write and trace a Python program that finds the largest of N numbers."],
                quizzes: [
                  {
                    q: "In a flowchart, a decision is represented by a:",
                    options: ["Rectangle", "Oval", "Diamond", "Parallelogram"],
                    answer: "Diamond",
                    difficulty: 1,
                  },
                  {
                    q: "`for i in range(1, 5)` in Python iterates over:",
                    options: ["1,2,3,4", "1,2,3,4,5", "0,1,2,3,4", "0 to 5"],
                    answer: "1,2,3,4",
                    explanation: "range stops before the end value.",
                    difficulty: 2,
                  },
                ],
                cards: [
                  { front: "Three basic control structures", back: "Sequence, selection and iteration." },
                  { front: "Purpose of a trace table", back: "To record variable values step by step and verify algorithm correctness." },
                ],
              },
            ],
          },
          {
            slug: "ict-u4-l2",
            title: "Web Development Basics",
            outcomes: ["Write valid HTML5 and CSS.", "Explain the client–server model."],
            topics: [
              {
                slug: "ict-u4-l2-t1",
                title: "HTML, CSS and the Client–Server Model",
                body: [
                  "A browser (**client**) sends an HTTP request; a **web server** returns HTML, CSS, JavaScript and media.",
                  "",
                  "- **HTML** provides structure (`<h1>`, `<p>`, `<table>`, `<form>`).",
                  "- **CSS** provides presentation — inline, internal or external style sheets.",
                  "- **JavaScript** provides client-side behaviour.",
                  "",
                  "Server-side scripting (PHP, Python) generates dynamic pages and talks to the database.",
                ].join("\n"),
                definitions: [
                  { term: "URL", meaning: "Uniform Resource Locator — the address used to fetch a resource on the web." },
                  { term: "External style sheet", meaning: "A separate .css file linked to HTML, giving consistent styling across pages." },
                ],
                formulas: [{ name: "Link a stylesheet", expr: '<link rel="stylesheet" href="style.css">' }],
                practicals: ["Build a three-page school website with a shared external stylesheet."],
                quizzes: [
                  {
                    q: "Which HTML tag creates the largest heading?",
                    options: ["<head>", "<h6>", "<h1>", "<title>"],
                    answer: "<h1>",
                    difficulty: 1,
                  },
                  {
                    q: "CSS is mainly responsible for a web page's:",
                    options: ["Structure", "Presentation", "Database access", "Server logic"],
                    answer: "Presentation",
                    difficulty: 1,
                  },
                ],
                cards: [
                  { front: "HTML vs CSS vs JavaScript", back: "HTML = structure, CSS = presentation, JavaScript = behaviour." },
                  { front: "What does HTTP stand for?", back: "HyperText Transfer Protocol." },
                ],
              },
            ],
          },
        ],
      },
    ],
    pastPapers: [
      { year: 2023, paper: "Paper I (MCQ)", url: `${DOE}` },
      { year: 2022, paper: "Paper II (Structured & Essay)", url: `${DOE}` },
    ],
    modelPapers: [{ title: "Trini AI Model Paper — ICT 01", url: `${DOE}` }],
  },
];
