"use client";

import { useState, useEffect } from "react";
import styles from "../DoctorDashboard.module.css";
import { X } from "lucide-react";
import Alert from "@/app/dashboard/components/Alert";
// TODO: Uncomment when connecting backend
import { fetchTasks as fetchTasksAPI, addTask as addTaskAPI, updateTask as updateTaskAPI, deleteTask as deleteTaskAPI } from "@/services/doctor";

// Helper function to convert local date to ISO date string that safely maps to the same UTC day
const getLocalDateISOString = (date) => {
  if (!date) return new Date().toISOString();
  
  // Create a date string in YYYY-MM-DD format from the local date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Return ISO string for midday UTC. This safely avoids timezone boundary
  // issues (-12 to +12 offsets) so the backend's explicit UTC day checking 
  // will correctly map the task to the selected day.
  return `${year}-${month}-${day}T12:00:00.000Z`;
};

export default function TasksSection(props) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(props.selectedDate || new Date());

  // Alert UI state
  const [alertState, setAlertState] = useState({ open: false, title: "", message: "", type: "info" });
  const showAlert = (title, message, type = "info") => setAlertState({ open: true, title, message, type });
  const closeAlert = () => setAlertState(s => ({ ...s, open: false }));

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  /**
   * Fetch tasks from backend
   */
  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTasksAPI();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new task
   */
  const handleAddTask = async (taskData) => {
    try {
      const newTask = await addTaskAPI({
        title: taskData.label,
        priority: taskData.urgent ? "urgent" : "normal",
        due_date: getLocalDateISOString(props.selectedDate)
      });
      setTasks(prev => [...prev, newTask]);
      if (typeof props.onRefresh === 'function') props.onRefresh();
    } catch (error) {
      console.error("Failed to add task:", error);
      showAlert("Error", "Failed to add task. Please try again.", "error");
    }
  };

  /**
   * Toggle task completion status
   */
  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Use task status (assuming "completed" vs "pending" string or boolean in backend)
    // The flow doc says status can be "pending" or "completed".
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const updatedTask = { ...task, status: newStatus };

    // Optimistic update
    setTasks(tasks.map((t) => t.id === id ? updatedTask : t));

    try {
      await updateTaskAPI(id, { status: newStatus });
      if (typeof props.onRefresh === 'function') props.onRefresh();
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert on error
      setTasks(tasks.map((t) => t.id === id ? task : t));
    }
  };

  const handleDeleteTask = (id) => {
    setTaskToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const idToDelete = taskToDelete;
    // Close the confirm immediately
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
    // Optimistic removal
    setTasks(prev => prev.filter(t => t.id !== idToDelete));
    try {
      await deleteTaskAPI(idToDelete);
      if (typeof props.onRefresh === 'function') props.onRefresh();
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Reload tasks to restore correct state on failure
      loadTasks();
      showAlert("Error", "Failed to delete task. Please try again.", "error");
    }
  };


  /* Modal State */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("normal");

  const submitNewTask = () => {
    if (!newTaskLabel.trim()) return;
    handleAddTask({
      label: newTaskLabel,
      urgent: newTaskPriority === "urgent"
    });
    setIsModalOpen(false);
    setNewTaskLabel("");
    setNewTaskPriority("normal");
  };

  const urgentCount = tasks.filter((t) => t.status !== "completed" && (t.priority === "high" || t.priority === "urgent")).length;

  return (
    <div className={styles.card} style={{ position: "relative" }}>
      <div className={styles.tasksHeader}>
        <h3 className={styles.cardTitle}>Tasks</h3>
        <span className={styles.taskCountUrgent}>{urgentCount} Urgent</span>
      </div>

      {error && <p style={{ color: "red", fontSize: "12px", margin: "10px" }}>{error}</p>}

      <div className={styles.tasksList}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={styles.taskItem}>
              <div style={{ display: "flex", alignItems: "center", flex: 1, gap: "12px" }}>
                <button
                  className={`${styles.taskCheckbox} ${task.status === "completed" ? styles.taskCompleted : ""}`}
                  onClick={() => toggleTask(task.id)}
                />
                <div className={styles.taskText}>
                  <span className={`${styles.taskLabel} ${task.status === "completed" ? styles.taskLabelStrike : ""}`}>
                    {task.title}
                  </span>
                  <span
                    className={`${styles.taskTime} ${(task.priority === "high" || task.priority === "urgent") && task.status !== "completed" ? styles.taskTimeUrgent : ""} ${task.status === "completed" ? styles.taskTimeCompleted : ""}`}
                  >
                    {task.status === "completed" ? "Completed" : (task.priority === "high" || task.priority === "urgent" ? "Urgent" : "Normal")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Delete task"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        className={styles.addTaskBtn}
        onClick={() => setIsModalOpen(true)}
      >
        + Add New Task
      </button>

      {/* Inline Modal for Task Creation */}
      {isModalOpen && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(5px)",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          gap: "12px",
          borderRadius: "12px",
          zIndex: 10
        }}>
          <h4 style={{ margin: 0, color: "#1e293b" }}>New Task</h4>
          <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b" }}>
            {props.selectedDate ? `Assigned to: ${props.selectedDate.toDateString()}` : "Assigned to today"}
          </p>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTaskLabel}
            onChange={(e) => setNewTaskLabel(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              width: "100%",
              boxSizing: "border-box"
            }}
          />
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label style={{ fontSize: "14px", color: "#64748b" }}>Priority:</label>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                flex: 1
              }}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                flex: 1,
                padding: "8px",
                background: "#f1f5f9",
                color: "#64748b",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>
            <button
              onClick={submitNewTask}
              style={{
                flex: 1,
                padding: "8px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Alert for errors */}
      <Alert
        isOpen={alertState.open}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText="OK"
        onConfirm={closeAlert}
      />

      {/* Delete confirmation Alert */}
      <Alert
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setTaskToDelete(null); }}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        type="error"
        showCancel={true}
        cancelText="Cancel"
        confirmText="Delete"
        onConfirm={confirmDeleteTask}
      />
    </div>
  );
}
