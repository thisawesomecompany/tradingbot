# 🧾 PRD: AI-Powered Day Trading Bot

**Project Name:** *Tactical Trader*  
**Owner(s):** Jonathan Rodgers (Engineering Lead), Kyler Shields (Business Owner & Strategy)  
**Created:** April 2025  
**Stage:** MVP Development  
**Goal:** To create a robust, risk-aware, AI-augmented day trading bot using Interactive Brokers, built with a React client and Node.js backend, both in TypeScript

---

## 🎯 1. Objective

To design, develop, and deploy an automated day trading bot capable of:
- Executing intraday strategies (starting with VWAP-based logic)
- Managing risk based on pre-defined R values and strict Rules of Engagement
- Logging performance for refinement and transparency
- Providing a modern web interface (React client) and robust backend (Node.js), all in TypeScript
- Eventually integrating machine learning to discover and optimize strategies

---

## 🧩 2. Key Features & Scope

| Feature                     | Included in MVP? | Notes |
|-----------------------------|------------------|-------|
| Interactive Brokers (IB) integration | ✅ | Using TWS API via Node.js |
| Historical data pull & VWAP calc     | ✅ | 1-min candles only |
| VWAP strategy (long only)            | ✅ | Entry: cross above VWAP; Exit: 2R or cross below VWAP |
| Risk management (1R, 3R cap, 4x margin) | ✅ | Per-trade and per-day risk logic, margin-aware sizing |
| Rules of Engagement                 | ✅ | E.g., avoid low-float stocks, max position size, etc. |
| Paper trading execution              | ✅ | IB paper account |
| Trade logging & analytics            | ✅ | Entry, exit, stop-loss, R, position size, volume, etc. |
| CLI dashboard                        | ✅ | CLI first, web (React) later |
| Web dashboard (React)                | ✅ | Modern UI for monitoring and control |
| Node.js backend API                  | ✅ | Serves data to React client, implements trading logic |
| Additional strategies (e.g., ORB)    | ❌ | Post-MVP |
| ML-based strategy adaptation         | ❌ | Later phase |

---

## 🧱 3. System Architecture

```
+-------------------+
|   React Client    |  ← (Web dashboard)
+---------+---------+
          |
          v
+-------------------+
|   Node.js Backend |  ← (REST/WebSocket API, trading logic)
+---------+---------+
          |
          v
+-------------------+
| Interactive       |
| Brokers (TWS API) |
+-------------------+
```

- **React Client:** Modern web UI for monitoring, control, and analytics (TypeScript).
- **Node.js Backend:** API layer, user/session management, trading logic, IB integration (TypeScript).

---

## 🧪 4. MVP Strategy: VWAP Reversion (Long Only)

- **Entry:** Price crosses above VWAP (1-min chart).
- **Stop-loss:** 1R (e.g., $100 loss).
- **Take-profit:** 2R (e.g., $200 gain) or exit if price falls below VWAP.
- **Position Sizing:** Use 4x margin, max 25% of margin per trade.
- **Order Types:** Limit order for entry, market order for exit (upgrade to smart limit orders later).
- **Rules of Engagement:** Only trade high-volume stocks, avoid low-float/volatile stocks, follow max daily loss, etc.

---

## 🛠️ 5. Technical Roadmap (Weeks 1–4)

| Week | Focus Area                  | Milestones |
|------|-----------------------------|------------|
| **1** | Setup + Data Access         | Install TWS, test IB connection, fetch historical data, calculate VWAP |
| **2** | Strategy Logic              | Build VWAP strategy class, add R-based stop-loss/take-profit, log entry/exit signals, codify Rules of Engagement |
| **3** | Paper Trading Integration   | Place orders via IB API, track performance, log full trade lifecycle |
| **4** | Monitoring + Analytics      | Build CLI dashboard, build Node.js backend and React client, track R-multiples/equity curve, review and refine rules, prep for expansion |

---

## 🧰 6. Tools & Tech Stack

| Layer              | Tech |
|--------------------|------|
| Frontend           | React (TypeScript) |
| Backend/API        | Node.js (TypeScript, Express, REST/WebSocket) |
| Broker Integration | TWS API |
| Data Processing    | JavaScript/TypeScript (math, analytics libraries as needed) |
| Logging            | Custom CSV logger or SQLite |
| Dashboard          | React web UI (MVP: CLI, then web) |

---

## 📋 7. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| API instability | Retry logic, watchdog process |
| Overfitting to backtest data | Use robust out-of-sample tests |
| Execution delays | Use smart limit orders, measure slippage |
| Misconfigured risk logic or margin | Enforce max trade size, daily stop rules, margin checks |
| Rules of Engagement not followed | Codify and automate checks |
| Integration issues with IB API | Use robust libraries, clear API contracts |
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

---

## 📚 10. Resources & Learning

- [How to Day Trade for a Living](https://www.amazon.com/How-Day-Trade-Living-Management/dp/1535585951/ref=tmm_pap_swatch_0)
- [Kyler's Stock Trading Overview](https://docs.google.com/presentation/d/1CNfIROdwVoDI9aRyf9ikPpXbhLfuJ_Vfew6QY5UCkWA/edit?slide=id.p#slide=id.p)
- [Technical Indicators & Strategies for Bot](https://docs.google.com/document/d/1yA1pgaS7wR_F7Pljqek4IezYKwwV2KnLq5g4b93OAjc/edit?usp=sharing)
- Investopedia, TradingView, Yahoo Finance
