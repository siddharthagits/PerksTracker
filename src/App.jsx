import PropTypes from 'prop-types';
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import {
  PlusCircle,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  Moon,
  Sun,
  X,
  Sparkles,
} from 'lucide-react';

const FinanceContext = createContext();
const STORAGE_KEY = 'finance-dashboard-transactions';
const defaultTransactions = [
  { id: 1712500000000, text: 'Freelance Project', amount: 1200 },
  { id: 1712586400000, text: 'Grocery Store', amount: -95 },
  { id: 1712672800000, text: 'Monthly Rent', amount: -520 },
  { id: 1712759200000, text: 'Coffee Shop', amount: -14.5 },
];

const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultTransactions;
    } catch {
      return defaultTransactions;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // Local storage may be unavailable in private mode.
    }
  }, [transactions]);

  const addTransaction = (text, amount) => {
    const parsed = Number(amount);
    if (!text || Number.isNaN(parsed) || parsed === 0) return;

    const newTransaction = {
      id: Date.now(),
      text: text.trim(),
      amount: parsed,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const removeTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const resetBalance = () => {
    setTransactions([]);
  };

  const balance = useMemo(
    () => transactions.reduce((acc, item) => acc + item.amount, 0),
    [transactions],
  );

  const income = useMemo(
    () => transactions.filter((item) => item.amount > 0).reduce((acc, item) => acc + item.amount, 0),
    [transactions],
  );

  const expenses = useMemo(
    () => transactions.filter((item) => item.amount < 0).reduce((acc, item) => acc + item.amount, 0),
    [transactions],
  );

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        balance,
        income,
        expenses,
        addTransaction,
        removeTransaction,
        resetBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

FinanceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useCryptoPrice = (cryptoId) => {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!cryptoId) return;
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=inr&include_24hr_change=true`,
    )
      .then((res) => res.json())
      .then((data) => {
        const crypto = data?.[cryptoId];
        if (!crypto) throw new Error('Invalid response');
        setPrice(crypto.inr);
        setChange(crypto.inr_24h_change);
        setStatus('ready');
      })
      .catch(() => {
        setPrice(null);
        setChange(null);
        setStatus('error');
      });
  }, [cryptoId]);

  return { price, change, status };
};

const currency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);

const indexFormat = (value) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);

const CRYPTO_OPTIONS = [
  { id: 'bitcoin', label: 'Bitcoin' },
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'ripple', label: 'Ripple' },
  { id: 'cardano', label: 'Cardano' },
  { id: 'dogecoin', label: 'Dogecoin' },
];

const INDIAN_INDEXES = [
  { id: 'nifty-50', label: 'Nifty 50', value: 23150, change: 0.45 },
  { id: 'bse-sensex', label: 'BSE Sensex', value: 78320, change: -0.22 },
];

const Dashboard = () => {
  const { balance, income, expenses, transactions, addTransaction, removeTransaction, resetBalance } = useContext(FinanceContext);
  const { price: btcPrice, change: btcChange, status: btcStatus } = useCryptoPrice('bitcoin');
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCrypto, setSelectedCrypto] = useState('ethereum');
  const { price: selectedPrice, change: selectedChange, status: selectedStatus } = useCryptoPrice(selectedCrypto);
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem('finance-dashboard-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('finance-dashboard-theme', theme);
    } catch {
      // ignore
    }
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const filteredTransactions = useMemo(() => {
    if (filter === 'income') return transactions.filter((item) => item.amount > 0);
    if (filter === 'expenses') return transactions.filter((item) => item.amount < 0);
    return transactions;
  }, [filter, transactions]);

  const handleAdd = (e) => {
    e.preventDefault();
    addTransaction(text, amount);
    setText('');
    setAmount('');
  };

  const expenseRatio = income > 0 ? Math.min(100, Math.round((Math.abs(expenses) / income) * 100)) : 0;

  return (
    <div className={`relative overflow-hidden min-h-screen p-4 md:p-10 font-sans ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
      <div className="live-wallpaper" />
      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <header className={`flex flex-col gap-4 rounded-[2rem] border p-6 shadow-2xl md:flex-row md:items-center md:justify-between ${
          theme === 'dark'
            ? 'border-slate-800 bg-slate-900/90 shadow-slate-950/30'
            : 'border-slate-200 bg-white/90 shadow-slate-900/10'
       }`}>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Finance dashboard</p>
            <h1 className={`mt-3 text-3xl font-bold tracking-tight md:text-4xl ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
              PerksTracker — fast, polished money tracking.
            </h1>
            <p className={`mt-3 max-w-2xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Track every income and expense, keep history in browser storage, and see live Bitcoin price updates.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl bg-slate-950/80 px-5 py-4 text-center shadow-xl shadow-blue-500/10 md:text-right">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-950 hover:bg-slate-200'
                }`}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
            <span className="text-xs uppercase tracking-[0.35em] text-slate-500">Live BTC</span>
            <p className="text-3xl font-semibold text-amber-300">
              {btcStatus === 'loading' ? 'Loading...' : btcPrice ? currency(btcPrice) : 'Unavailable'}
            </p>
            <span className={`text-sm ${btcChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {btcChange === null ? 'No data' : `${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}%`} last 24h
            </span>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
          <div className={`rounded-[2rem] border bg-slate-900/95 p-8 shadow-2xl ${theme === 'dark' ? 'border-slate-800 shadow-slate-950/30' : 'border-slate-200 bg-white/95 shadow-slate-900/10'}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Total balance</p>
                <h2 className="mt-3 text-5xl font-semibold text-white">{currency(balance)}</h2>
              </div>
              <div className={`rounded-3xl bg-slate-950/80 p-4 text-slate-200 ring-1 ${theme === 'dark' ? 'ring-slate-800' : 'bg-slate-100 text-slate-900 ring-slate-200'}`}>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Net cashflow</p>
                    <p className="mt-2 text-2xl font-semibold">{currency(income + expenses)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetBalance}
                    className="inline-flex w-full items-center justify-center rounded-3xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                  >
                    Reset balance
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Income</p>
                <p className="mt-3 text-2xl font-semibold text-emerald-300">{currency(income)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Expenses</p>
                <p className="mt-3 text-2xl font-semibold text-rose-300">{currency(expenses)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Transactions</p>
                <p className="mt-3 text-2xl font-semibold text-slate-100">{transactions.length}</p>
              </div>
            </div>

            <div className="mt-10 overflow-hidden rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-800">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Spending ratio</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{expenseRatio}% of income</h3>
                </div>
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-sky-500"
                  style={{ width: `${expenseRatio}%` }}
                />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center gap-3 text-slate-300">
                <PlusCircle size={20} />
                <div>
                  <h2 className="font-semibold text-white">Quick add transaction</h2>
                  <p className="text-sm text-slate-500">Enter income or expense amounts.</p>
                </div>
              </div>
              <form onSubmit={handleAdd} className="mt-6 space-y-4">
                <input
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="What's your transaction name?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <input
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  type="number"
                  placeholder="How much was it? (use - for expense)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button className="inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
                  Add to transactions
                </button>
              </form>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center gap-3 text-slate-300">
                <Sparkles size={20} />
                <div>
                  <h2 className="font-semibold text-white">Bitcoin snapshot</h2>
                  <p className="text-sm text-slate-500">Price updates every time page loads.</p>
                </div>
              </div>
              <div className="mt-6 rounded-3xl bg-slate-950/80 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Current BTC</p>
                <p className="mt-3 text-3xl font-semibold text-amber-300">{btcStatus === 'loading' ? 'Loading...' : btcPrice ? currency(btcPrice) : 'Unavailable'}</p>
                <p className={`mt-3 text-sm ${btcChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {btcChange === null ? 'Price not available' : `${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}%`} 24h
                </p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-white">Crypto market watch</h2>
                  <p className="text-sm text-slate-500">Select a popular crypto to view INR pricing.</p>
                </div>
                <select
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {CRYPTO_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id} className="bg-slate-950 text-slate-100">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 rounded-3xl bg-slate-950/80 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Selected crypto</p>
                <p className="mt-3 text-3xl font-semibold text-amber-300">
                  {selectedStatus === 'loading' ? 'Loading...' : selectedPrice ? currency(selectedPrice) : 'Unavailable'}
                </p>
                <p className={`mt-3 text-sm ${selectedChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedChange === null ? 'Price not available' : `${selectedChange >= 0 ? '+' : ''}${selectedChange.toFixed(2)}%`} 24h
                </p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/20">
              <div className="mb-4">
                <h2 className="font-semibold text-white">Indian markets</h2>
                <p className="text-sm text-slate-500">Track Nifty 50 and BSE Sensex performance.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {INDIAN_INDEXES.map((index) => (
                  <div key={index.id} className="rounded-3xl bg-slate-950/80 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{index.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-100">{indexFormat(index.value)}</p>
                    <p className={`mt-3 text-sm ${index.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}% 24h
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Performance overview</h2>
                <p className="text-sm text-slate-500">Keep an eye on your monthly cashflow and spending habits.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 px-3 py-2 text-xs uppercase tracking-[0.35em] text-slate-400">
                Live data
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Income</p>
                <p className="mt-3 text-lg font-semibold text-emerald-300">{currency(income)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Expenses</p>
                <p className="mt-3 text-lg font-semibold text-rose-300">{currency(expenses)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Net balance</p>
                <p className="mt-3 text-lg font-semibold text-slate-100">{currency(balance)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/20">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-slate-300">
                <History size={20} />
                <h2 className="text-lg font-semibold text-white">Recent activity</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['all', 'income', 'expenses'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                      filter === option
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950/80 text-slate-400 hover:bg-slate-900/80 hover:text-white'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <p className="rounded-3xl bg-slate-950/80 p-6 text-sm text-slate-500">
                  You have no transactions yet. Add entries to track cashflow in real time.
                </p>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.amount > 0 ? (
                        <ArrowUpCircle className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <ArrowDownCircle className="h-6 w-6 text-rose-400" />
                      )}
                      <div>
                        <p className="font-semibold text-white">{transaction.text}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(transaction.id).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${transaction.amount > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {transaction.amount > 0 ? '+' : ''}
                        {currency(transaction.amount)}
                      </span>
                      <button
                        onClick={() => removeTransaction(transaction.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-slate-400 transition hover:bg-rose-500 hover:text-white"
                        aria-label={`Remove ${transaction.text}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <Dashboard />
    </FinanceProvider>
  );
}
