import { useExpenses } from '../context/ExpenseContext';
import { calculateSettlement, formatCurrency, getMonthLabel } from '../utils/calculator';
import './Settlement.css';

export default function Settlement() {
  const { members, selectedMonth, setSelectedMonth, getEntriesForMonth } =
    useExpenses();

  const monthEntries = getEntriesForMonth(selectedMonth);
  const result = calculateSettlement(monthEntries, members);

  return (
    <div className="settlement">
      <div className="settlement-header">
        <h2>📊 Tổng kết cuối tháng</h2>
        <div className="month-selector">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            id="settlement-month"
          />
        </div>
      </div>

      <h3 className="section-title">{getMonthLabel(selectedMonth)}</h3>

      {monthEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>Chưa có dữ liệu cho tháng này</p>
        </div>
      ) : (
        <>
          {/* Total overview */}
          <div className="overview-cards">
            <div className="overview-card total-card">
              <div className="card-icon">💰</div>
              <div className="card-info">
                <span className="card-label">Tổng chi tiêu</span>
                <span className="card-value">{formatCurrency(result.totalSpent)}</span>
              </div>
            </div>
            <div className="overview-card avg-card">
              <div className="card-icon">👥</div>
              <div className="card-info">
                <span className="card-label">Số lần đi chợ</span>
                <span className="card-value">{monthEntries.length} lần</span>
              </div>
            </div>
          </div>

          {/* Per person summary */}
          <div className="summary-section">
            <h3 className="section-title">💳 Chi tiết từng người</h3>
            <div className="summary-table">
              <div className="table-header">
                <span>Thành viên</span>
                <span>Đã chi</span>
                <span>Phải chịu</span>
                <span>Chênh lệch</span>
              </div>
              {result.perPersonSummary.map((person, i) => (
                <div key={i} className="table-row">
                  <div className="member-cell">
                    <span className="member-avatar">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                    <span>{person.name}</span>
                  </div>
                  <span className="amount-cell">
                    {formatCurrency(person.spent)}
                  </span>
                  <span className="amount-cell">
                    {formatCurrency(person.shouldPay)}
                  </span>
                  <span
                    className={`diff-cell ${
                      person.diff > 0
                        ? 'positive'
                        : person.diff < 0
                        ? 'negative'
                        : ''
                    }`}
                  >
                    {person.diff > 0 ? '+' : ''}
                    {formatCurrency(person.diff)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer recommendations */}
          <div className="transfers-section">
            <h3 className="section-title">🔄 Cần thanh toán</h3>
            {result.transfers.length === 0 ? (
              <div className="no-transfers">
                <span>✅</span> Mọi người đã chi tiêu bằng nhau, không cần thanh toán!
              </div>
            ) : (
              <div className="transfers-list">
                {result.transfers.map((t, i) => (
                  <div key={i} className="transfer-card" id={`transfer-${i}`}>
                    <div className="transfer-from">
                      <span className="transfer-avatar from">
                        {t.fromName.charAt(0).toUpperCase()}
                      </span>
                      <span className="transfer-name">{t.fromName}</span>
                    </div>
                    <div className="transfer-arrow">
                      <span className="arrow-amount">
                        {formatCurrency(t.amount)}
                      </span>
                      <div className="arrow-line">
                        <div className="arrow-dot"></div>
                        <div className="arrow-bar"></div>
                        <div className="arrow-head">▶</div>
                      </div>
                    </div>
                    <div className="transfer-to">
                      <span className="transfer-avatar to">
                        {t.toName.charAt(0).toUpperCase()}
                      </span>
                      <span className="transfer-name">{t.toName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
