import { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import './MemberManager.css';

export default function MemberManager() {
  const { members, updateMember, addMember, removeMember } = useExpenses();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditName(members[index]);
    setError('');
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      setError('Tên không được để trống');
      return;
    }
    updateMember(editingIndex, editName.trim());
    setEditingIndex(null);
    setError('');
  };

  const handleAdd = () => {
    if (!newName.trim()) {
      setError('Vui lòng nhập tên');
      return;
    }
    addMember(newName.trim());
    setNewName('');
    setError('');
  };

  const handleRemove = (index) => {
    const success = removeMember(index);
    if (!success) {
      setError(`Không thể xóa "${members[index]}" vì đã có dữ liệu chi tiêu liên quan`);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="member-manager">
      <div className="manager-header">
        <h2>👥 Quản lý thành viên</h2>
        <p className="subtitle">Thêm, sửa hoặc xóa thành viên trong gia đình</p>
      </div>

      {error && <div className="error-toast">{error}</div>}

      <div className="members-list">
        {members.map((member, i) => (
          <div key={i} className="member-item" id={`member-${i}`}>
            <div className="member-info">
              <span className="member-avatar-lg">
                {member.charAt(0).toUpperCase()}
              </span>
              {editingIndex === i ? (
                <input
                  type="text"
                  className="edit-name-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  autoFocus
                />
              ) : (
                <span className="member-name-text">{member}</span>
              )}
            </div>
            <div className="member-actions">
              {editingIndex === i ? (
                <>
                  <button onClick={saveEdit} className="btn-action save">
                    ✅
                  </button>
                  <button
                    onClick={() => {
                      setEditingIndex(null);
                      setError('');
                    }}
                    className="btn-action cancel"
                  >
                    ❌
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(i)} className="btn-action edit">
                    ✏️
                  </button>
                  <button
                    onClick={() => handleRemove(i)}
                    className="btn-action remove"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="add-member-section">
        <h3>➕ Thêm thành viên mới</h3>
        <div className="add-member-form">
          <input
            type="text"
            placeholder="Nhập tên thành viên..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            id="new-member-input"
          />
          <button onClick={handleAdd} className="btn-add" id="add-member-btn">
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
