# SmartPark — Flowchart & Claude Prompt

## Project summary

This repository implements a simple client-side parking management app (`index.html`, `smartpark.js`, `styles.css`). Key behavior:
- In-memory car park represented by `carPark` (array of length `MAX_SLOTS`, null for empty slots).
- Users enter a number plate via the UI and click "Assign Parking Slot".
- `enterCar(plate)` validates the plate, checks duplicates, then assigns the first available slot and records `timeIn`.
- `removeCar(plate)` finds the car, computes billing via `calculateBill(timeIn, timeOut)` (first hour 300 RWF, extra hours 500 RWF each, hours rounded up), removes the car, and returns a receipt object.
- UI functions: `renderTable()` (lists parked cars), `updateStats()` (occupied/free), `showToken()` and `showReceipt()`.
- Periodic refresh: `renderTable()` runs every 30s.

## Actors

- User (operator at the parking gate / customer)
- Browser UI (forms, tables, modals)
- Frontend logic (`smartpark.js`) — validation, state mutations, billing
- In-memory data store (`carPark` array)

## Data structures & important constants

- MAX_SLOTS = 50
- carPark: Array(50). Values: null or { plate, slot, timeIn }
- occupiedCount: integer
- RATE_NORMAL = 300 (first hour)
- RATE_EXTRA = 500 (each additional hour)

## Key flows to include in the diagram

1. User opens page -> UI initialises via `createCarPark()` -> `renderTable()` & `updateStats()` show empty state.
2. Enter car flow:
   - User submits plate -> UI calls `enterCar(plate)`
   - Validation: non-empty
   - Check isFull() -> reject if full
   - Duplicate check -> reject if plate already parked
   - Find first empty slot -> set carPark[i] and increment occupiedCount
   - Return success with slot -> UI shows token and updates table/stats
3. Exit & Pay flow:
   - User clicks Exit & Pay -> UI calls `removeCar(plate)`
   - Find matching slot -> compute `calculateBill(timeIn, timeOut)`
     - totalMins = floor(ms / 60000)
     - totalHours = ceil(totalMins / 60)
     - amount = RATE_NORMAL if totalHours<=1 else RATE_NORMAL + (totalHours-1)*RATE_EXTRA
   - Remove car from carPark, decrement occupiedCount
   - UI shows receipt modal with breakdown
4. Table rendering & periodic refresh (every 30s)

## Prompt for Claude (copy-paste)

Please act as a technical diagram generator. I will paste a short description of a small web app. Produce two outputs:

1) A concise Mermaid flowchart that models the system end-to-end (actors, decision nodes, data store, and the main flows: Enter Car, Assign Slot, Show Token, Exit & Pay, Calculate Bill, Update UI). Use Mermaid's flowchart syntax and ensure the diagram is grouped into swimlanes or subgraphs for clarity (User, Browser/UI, Frontend Logic, Data Store). Keep node labels short but precise. Include decision diamonds for validation, full/duplicate checks, and billing branching (first hour vs extra hours). The output must be only a single fenced code block with the mermaid diagram (no extra explanation).

2) A short bullet list (3-6 bullets) explaining the main nodes in the diagram and any assumptions you made when creating the diagram.

Here is the system description to model (use it directly):

- MAX_SLOTS = 50
- carPark: Array(50) storing null or { plate, slot, timeIn }
- enterCar(plate): validate plate non-empty -> if full reject -> if duplicate reject -> assign first empty slot -> set timeIn = now -> occupiedCount++ -> return { ok:true, slot }
- removeCar(plate): find car by plate -> timeOut = now -> bill = calculateBill(timeIn, timeOut) -> carPark[slot-1] = null -> occupiedCount-- -> return receipt object { car, timeOut, totalMins, totalHours, amount }
- calculateBill: totalMins = floor(ms/60000); totalHours = ceil(totalMins/60); amount = 300 if totalHours<=1 else 300 + (totalHours-1)*500
- UI: showToken(car) and showReceipt(receipt); renderTable(); updateStats(); periodic renderTable every 30s

Constraints and desired style for Claude:
- Output must be in Mermaid flowchart format inside one fenced code block (```mermaid ... ```). Do not include additional chatter before or after the code block.
- Use swimlanes (subgraph) or clear lane-like grouping: User, UI, Logic, Data Store.
- Use decision nodes for validation, full-check, duplicate-check, and billing branch.
- Keep the diagram to a single page (avoid extremely wide graphs); if needed collapse repetitive nodes with loops (e.g., assign-first-empty-slot loop).
- After the code block, include a short bullet list describing main nodes and any assumptions (no more than 6 bullets).

---

## Local Mermaid diagram (quick reference)

```mermaid
flowchart TD
  subgraph User[User]
    U1[[Enter plate]]
  end

  subgraph UI[Browser UI]
    F1([Submit form])
    F2([Show token / receipt])
    F3([Render table & stats])
  end

  subgraph Logic[Frontend logic (smartpark.js)]
    C1{Valid?}
    C2{Full?}
    C3{Duplicate?}
    A1[/Assign first empty slot/]
    R1[/Remove car & calculate bill/]
    B1{Hours <= 1?}
  end

  subgraph Store[Data store: carPark]
    S1[(carPark array)]
  end

  U1 --> F1 --> C1
  C1 -- No --> F2
  C1 -- Yes --> C2
  C2 -- Yes --> F2
  C2 -- No --> C3
  C3 -- Yes --> F2
  C3 -- No --> A1 --> S1
  A1 --> F2
  F2 --> F3

  %% Exit flow
  F3 --> R1
  R1 --> B1
  B1 -- Yes --> F2
  B1 -- No --> F2
  R1 --> S1

  style User fill:#fefcbf,stroke:#f59e0b
  style UI fill:#ebf4ff,stroke:#2b6cb0
  style Logic fill:#fff7ed,stroke:#ed8936
  style Store fill:#f0fdf4,stroke:#38a169
```


---

## Next steps
- Paste the Claude prompt section into Claude to generate alternative diagram formats (PlantUML, SVG) or more detailed variants.
- If you want, I can also add a standalone `.mmd` file or render the Mermaid diagram to PNG/SVG locally.
