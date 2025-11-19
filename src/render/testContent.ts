/**
 * Test content that combines Markdown and LaTeX
 * Use this to test the ReactRenderer with various formatting
 */

export const testMarkdownWithLatex = `# Mathematical Document with Markdown

This is a **comprehensive test document** that combines *Markdown* and LaTeX to test the renderer capabilities.

## 1. Inline Math Examples

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ and Euler's identity is $e^{i\\pi} + 1 = 0$.

The Pythagorean theorem states that $a^2 + b^2 = c^2$ for right triangles.

### 1.1 Greek Letters and Symbols

Common symbols: $\\alpha$, $\\beta$, $\\gamma$, $\\Delta$, $\\Sigma$, $\\int$, $\\infty$, $\\partial$

## 2. Block Math Examples

The **Fundamental Theorem of Calculus**:

$$\\int_a^b f(x)\\,dx = F(b) - F(a)$$

**Maxwell's Equations** in differential form:

$$\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0}$$

$$\\nabla \\cdot \\mathbf{B} = 0$$

$$\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}$$

$$\\nabla \\times \\mathbf{B} = \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}$$

## 3. Lists with Math

### Ordered List

1. First, we define the function $f(x) = x^2 + 2x + 1$
2. Then we calculate its derivative $f'(x) = 2x + 2$
3. Finally, we find critical points where $f'(x) = 0$

### Unordered List

- The set of real numbers: $\\mathbb{R}$
- The set of complex numbers: $\\mathbb{C}$
- The set of natural numbers: $\\mathbb{N}$
- The set of integers: $\\mathbb{Z}$

### Task List

- [x] Learn basic calculus
- [x] Understand limits: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$
- [ ] Master differential equations
- [ ] Study complex analysis

## 4. Code Blocks

Here's a Python function to calculate the derivative numerically:

\`\`\`python
def derivative(f, x, h=1e-5):
    """Numerical derivative using central difference"""
    return (f(x + h) - f(x - h)) / (2 * h)

# Example: f(x) = x^2
f = lambda x: x**2
print(f"f'(2) ≈ {derivative(f, 2)}")  # Should be close to 4
\`\`\`

Inline code example: \`const euler = Math.E ** (Math.PI * 1i) + 1\`

## 5. Blockquotes with Math

> "Mathematics is the language in which God has written the universe." — Galileo Galilei
>
> Consider the beautiful identity: $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$

## 6. Tables with Math

| Function | Derivative | Integral |
|----------|-----------|----------|
| $x^n$ | $nx^{n-1}$ | $\\frac{x^{n+1}}{n+1} + C$ |
| $e^x$ | $e^x$ | $e^x + C$ |
| $\\sin x$ | $\\cos x$ | $-\\cos x + C$ |
| $\\cos x$ | $-\\sin x$ | $\\sin x + C$ |
| $\\ln x$ | $\\frac{1}{x}$ | $x\\ln x - x + C$ |

## 7. Advanced Math Expressions

### Matrix Notation

The transformation matrix for rotation by angle $\\theta$:

$$R(\\theta) = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}$$

### Summations and Products

The sum of the first $n$ natural numbers:

$$\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}$$

The factorial function:

$$n! = \\prod_{k=1}^{n} k$$

### Calculus

**Taylor Series** expansion of $e^x$:

$$e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots$$

**Fourier Transform**:

$$\\hat{f}(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t}\\,dt$$

## 8. Mixed Formatting

We can combine ***bold and italic*** with math: $\\mathbf{F} = m\\mathbf{a}$ (Newton's Second Law)

~~This is deleted text~~ but this shows the normal distribution: $f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$

## 9. Links and Images

Check out the [Wikipedia article on Calculus](https://en.wikipedia.org/wiki/Calculus) for more information.

![Gaussian Distribution](https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Normal_Distribution_PDF.svg/400px-Normal_Distribution_PDF.svg.png "Normal Distribution")

---

## 10. Special Cases

### Nested Structures

- **Probability Theory**
  - The probability density function: $p(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$
  - Expected value: $E[X] = \\int_{-\\infty}^{\\infty} x \\cdot p(x)\\,dx$
    1. Calculate mean $\\mu$
    2. Calculate variance $\\sigma^2 = E[(X - \\mu)^2]$
    3. Standard deviation: $\\sigma$

### Aligned Equations

Solving the quadratic equation $ax^2 + bx + c = 0$:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Where the discriminant $\\Delta = b^2 - 4ac$ determines:
- $\\Delta > 0$: two real solutions
- $\\Delta = 0$: one repeated solution  
- $\\Delta < 0$: two complex conjugate solutions

---

**End of Test Document** 🎉

This document tests: headings, paragraphs, **bold**, *italic*, ~~strikethrough~~, inline math $f(x)$, block math, code blocks, blockquotes, lists, tables, links, images, and horizontal rules.
`;

