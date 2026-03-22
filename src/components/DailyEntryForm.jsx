import { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { getToday } from '../utils/calculator';
import './DailyEntryForm.css';

export default function DailyEntryForm() {
  const { members, addEntry } = useExpenses();
  const [date, setDate] = useState(getToday());
  const [buyerIndex, setBuyerIndex] = useState(0);
  const [amount, setAmount] = useState('');
  const [participants, setParticipants] = useState(
    members.map((_, i) => i)
  );
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAmountChange = (e) => {
    // Chỉ giữ lại các chữ số
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setAmount('');
      return;
    }
    // Format dạng 300.000
    const formatted = new Intl.NumberFormat('vi-VN').format(parseInt(rawValue, 10));
    setAmount(formatted);
  };

  const toggleParticipant = (index) => {
    setParticipants((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort()
    );
  };

  const selectAllParticipants = () => {
    setParticipants(members.map((_, i) => i));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Xóa dấu chấm để chuyển về số tính toán
    const numericAmount = parseFloat(amount.replace(/\./g, ''));
    
    if (!numericAmount || numericAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!!');
      return;
    }
    if (participants.length === 0) {
      alert('Vui lòng chọn ít nhất 1 người ăn!');
      return;
    }

    addEntry({
      date,
      buyerIndex: parseInt(buyerIndex),
      amount: numericAmount,
      participants: [...participants],
      note: note.trim(),
    });

    // Reset form
    setAmount('');
    setNote('');
    setParticipants(members.map((_, i) => i));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="daily-entry-form">
      <div className="form-header">
        <h2>📝 Nhập chi tiêu hôm nay</h2>
        <p className="subtitle">Ghi chú mỗi ngày ai đi chợ, bao nhiêu tiền</p>
      </div>

      {showSuccess && (
        <div className="success-toast">
          ✅ Đã lưu thành công!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="entry-date">📅 Ngày</label>
            <input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="entry-buyer">🛒 Người đi chợ</label>
            <select
              id="entry-buyer"
              value={buyerIndex}
              onChange={(e) => setBuyerIndex(parseInt(e.target.value))}
            >
              {members.map((member, i) => (
                <option key={i} value={i}>
                  {member}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="entry-amount">💰 Số tiền (VND)</label>
          <input
            id="entry-amount"
            type="text"
            inputMode="numeric"
            placeholder="Ví dụ: 300.000"
            value={amount}
            onChange={handleAmountChange}
            required
          />
        </div>

        <div className="form-group">
          <label>🍽️ Ai ăn hôm nay?</label>
          <div className="participants-hint">
            <span>Chọn những người ăn trong bữa này</span>
            <button
              type="button"
              className="btn-select-all"
              onClick={selectAllParticipants}
            >
              Chọn tất cả
            </button>
          </div>
          <div className="participants-grid">
            {members.map((member, i) => (
              <label
                key={i}
                className={`participant-chip ${
                  participants.includes(i) ? 'active' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={participants.includes(i)}
                  onChange={() => toggleParticipant(i)}
                />
                <span className="chip-avatar">
                  {member.charAt(0).toUpperCase()}
                </span>
                <span className="chip-name">{member}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="entry-note">📋 Ghi chú (tuỳ chọn)</label>
          <input
            id="entry-note"
            type="text"
            placeholder="Ví dụ: Cá, rau, trái cây..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-submit" id="submit-entry-btn">
          💾 Lưu chi tiêu
        </button>
      </form>
    </div>
  );
}
