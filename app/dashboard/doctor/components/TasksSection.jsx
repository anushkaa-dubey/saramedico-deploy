"use client";

import { useState, useEffect } from "react";
import styles from "../DoctorDashboard.module.css";
// TODO: Uncomment when connecting backend
import { fetchTasks as fetchTasksAPI, addTask as addTaskAPI, updateTask as updateTaskAPI, deleteTask as deleteTaskAPI } from "@/services/doctor";

export default function TasksSection() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        due_date: new Date().toISOString()
      });
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error("Failed to add task:", error);
      alert("Failed to add task");
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
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert on error
      setTasks(tasks.map((t) => t.id === id ? task : t));
    }
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTaskAPI(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task");
    }
  };


  const urgentCount = tasks.filter((t) => t.status !== "completed" && (t.priority === "high" || t.priority === "urgent")).length;

  return (
    <div className={styles.card}>
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
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
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
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}
                title="Delete task"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <button
        className={styles.addTaskBtn}
        onClick={() => {
          const label = prompt("Enter task description:");
          if (label) {
            handleAddTask({ label, urgent: false });
          }
        }}
      >
        + Add New Task
      </button>
    </div>
  );
}
