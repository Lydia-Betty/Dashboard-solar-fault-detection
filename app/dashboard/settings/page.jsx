"use client"

import { useState } from "react"
import styles from "./settings.module.css"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert("Settings saved successfully")
    }, 1000)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account and system preferences</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "account" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("account")}
        >
          Account
        </button>
        <button
          className={`${styles.tab} ${activeTab === "system" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("system")}
        >
          System Configuration
        </button>
        <button
          className={`${styles.tab} ${activeTab === "notifications" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
        <button
          className={`${styles.tab} ${activeTab === "api" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("api")}
        >
          API Access
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "account" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Account Information</h2>
              <p className={styles.cardSubtitle}>Update your account details</p>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input id="name" type="text" defaultValue="Admin" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" defaultValue="admin@example.com" className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="current-password">Current Password</label>
                <input id="current-password" type="password" className={styles.input} />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="new-password">New Password</label>
                  <input id="new-password" type="password" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input id="confirm-password" type="password" className={styles.input} />
                </div>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.button} onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "system" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>System Configuration</h2>
              <p className={styles.cardSubtitle}>Configure your PV power system settings</p>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formGroup}>
                <label>Default Panel Type</label>
                <select className={styles.select} defaultValue="mono-perc-m3">
                  <option value="mono-perc-m3">ZERGOUN MONO-PERC CELLULE M3</option>
                  <option value="ma-5bb">ZERGOUN MA 5BB</option>
                  <option value="poly-ma-5bb">ZERGOUN POLY MA 5BB</option>
                  <option value="mono-perc-m2">ZERGOUN MONO-PERC M2</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Number of Panels</label>
                <input type="number" defaultValue="10" min="1" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>System Location</label>
                <div className={styles.formGrid}>
                  <input placeholder="Latitude" defaultValue="36.7538" className={styles.input} />
                  <input placeholder="Longitude" defaultValue="3.0588" className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Data Collection Interval (seconds)</label>
                <select className={styles.select} defaultValue="60">
                  <option value="10">10 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="600">10 minutes</option>
                </select>
              </div>

              <div className={styles.switchItem}>
                <div>
                  <label>Enable Weather Data</label>
                  <p className={styles.switchDescription}>Include weather data in predictions</p>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.button} onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Notification Settings</h2>
              <p className={styles.cardSubtitle}>Configure how you receive alerts and notifications</p>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.switchItem}>
                <div>
                  <label>Email Notifications</label>
                  <p className={styles.switchDescription}>Receive alerts via email</p>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.switchItem}>
                <div>
                  <label>SMS Notifications</label>
                  <p className={styles.switchDescription}>Receive alerts via SMS</p>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.switchItem}>
                <div>
                  <label>Browser Notifications</label>
                  <p className={styles.switchDescription}>Receive alerts in your browser</p>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label>Alert Thresholds</label>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.smallLabel}>Yellow Alert</label>
                    <input type="number" defaultValue="300" className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.smallLabel}>Orange Alert</label>
                    <input type="number" defaultValue="200" className={styles.input} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.smallLabel}>Red Alert</label>
                  <input type="number" defaultValue="100" className={styles.input} />
                </div>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.button} onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>API Access</h2>
              <p className={styles.cardSubtitle}>Manage API keys and access</p>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formGroup}>
                <label>API Key</label>
                <div className={styles.apiKeyContainer}>
                  <input value="sk_live_51NxXXXXXXXXXXXXXXXXXXXXXX" readOnly className={styles.input} />
                  <button className={styles.outlineButton}>Copy</button>
                  <button className={styles.outlineButton}>Regenerate</button>
                </div>
                <p className={styles.formHelp}>Use this key to access the API programmatically</p>
              </div>

              <div className={styles.formGroup}>
                <label>Webhook URL</label>
                <input placeholder="https://your-server.com/webhook" className={styles.input} />
              </div>

              <div className={styles.switchItem}>
                <div>
                  <label>Enable API Access</label>
                  <p className={styles.switchDescription}>Allow external systems to access your data</p>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.button} onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
