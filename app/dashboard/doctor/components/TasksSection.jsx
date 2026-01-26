"use client";

import { useState, useEffect } from "react";
import styles from "../DoctorDashboard.module.css";
// TODO: Uncomment when connecting backend
// import { fetchTasks as fetchTasksAPI, addTask as addTaskAPI, updateTask as updateTaskAPI, deleteTask as deleteTaskAPI } from "@/services/doctor";

export default function TasksSection() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  /**
   * Fetch tasks from backend (currently using dummy data)
   */
  const loadTasks = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await fetchTasksAPI();
      // setTasks(data);

      // TEMPORARY: Using dummy data
      const dummyTasks = [
        {
          id: 1,
          label: "Sign off on lab results",
          time: "Due Today - Urgent",
          completed: false,
          urgent: true,
        },
        {
          id: 2,
          label: "Review referral for Patient #902",
          time: "Due Tomorrow",
          completed: false,
          urgent: false,
        },
        {
          id: 3,
          label: "Approve prescription refill",
          time: "Due Friday",
          completed: false,
          urgent: false,
        },
        {
          id: 4,
          label: "Team Meeting preparation",
          time: "Completed",
          completed: true,
          urgent: false,
        },
      ];
      setTasks(dummyTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new task
   */
  const handleAddTask = async (taskData) => {
    try {
      // TODO: Replace with actual API call
      // const newTask = await addTaskAPI(taskData);
      // setTasks([...tasks, newTask]);

      console.log("Add task:", taskData);
      // For now, just log - will implement UI for adding tasks later
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  /**
   * Toggle task completion status
   */
  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    // Optimistic update
    setTasks(tasks.map((t) => t.id === id ? updatedTask : t));

    try {
      // TODO: Replace with actual API call
      // await updateTaskAPI(id, { completed: updatedTask.completed });
      console.log("Update task:", id, updatedTask);
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
    try {
      // TODO: Replace with actual API call
      // await deleteTaskAPI(id);
      // setTasks(tasks.filter(t => t.id !== id));

      console.log("Delete task:", id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const urgentCount = tasks.filter((t) => !t.completed && t.urgent).length;

  return (
    <div className={styles.card}>
      <div className={styles.tasksHeader}>
        <h3 className={styles.cardTitle}>Tasks</h3>
        <span className={styles.taskCountUrgent}>{urgentCount} Urgent</span>
      </div>

      <div className={styles.tasksList}>
        {tasks.map((task) => (
          <div key={task.id} className={styles.taskItem}>
            <button
              className={`${styles.taskCheckbox} ${task.completed ? styles.taskCompleted : ""
                }`}
              onClick={() => toggleTask(task.id)}
            />
            <div className={styles.taskText}>
              <span
                className={`${styles.taskLabel} ${task.completed ? styles.taskLabelStrike : ""
                  }`}
              >
                {task.label}
              </span>
              <span
                className={`${styles.taskTime} ${task.urgent && !task.completed ? styles.taskTimeUrgent : ""
                  } ${task.completed ? styles.taskTimeCompleted : ""}`}
              >
                {task.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        className={styles.addTaskBtn}
        onClick={() => {
          const label = prompt("Enter task description:");
          if (label) {
            const newTask = {
              id: Date.now(),
              label,
              time: "Due Today",
              completed: false,
              urgent: false
            };
            setTasks([...tasks, newTask]);
            handleAddTask(newTask);
          }
        }}
      >
        + Add New Task
      </button>
    </div>
  );
}