export const simpleTest = `# Quick Test

This is a simple paragraph with inline math: $E = mc^2$

Block math example:

$$\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}$$

- Item 1 with $\\alpha$
- Item 2 with $\\beta$
`;

export const latexHeavyTest = `# Advanced LaTeX Test

$$\\begin{aligned}
\\frac{\\partial u}{\\partial t} &= \\nabla^2 u \\\\
u(x,0) &= f(x) \\\\
\\frac{\\partial u}{\\partial n}\\bigg|_{\\partial\\Omega} &= 0
\\end{aligned}$$

The **Schrödinger equation** in quantum mechanics:

$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$

Where $\\hat{H} = -\\frac{\\hbar^2}{2m}\\nabla^2 + V(\\mathbf{r})$ is the Hamiltonian operator.
`;

export const chemistryTest = `# Chemistry: Equations and Reactions

Welcome to this **chemistry test document** that combines *chemical equations*, *molecular structures*, and LaTeX formatting!

## 1. Basic Chemical Equations

### Combustion of Methane

The combustion of methane ($\\text{CH}_4$) in oxygen:

$$\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$$

### Photosynthesis

Plants convert carbon dioxide and water into glucose using sunlight:

$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{light}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

## 2. Acid-Base Chemistry

### pH and Hydrogen Ion Concentration

The **pH** of a solution is defined as:

$$\\text{pH} = -\\log_{10}[\\text{H}^+]$$

For a neutral solution at 25°C, $[\\text{H}^+] = 1.0 \\times 10^{-7}$ M, so:

$$\\text{pH} = -\\log(10^{-7}) = 7$$

### Common Acids and Bases

| Substance | Formula | Type | pH Range |
|-----------|---------|------|----------|
| Hydrochloric acid | $\\text{HCl}$ | Strong acid | 0-1 |
| Sulfuric acid | $\\text{H}_2\\text{SO}_4$ | Strong acid | 0-1 |
| Acetic acid | $\\text{CH}_3\\text{COOH}$ | Weak acid | 2.4-3.4 |
| Sodium hydroxide | $\\text{NaOH}$ | Strong base | 13-14 |
| Ammonia | $\\text{NH}_3$ | Weak base | 11-12 |

## 3. Thermodynamics

### Gibbs Free Energy

The spontaneity of a reaction is determined by:

$$\\Delta G = \\Delta H - T\\Delta S$$

Where:
- $\\Delta G$ = Gibbs free energy change
- $\\Delta H$ = Enthalpy change
- $T$ = Temperature (in Kelvin)
- $\\Delta S$ = Entropy change

> **Key principle**: A reaction is spontaneous when $\\Delta G < 0$

### The Arrhenius Equation

The rate constant $k$ varies with temperature:

$$k = A e^{-\\frac{E_a}{RT}}$$

Where $E_a$ is the activation energy and $R = 8.314\\,\\text{J/(mol·K)}$ is the gas constant.

## 4. Chemical Kinetics

### Rate Laws

For a reaction: $\\text{A} + \\text{B} \\rightarrow \\text{C}$

The rate law is:

$$\\text{Rate} = k[\\text{A}]^m[\\text{B}]^n$$

### First-Order Reactions

The integrated rate law for first-order kinetics:

$$\\ln[\\text{A}]_t = \\ln[\\text{A}]_0 - kt$$

Or equivalently:

$$[\\text{A}]_t = [\\text{A}]_0 e^{-kt}$$

**Half-life** for first-order reactions:

$$t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}$$

## 5. Redox Reactions

### Oxidation-Reduction Example

**Reaction of zinc with copper(II) sulfate:**

$$\\text{Zn}(s) + \\text{CuSO}_4(aq) \\rightarrow \\text{ZnSO}_4(aq) + \\text{Cu}(s)$$

**Half-reactions:**

- Oxidation: $\\text{Zn} \\rightarrow \\text{Zn}^{2+} + 2e^-$
- Reduction: $\\text{Cu}^{2+} + 2e^- \\rightarrow \\text{Cu}$

### Nernst Equation

Cell potential under non-standard conditions:

$$E = E^\\circ - \\frac{RT}{nF}\\ln Q$$

Or at 25°C:

$$E = E^\\circ - \\frac{0.0592}{n}\\log Q$$

## 6. Quantum Chemistry

### The Schrödinger Equation for Hydrogen Atom

$$\\hat{H}\\psi = E\\psi$$

Where the Hamiltonian operator is:

$$\\hat{H} = -\\frac{\\hbar^2}{2m}\\nabla^2 - \\frac{e^2}{4\\pi\\epsilon_0 r}$$

### Atomic Orbitals

Energy levels in hydrogen:

$$E_n = -\\frac{13.6\\,\\text{eV}}{n^2}$$

Where $n = 1, 2, 3, \\ldots$ is the principal quantum number.

## 7. Molecular Structures

### Lewis Structures

1. Water ($\\text{H}_2\\text{O}$): bent shape, bond angle $\\approx 104.5^\\circ$
2. Methane ($\\text{CH}_4$): tetrahedral, bond angle $= 109.5^\\circ$
3. Ammonia ($\\text{NH}_3$): trigonal pyramidal
4. Carbon dioxide ($\\text{CO}_2$): linear

### VSEPR Theory

Valence Shell Electron Pair Repulsion (VSEPR) predicts molecular geometry.

## 8. Equilibrium

### The Equilibrium Constant

For the reaction: $a\\text{A} + b\\text{B} \\rightleftharpoons c\\text{C} + d\\text{D}$

$$K_c = \\frac{[\\text{C}]^c[\\text{D}]^d}{[\\text{A}]^a[\\text{B}]^b}$$

### Le Chatelier's Principle

> When a system at equilibrium is disturbed, it shifts to counteract the disturbance.

### The Relationship Between $K$ and $\\Delta G$

$$\\Delta G^\\circ = -RT\\ln K$$

## 9. Common Chemical Calculations

### Molarity

$$M = \\frac{\\text{moles of solute}}{\\text{liters of solution}}$$

### Ideal Gas Law

$$PV = nRT$$

Where:
- $P$ = pressure (atm)
- $V$ = volume (L)
- $n$ = moles
- $R = 0.0821\\,\\text{L·atm/(mol·K)}$
- $T$ = temperature (K)

### Density Calculation

$$\\rho = \\frac{m}{V} = \\frac{PM}{RT}$$

## 10. Example Problem

**Question**: Calculate the pH of a 0.01 M HCl solution.

**Solution**:

Since HCl is a strong acid, it fully dissociates:

$$\\text{HCl} \\rightarrow \\text{H}^+ + \\text{Cl}^-$$

Therefore: $[\\text{H}^+] = 0.01\\,\\text{M} = 1 \\times 10^{-2}\\,\\text{M}$

$$\\text{pH} = -\\log(0.01) = -\\log(10^{-2}) = 2$$

**Answer**: pH = 2 ✓

---

## Summary Checklist

- [x] Chemical equations with subscripts and superscripts
- [x] Reaction arrows: $\\rightarrow$, $\\leftarrow$, $\\rightleftharpoons$
- [x] Mathematical expressions for chemistry
- [x] Tables with formulas
- [x] Blockquotes with chemistry principles
- [x] Lists of compounds and reactions
- [x] Inline chemistry: $\\text{H}_2\\text{O}$, $\\text{CO}_2$, $\\text{NH}_3$

**End of Chemistry Test** 🧪⚗️
`;
