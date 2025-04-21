# 🧾 PRD: AI-Powered Day Trading Bot

**Project Name:** *Tactical Trader*  
**Owner(s):** Jonathan Rodgers (Engineering Lead), Kyler Shields (Business Owner & Strategy)  
**Created:** April 2025  
**Stage:** MVP Development  
**Goal:** To create a robust, risk-aware, AI-augmented day trading bot using Interactive Brokers, built in Python

---

## 🎯 1. Objective

To design, develop, and deploy an automated day trading bot capable of:
- Executing intraday strategies (starting with VWAP-based logic)
- Managing risk based on pre-defined R values
- Logging performance for refinement
- Eventually integrating machine learning to discover and optimize strategies

---

## 🧩 2. Key Features & Scope

| Feature                     | Included in MVP? | Notes |
|-----------------------------|------------------|-------|
| Interactive Brokers (IB) integration | ✅ | Using TWS API via `ib_insync` |
| Historical data pull & VWAP calc     | ✅ | Based on 1-min to 5-min candles |
| Strategy engine (VWAP)               | ✅ | Long/short logic with stop-loss & take-profit |
| Risk management (1R, 3R cap)         | ✅ | Per-trade and per-day risk logic |
| Paper trading execution              | ✅ | Via IB paper account |
| Trade logging & R-multiple tracking  | ✅ | Log rationale, entry, exit, and PnL |
| Web/CLI dashboard                    | ⚠️ Optional | CLI first, expandable later |
| Additional strategies (e.g., ORB)    | ❌ | Planned post-MVP |
| ML-based strategy adaptation         | ❌ | Later phase |

---

## 🧱 3. System Architecture

```
                    +----------------------+
                    |    Trading Client    | ← (CLI/Web dashboard)
                    +----------+-----------+
                               |
                               v
     +-------------------+  View/Control  +---------------------+
     | Performance Logs  |<-------------->|   Monitoring Engine |
     +-------------------+                +---------------------+
                               |
                               v
    +-----------------------------------------------------------+
    |                    Core Bot Engine                        |
    |  +----------------+ +------------------+ +--------------+ |
    |  | Strategy Logic | | Risk Management  | | Trade Logger | |
    |  +----------------+ +------------------+ +--------------+ |
    +-----------------------------------------------------------+
               |                           |
    +----------------+           +--------------------------+
    | Execution Layer|           | Data Ingestion (IB API)  |
    +----------------+           +--------------------------+
```

---

## 🧪 4. MVP Strategy: VWAP Reversion

**Entry Conditions:**
- Long: Price crosses **above** VWAP
- Short: Price crosses **below** VWAP

**Exit Conditions:**
- 2R profit target (2x $100 = $200 gain)
- Stop-loss ($100 loss)
- VWAP reversal (exit on opposite signal)

**Risk Controls:**
- Max risk per trade = $100 (1R)
- Max loss per day = $300 (3R) → stop trading
- Max position size cap (≤ 25% of margin)

---

## 🛠️ 5. Technical Roadmap (Weeks 1–4)

| Week | Focus Area                  | Milestones |
|------|-----------------------------|------------|
| **1** | Setup + Data Access         |<ul><li>Install TWS</li><li>Test IB connection</li><li>Fetch historical data</li><li>Calculate VWAP</li></ul>|
| **2** | Strategy Logic              |<ul><li>Build VWAP strategy class</li><li>Add R-based stop-loss + take-profit</li><li>Log entry/exit signals</li></ul>|
| **3** | Paper Trading Integration   |<ul><li>Place orders via IB API</li><li>Track performance in simulated environment</li><li>Log full trade lifecycle</li></ul>|
| **4** | Monitoring + Expansion Prep |<ul><li>Build CLI or dashboard</li><li>Track R-multiples, equity curve</li><li>Define follow-up strategies</li><li>Outline ML path</li></ul>|

---

## 🧰 6. Tools & Tech Stack

| Layer              | Tech |
|--------------------|------|
| Broker Integration | `ib_insync` + TWS API |
| Language           | Python 3.9+ |
| Strategy Execution | Custom engine (or Backtrader later) |
| Data Processing    | Pandas, Numpy, optional TA-Lib |
| Logging            | Custom CSV logger or SQLite |
| Dashboard (later)  | CLI → Flask or React web UI |

---

## 📋 7. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| API instability | Retry logic, watchdog process |
| Overfitting to backtest data | Use robust out-of-sample tests |
| Execution delays | Use smart limit orders, measure slippage |
| Misconfigured risk logic | Enforce max trade size, daily stop rules |
| Regulatory exposure | Avoid wash trades, log all decisions, restrict markets initially |

---

## 📈 8. Success Metrics

| Metric | Target |
|--------|--------|
| Bot uptime | 95%+ during market hours |
| Paper trade win rate | ≥ 55% |
| Profit factor | ≥ 1.5 |
| Max drawdown | ≤ 3R per day |
| Strategy logic test coverage | 80%+ |

---

## 🚀 9. Stretch Goals (Post-MVP)

- Add breakout & ORB strategies
- Build multi-strategy architecture
- Add sentiment or news-based inputs
- AI model that adjusts strategy parameters dynamically
- Live dashboard with actionable alerts and trade replay
