"use client";

import { useState } from "react";
import styles from "../DoctorDashboard.module.css";

export default function TasksSection() {
  const [tasks, setTasks] = useState([
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
  ]);

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
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
              className={`${styles.taskCheckbox} ${
                task.completed ? styles.taskCompleted : ""
              }`}
              onClick={() => toggleTask(task.id)}
            />
            <div className={styles.taskText}>
              <span
                className={`${styles.taskLabel} ${
                  task.completed ? styles.taskLabelStrike : ""
                }`}
              >
                {task.label}
              </span>
              <span
                className={`${styles.taskTime} ${
                  task.urgent && !task.completed ? styles.taskTimeUrgent : ""
                } ${task.completed ? styles.taskTimeCompleted : ""}`}
              >
                {task.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.addTaskBtn}>+ Add New Task</button>
    </div>
  );
}
