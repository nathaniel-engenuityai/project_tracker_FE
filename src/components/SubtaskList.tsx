import { useState, useRef } from 'react';
import type { Subtask } from '../api/projects';
import { createSubtask, updateSubtask, deleteSubtask, reorderSubtasks } from '../api/projects';
import { formatTimer, formatMinutes, toMinutes } from '../utils/time';

interface Props {
  projectId: string;
  subtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
  activeSubtaskId: string | null;
  subtaskElapsed: Record<string, number>;
  onTimerStart: (subtaskId: string) => void;
  onTimerStop: () => void;
}

const SubtaskList = ({
  projectId,
  subtasks,
  onSubtasksChange,
  activeSubtaskId,
  subtaskElapsed,
  onTimerStart,
  onTimerStop,
}: Props) => {
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newUnit, setNewUnit] = useState<'hours' | 'minutes'>('minutes');
  const [adding, setAdding] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTime) return;
    const estimatedMinutes = toMinutes(Number(newTime), newUnit);
    const res = await createSubtask(projectId, { name: newName, estimatedMinutes });
    onSubtasksChange([...subtasks, res.data]);
    setNewName('');
    setNewTime('');
    setAdding(false);
  };

  const handleUpdate = async (subtaskId: string, data: Partial<Subtask>) => {
    const res = await updateSubtask(projectId, subtaskId, data);
    onSubtasksChange(subtasks.map((s) => (s._id === subtaskId ? res.data : s)));
  };

  const handleDelete = async (subtaskId: string) => {
    await deleteSubtask(projectId, subtaskId);
    onSubtasksChange(subtasks.filter((s) => s._id !== subtaskId));
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOver.current = index;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const reordered = [...subtasks];
    const dragged = reordered.splice(dragItem.current, 1)[0];
    reordered.splice(dragOver.current, 0, dragged);
    dragItem.current = null;
    dragOver.current = null;
    onSubtasksChange(reordered);
    await reorderSubtasks(projectId, reordered.map((s) => s._id));
  };

  return (
    <div style={{ marginTop: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
      {subtasks.map((subtask, index) => {
        const isRunning = activeSubtaskId === subtask._id;
        const elapsed = subtaskElapsed[subtask._id] || 0;
        const percentage = Math.min(Math.round((subtask.loggedMinutes / subtask.estimatedMinutes) * 100), 100);

        return (
          <div
            key={subtask._id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            style={subtaskRow}
          >
            {/* Drag handle */}
            <span style={dragHandle} title="Drag to reorder">⠿</span>

            {/* Checkbox */}
            <input
              type="checkbox"
              checked={subtask.status === 'completed'}
              onChange={(e) =>
                handleUpdate(subtask._id, {
                  status: e.target.checked ? 'completed' : 'in progress',
                })
              }
              style={{ cursor: 'pointer' }}
            />

            {/* Name + progress */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                fontSize: '13px',
                textDecoration: subtask.status === 'completed' ? 'line-through' : 'none',
                color: subtask.status === 'completed' ? '#999' : '#333',
              }}>
                {subtask.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <div style={{ flex: 1, background: '#e0e0e0', borderRadius: '999px', height: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentage}%`,
                    background: percentage >= 100 ? '#e74c3c' : '#4f46e5',
                    height: '100%',
                    borderRadius: '999px',
                  }} />
                </div>
                <span style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap' }}>
                  {formatMinutes(subtask.loggedMinutes)}/{formatMinutes(subtask.estimatedMinutes)}
                </span>
              </div>
            </div>

            {/* Timer */}
            {isRunning ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#4f46e5', fontWeight: 600 }}>
                  {formatTimer(elapsed)}
                </span>
                <button onClick={onTimerStop} style={miniStopBtn}>⏹</button>
              </div>
            ) : (
              <button onClick={() => onTimerStart(subtask._id)} style={miniStartBtn}>▶</button>
            )}

            {/* Delete */}
            <button onClick={() => handleDelete(subtask._id)} style={miniDeleteBtn}>✕</button>
          </div>
        );
      })}

      {adding ? (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
          <input
            placeholder="Subtask name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            style={{ ...miniInput, flex: 2 }}
          />
          <input
            type="number"
            placeholder="Time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            required
            min="1"
            style={{ ...miniInput, width: '70px' }}
          />
          <select value={newUnit} onChange={(e) => setNewUnit(e.target.value as 'hours' | 'minutes')} style={miniInput}>
            <option value="minutes">min</option>
            <option value="hours">hrs</option>
          </select>
          <button type="submit" style={miniStartBtn}>Add</button>
          <button type="button" onClick={() => setAdding(false)} style={miniDeleteBtn}>✕</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} style={addSubtaskBtn}>+ Add subtask</button>
      )}
    </div>
  );
};

const subtaskRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 4px',
  borderRadius: '6px',
  cursor: 'grab',
  marginBottom: '4px',
  background: '#fafafa',
};

const dragHandle: React.CSSProperties = {
  color: '#ccc',
  fontSize: '16px',
  cursor: 'grab',
  userSelect: 'none',
};

const miniInput: React.CSSProperties = {
  padding: '5px 8px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  fontSize: '12px',
};

const miniStartBtn: React.CSSProperties = {
  padding: '4px 8px',
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
};

const miniStopBtn: React.CSSProperties = {
  padding: '4px 8px',
  background: '#e74c3c',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
};

const miniDeleteBtn: React.CSSProperties = {
  padding: '4px 8px',
  background: '#fdecea',
  color: '#e74c3c',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
};

const addSubtaskBtn: React.CSSProperties = {
  marginTop: '8px',
  padding: '5px 10px',
  background: 'none',
  border: '1px dashed #ccc',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#888',
  width: '100%',
};

export default SubtaskList;