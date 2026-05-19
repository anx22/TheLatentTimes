# LANGUAGE.md

## Architectural Vocabulary

### Module
Anything with an interface and an implementation. Scale-agnostic (function, class, package).

### Interface
Everything a caller must know: types, invariants, error modes, ordering, config. Not just the type signature.

### Implementation
The code inside a module.

### Depth
Leverage at the interface. High leverage = a lot of behavior behind a small interface.

### Seam
Where an interface lives; a place behavior can be altered without editing in place.

### Adapter
A concrete thing satisfying an interface at a seam.

### Leverage
What callers get from depth.

### Locality
What maintainers get from depth (concentrated knowledge).

## Core Principles
*   **Deletion Test**: If the module is deleted, does complexity concentrate or disperse?
*   **The interface is the test surface.**
*   **One adapter = hypothetical seam. Two adapters = real seam.**
