"use client";

import { useState, type FormEvent } from "react";
import type { ContactCopy } from "@/data/contact";
import styles from "./ContactForm.module.css";

interface FormData {
  name: string;
  furigana: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  contactMethod: string;
}

const emptyFormData: FormData = {
  name: "",
  furigana: "",
  email: "",
  phone: "",
  inquiryType: "",
  message: "",
  contactMethod: "",
};

type Step = "input" | "confirm" | "complete";

export default function ContactForm({
  copy,
  homeHref,
}: {
  copy: ContactCopy;
  homeHref: string;
}) {
  const [step, setStep] = useState<Step>("input");
  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const handleInputSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setFormData({
      name: String(data.get("name") ?? ""),
      furigana: String(data.get("furigana") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      inquiryType: String(data.get("inquiryType") ?? ""),
      message: String(data.get("message") ?? ""),
      contactMethod: String(data.get("contactMethod") ?? ""),
    });
    setStep("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmSubmit = () => {
    // No backend yet — the form is UI-only per the current project scope.
    setStep("complete");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setFormData(emptyFormData);
    setStep("input");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmRows: Array<[string, string]> = [
    [copy.fields.name, formData.name],
    [copy.fields.furigana, formData.furigana],
    [copy.fields.email, formData.email],
    [copy.fields.phone, formData.phone || "―"],
    [copy.fields.inquiryType, formData.inquiryType],
    [copy.fields.message, formData.message || "―"],
    [copy.fields.contactMethod, formData.contactMethod || "―"],
  ];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{copy.heroTitle}</h1>
        <p className={styles.intro}>{copy.intro}</p>

        <ol className={styles.steps} aria-label="progress">
          <li className={step === "input" ? styles.stepActive : styles.stepDone}>
            {copy.steps.input}
          </li>
          <li
            className={
              step === "confirm" ? styles.stepActive : step === "complete" ? styles.stepDone : ""
            }
          >
            {copy.steps.confirm}
          </li>
          <li className={step === "complete" ? styles.stepActive : ""}>{copy.steps.complete}</li>
        </ol>

        {step === "input" && (
          <form className={styles.form} onSubmit={handleInputSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">
                {copy.fields.name}
                <span className={styles.required}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={formData.name}
                className={styles.input}
                placeholder={copy.fields.namePlaceholder}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="furigana">
                {copy.fields.furigana}
                <span className={styles.required}>*</span>
              </label>
              <input
                id="furigana"
                name="furigana"
                type="text"
                required
                defaultValue={formData.furigana}
                className={styles.input}
                placeholder={copy.fields.furiganaPlaceholder}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                {copy.fields.email}
                <span className={styles.required}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={formData.email}
                className={styles.input}
                placeholder={copy.fields.emailPlaceholder}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                {copy.fields.phone}
                <span className={styles.optional}>{copy.fields.phoneNote}</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                pattern="[0-9]*"
                defaultValue={formData.phone}
                className={styles.input}
                placeholder={copy.fields.phonePlaceholder}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="inquiryType">
                {copy.fields.inquiryType}
                <span className={styles.required}>*</span>
              </label>
              <select
                id="inquiryType"
                name="inquiryType"
                required
                className={styles.select}
                defaultValue={formData.inquiryType}
              >
                <option value="" disabled>
                  ―
                </option>
                {copy.inquiryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="message">
                {copy.fields.message}
              </label>
              <textarea
                id="message"
                name="message"
                defaultValue={formData.message}
                className={styles.textarea}
                placeholder={copy.fields.messagePlaceholder}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>{copy.fields.contactMethod}</span>
              <div className={styles.radioGroup}>
                {copy.contactMethodOptions.map((option) => (
                  <label key={option} className={styles.radioOption}>
                    <input
                      type="radio"
                      name="contactMethod"
                      value={option}
                      defaultChecked={formData.contactMethod === option}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <p className={styles.note}>{copy.submittingNote}</p>

            <button type="submit" className={styles.submitBtn}>
              {copy.confirmButton}
            </button>
          </form>
        )}

        {step === "confirm" && (
          <div className={styles.confirmBox}>
            <table className={styles.confirmTable}>
              <tbody>
                {confirmRows.map(([label, value]) => (
                  <tr key={label}>
                    <th>{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className={styles.note}>{copy.submittingNote}</p>

            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setStep("input")}
              >
                {copy.editButton}
              </button>
              <button type="button" className={styles.submitBtn} onClick={handleConfirmSubmit}>
                {copy.submitButton}
              </button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className={styles.successBox}>
            <div className={styles.successTitle}>{copy.successTitle}</div>
            <p>{copy.successBody}</p>
            <div className={styles.successActions}>
              <button type="button" className={styles.secondaryBtn} onClick={handleReset}>
                {copy.continueLabel}
              </button>
              <a href={homeHref} className={styles.submitBtn}>
                {copy.homeLabel}
              </a>
            </div>
          </div>
        )}

        <div className={styles.qrSection}>
          <h2 className={styles.qrTitle}>{copy.qr.title}</h2>
          <div className={styles.qrGrid}>
            <div className={styles.qrCard}>
              <div className={styles.qrPlaceholder}>{copy.qr.comingSoon}</div>
              <div className={styles.qrLabel}>{copy.qr.wechatLabel}</div>
              <div className={styles.qrNote}>{copy.qr.wechatNote}</div>
            </div>
            <div className={styles.qrCard}>
              <div className={styles.qrPlaceholder}>{copy.qr.comingSoon}</div>
              <div className={styles.qrLabel}>{copy.qr.lineLabel}</div>
              <div className={styles.qrNote}>{copy.qr.lineNote}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
