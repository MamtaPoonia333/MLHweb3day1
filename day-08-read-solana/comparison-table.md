# Solana Accounts vs Traditional Database — Comparison Table

| Concept | Traditional Database | Solana Accounts |
|---|---|---|
| Data location | Rows in tables on a centralized server | Accounts on a distributed ledger across validators |
| Schema | Defined by the database (SQL DDL, document schema) | Defined by the owning program; stored as raw bytes in the account’s data field |
| Access control | Application-level auth (SQL roles, app middleware) | Enforced by the runtime: only the owning program can modify an account, and only with the required signer(s) |
| Cost of storage | Server/cloud hosting fees, pay for disk space | Rent-exempt deposit proportional to data size (query via `solana rent`); refundable when the account is closed |
| Identity/keys | Auto-increment IDs, UUIDs | 32-byte public keys or Program Derived Addresses (PDAs) |
| Reads | SQL queries, document lookups | RPC calls (`getAccountInfo`, `getProgramAccounts`) |
| Writes | `INSERT`/`UPDATE` via application code | Transactions with instructions, signed by authorized keys |
| Code vs data | Application code and database are separate systems | Both are accounts; programs (code) and data accounts coexist in the same model |
| Deletion | `DELETE` query removes the row | Close the account; lamports are returned to the close authority |
| Visibility | Private by default; you choose what to expose | Public by default; anyone can read any account’s data |

## Notes
- There is no server-side JOIN on-chain; programs receive accounts as inputs to instructions.
- Storage cost is explicit and paid up-front in lamports; use `solana rent <bytes>` to estimate.
- To inspect accounts locally: `solana account <address>` and `solana rent <bytes>`.

---

Save this file and take a screenshot showing `solana account $(solana address)` output alongside this table for your #100DaysOfSolana post.
