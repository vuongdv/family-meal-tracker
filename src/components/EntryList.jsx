import { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/calculator';
import './EntryList.css';

export default function EntryList() {
  const { members, entries, selectedMonth, setSelectedMonth, deleteEntry } =
    useExpenses();
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const { updateEntry } = useExpenses();

  // Get all unique months from entries
  const availableMonths = [
    ...new Set(entries.map((e) => e.date.substring(0, 7))),
  ].sort().reverse();

  if (!availableMonths.includes(selectedMonth)) {
    availableMonths.unshift(selectedMonth);
  }

  const monthEntries = entries
    .filter((e) => e.date.startsWith(selectedMonth))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalMonth = monthEntries.reduce((sum, e) => sum + e.amount, 0);

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditAmount(entry.amount.toString());
    setEditNote(entry.note || '');
  };

  const saveEdit = (id) => {
    updateEntry(id, {
      amount: parseFloat(editAmount),
      note: editNote.trim(),
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa mục này?')) {
      deleteEntry(id);
    }
  };

  return (
    <div className="entry-list">
      <div className="list-header">
        <h2>📋 Lịch sử chi tiêu</h2>
        <div className="month-selector">
          <label htmlFor="month-select">Tháng:</label>
          <input
            id="month-select"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="month-summary-bar">
        <span>Tổng tháng này:</span>
        <span className="total-amount">{formatCurrency(totalMonth)}</span>
        <span className="entry-count">{monthEntries.length} mục</span>
      </div>

      {monthEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>Chưa có chi tiêu nào trong tháng này</p>
          <p className="empty-hint">Chuyển sang tab "Nhập liệu" để bắt đầu ghi chú</p>
        </div>
      ) : (
        <div className="entries-container">
          {monthEntries.map((entry) => (
            <div key={entry.id} className="entry-card" id={`entry-${entry.id}`}>
              <div className="entry-date-badge">
                {formatDate(entry.date)}
              </div>
              <div className="entry-content">
                <div className="entry-main">
                  <div className="entry-buyer">
                    <span className="buyer-avatar">
                      {members[entry.buyerIndex]?.charAt(0).toUpperCase()}
                    </span>
                    <span className="buyer-name">
                      {members[entry.buyerIndex]} đi chợ
                    </span>
                  </div>

                  {editingId === entry.id ? (
                    <div className="edit-form">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="edit-input"
                      />
                      <input
                        type="text"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="edit-input"
                        placeholder="Ghi chú..."
                      />
                      <div className="edit-actions">
                        <button onClick={() => saveEdit(entry.id)} className="btn-save">
                          ✅ Lưu
                        </button>
                        <button onClick={cancelEdit} className="btn-cancel">
                          ❌ Huỷ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="entry-amount">
                        {formatCurrency(entry.amount)}
                      </div>
                      {entry.note && (
                        <div className="entry-note">💬 {entry.note}</div>
                      )}
                    </>
                  )}
                </div>

                <div className="entry-participants">
                  <span className="participants-label">Người ăn:</span>
                  <div className="participants-tags">
                    {entry.participants.map((pIdx) => (
                      <span key={pIdx} className="participant-tag">
                        {members[pIdx]}
                      </span>
                    ))}
                  </div>
                </div>

                {editingId !== entry.id && (
                  <div className="entry-actions">
                    <button
                      onClick={() => startEdit(entry)}
                      className="btn-edit"
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="btn-delete"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
