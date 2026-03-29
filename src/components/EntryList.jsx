import { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/calculator';
import './EntryList.css';

export default function EntryList() {
  const { members, entries, selectedMonth, setSelectedMonth, deleteEntry } =
    useExpenses();
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editBuyerIndex, setEditBuyerIndex] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editParticipants, setEditParticipants] = useState([]);
  const [editNote, setEditNote] = useState('');
  const { updateEntry } = useExpenses();

  // Filter & sort state
  const [filterBuyer, setFilterBuyer] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Get all unique months from entries
  const availableMonths = [
    ...new Set(entries.map((e) => e.date.substring(0, 7))),
  ].sort().reverse();

  if (!availableMonths.includes(selectedMonth)) {
    availableMonths.unshift(selectedMonth);
  }

  const monthEntries = entries.filter((e) => e.date.startsWith(selectedMonth));
  const totalMonth = monthEntries.reduce((sum, e) => sum + e.amount, 0);

  const filteredEntries = monthEntries
    .filter((e) => filterBuyer === 'all' || e.buyerIndex === parseInt(filterBuyer))
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':   return a.date.localeCompare(b.date);
        case 'date-desc':  return b.date.localeCompare(a.date);
        case 'amount-asc': return a.amount - b.amount;
        case 'amount-desc':return b.amount - a.amount;
        default:           return b.date.localeCompare(a.date);
      }
    });

  const filteredTotal = filteredEntries.reduce((sum, e) => sum + e.amount, 0);

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditDate(entry.date);
    setEditBuyerIndex(entry.buyerIndex);
    setEditAmount(entry.amount.toString());
    setEditParticipants([...entry.participants]);
    setEditNote(entry.note || '');
  };

  const toggleEditParticipant = (index) => {
    setEditParticipants((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort()
    );
  };

  const saveEdit = (id) => {
    if (editBuyerIndex === '') {
      alert('Vui lòng chọn người đi chợ!');
      return;
    }
    if (editParticipants.length === 0) {
      alert('Vui lòng chọn ít nhất 1 người ăn!');
      return;
    }
    updateEntry(id, {
      date: editDate,
      buyerIndex: parseInt(editBuyerIndex),
      amount: parseFloat(editAmount),
      participants: editParticipants,
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
        <span>Tổng{filterBuyer !== 'all' ? ' (đã lọc)' : ' tháng này'}:</span>
        <span className="total-amount">{formatCurrency(filterBuyer !== 'all' ? filteredTotal : totalMonth)}</span>
        <span className="entry-count">{filteredEntries.length}/{monthEntries.length} mục</span>
      </div>

      <div className="filter-sort-bar">
        <div className="filter-group">
          <span className="filter-icon">🛒</span>
          <select
            id="filter-buyer"
            value={filterBuyer}
            onChange={(e) => setFilterBuyer(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả người đi chợ</option>
            {members.map((member, i) => (
              <option key={i} value={i}>{member}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-icon">↕️</span>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date-desc">Ngày (mới nhất)</option>
            <option value="date-asc">Ngày (cũ nhất)</option>
            <option value="amount-desc">Số tiền (cao nhất)</option>
            <option value="amount-asc">Số tiền (thấp nhất)</option>
          </select>
        </div>

        {filterBuyer !== 'all' && (
          <button className="btn-clear-filter" onClick={() => setFilterBuyer('all')}>
            ✕ Xoá lọc
          </button>
        )}
      </div>

      {monthEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>Chưa có chi tiêu nào trong tháng này</p>
          <p className="empty-hint">Chuyển sang tab "Nhập liệu" để bắt đầu ghi chú</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>Không có kết quả phù hợp</p>
          <p className="empty-hint">Thử thay đổi bộ lọc để xem thêm</p>
        </div>
      ) : (
        <div className="entries-container">
          {filteredEntries.map((entry) => (
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
                      <div className="edit-field">
                        <label className="edit-label">📅 Ngày</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="edit-input"
                        />
                      </div>
                      <div className="edit-field">
                        <label className="edit-label">🛒 Người đi chợ</label>
                        <select
                          value={editBuyerIndex}
                          onChange={(e) => setEditBuyerIndex(e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="edit-input edit-select"
                        >
                          <option value="">-- Chọn người đi chợ --</option>
                          {members.map((member, i) => (
                            <option key={i} value={i}>{member}</option>
                          ))}
                        </select>
                      </div>
                      <div className="edit-field">
                        <label className="edit-label">💰 Số tiền (VND)</label>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="edit-input"
                        />
                      </div>
                      <div className="edit-field">
                        <label className="edit-label">🍽️ Người ăn</label>
                        <div className="edit-participants-grid">
                          {members.map((member, i) => (
                            <label
                              key={i}
                              className={`participant-chip ${
                                editParticipants.includes(i) ? 'active' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={editParticipants.includes(i)}
                                onChange={() => toggleEditParticipant(i)}
                              />
                              <span className="chip-avatar">
                                {member.charAt(0).toUpperCase()}
                              </span>
                              <span className="chip-name">{member}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="edit-field">
                        <label className="edit-label">📋 Ghi chú</label>
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="edit-input"
                          placeholder="Ghi chú..."
                        />
                      </div>
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

                {editingId !== entry.id && (
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
                )}

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
