"use client"

import { useState } from "react"
import styles from "./help.module.css"
import { MdSearch, MdCircle } from "react-icons/md"

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("faq")
  const [searchQuery, setSearchQuery] = useState("")
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSearch = (e) => {
    e.preventDefault()
    alert(`Searching for: ${searchQuery}`)
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    alert("Message sent! We'll get back to you soon.")
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Help & Support</h1>
        <p className={styles.subtitle}>Find answers or contact our support team</p>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          <MdSearch size={20} />
          Search
        </button>
      </form>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "faq" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("faq")}
        >
          FAQ
        </button>
        <button
          className={`${styles.tab} ${activeTab === "guides" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("guides")}
        >
          User Guides
        </button>
        <button
          className={`${styles.tab} ${activeTab === "contact" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("contact")}
        >
          Contact Support
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "faq" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Frequently Asked Questions</h2>
              <p className={styles.cardSubtitle}>Common questions and answers about the PV Power Dashboard</p>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.faqList}>
                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>How accurate are the PV power predictions?</div>
                  <div className={styles.faqAnswer}>
                    Our Bi-LSTM model achieves an average accuracy of 91%. The accuracy depends on various factors
                    including weather conditions, data quality, and panel specifications. The system continuously learns
                    and improves over time.
                  </div>
                </div>

                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>How do I add new solar panels to the system?</div>
                  <div className={styles.faqAnswer}>
                    You can add new solar panels by using the "Enter Custom Specs" option in the right sidebar of the
                    dashboard. Alternatively, you can go to Settings &gt; System Configuration to set up your default
                    panel configuration.
                  </div>
                </div>

                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>What do the different alert levels mean?</div>
                  <div className={styles.faqAnswer}>
                    <p>The alert levels indicate different thresholds of PV power generation:</p>
                    <ul className={styles.bulletList}>
                      <li>
                        <span className={styles.normalText}>Normal</span>: Power generation is within expected range
                      </li>
                      <li>
                        <span className={styles.yellowText}>Yellow</span>: Power is slightly below expected range
                      </li>
                      <li>
                        <span className={styles.orangeText}>Orange</span>: Power is moderately below expected range
                      </li>
                      <li>
                        <span className={styles.redText}>Red</span>: Power is significantly below expected range
                      </li>
                    </ul>
                    <p>You can customize these thresholds in Settings &gt; Notifications.</p>
                  </div>
                </div>

                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>How can I export my data?</div>
                  <div className={styles.faqAnswer}>
                    You can export your data by clicking the "Export" button in the top right corner of most data views.
                    The system supports CSV, Excel, and JSON formats. For API access to your data, go to Settings &gt;
                    API Access.
                  </div>
                </div>

                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>How do I add new users to the system?</div>
                  <div className={styles.faqAnswer}>
                    Administrators can add new users by navigating to the Users page and clicking the "Add New" button.
                    You can set user permissions and roles during the creation process.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guides" && (
          <div className={styles.guidesGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Getting Started</h2>
                <p className={styles.cardSubtitle}>Learn the basics of the PV Power Dashboard</p>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.linkList}>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      Dashboard Overview
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      Understanding Predictions
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      Configuring Your System
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      User Management
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Advanced Features</h2>
                <p className={styles.cardSubtitle}>Dive deeper into advanced functionality</p>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.linkList}>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      API Integration Guide
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      Custom Reporting
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      Alert Configuration
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      Data Export & Analysis
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Video Tutorials</h2>
                <p className={styles.cardSubtitle}>Visual guides for using the dashboard</p>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.linkList}>
                  <li>
                    <MdCircle className={styles.redCircle} />
                    <a href="#" className={styles.link}>
                      Dashboard Walkthrough
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.redCircle} />
                    <a href="#" className={styles.link}>
                      Setting Up Alerts
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.redCircle} />
                    <a href="#" className={styles.link}>
                      Analyzing Performance Data
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.redCircle} />
                    <a href="#" className={styles.link}>
                      Troubleshooting Common Issues
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Technical Documentation</h2>
                <p className={styles.cardSubtitle}>Detailed technical specifications</p>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.linkList}>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      Bi-LSTM Model Documentation
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      API Reference
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      Database Schema
                    </a>
                  </li>
                  <li>
                    <MdCircle className={styles.blueCircle} />
                    <a href="#" className={styles.link}>
                      System Architecture
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Contact Support</h2>
              <p className={styles.cardSubtitle}>Get in touch with our support team</p>
            </div>
            <div className={styles.cardContent}>
              <form onSubmit={handleContactSubmit} className={styles.contactForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    required
                    className={styles.textarea}
                    rows={5}
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  Submit
                </button>
              </form>

              <div className={styles.contactInfo}>
                <h3 className={styles.contactTitle}>Other Ways to Reach Us</h3>
                <div className={styles.contactMethods}>
                  <div className={styles.contactMethod}>
                    <MdSearch className={styles.contactIcon} />
                    i.khelif@esi-sba.dz
                  </div>
                  <div className={styles.contactMethod}>
                    <MdSearch className={styles.contactIcon} />
                    +213 791763701 
                  </div>
                  <div className={styles.contactMethod}>
                    <MdSearch className={styles.contactIcon} />
                    Live Chat (Business Hours: 9AM-5PM)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
