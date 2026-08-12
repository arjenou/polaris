"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { MoveOutFormCopy } from "@/data/moveOutForm";
import styles from "./MoveOutForm.module.css";

type Step = "input" | "complete";

export default function MoveOutForm({
  copy,
  backHref,
  homeHref,
}: {
  copy: MoveOutFormCopy;
  backHref: string;
  homeHref: string;
}) {
  const [step, setStep] = useState<Step>("input");
  const [cancelReason, setCancelReason] = useState("");
  const otherReasonValue = copy.cancelReasonOptions[copy.cancelReasonOptions.length - 1];
  const isOtherReason = cancelReason === otherReasonValue;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // No backend yet — the form is UI-only per the current project scope.
    setStep("complete");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setCancelReason("");
    setStep("input");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.intro}>{copy.intro}</p>

        {step === "input" && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="propertyName">
                {copy.fields.propertyName}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <input
                id="propertyName"
                name="propertyName"
                type="text"
                required
                className={styles.input}
                placeholder={copy.fields.propertyNamePlaceholder}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="roomNumber">
                {copy.fields.roomNumber}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <input
                id="roomNumber"
                name="roomNumber"
                type="text"
                required
                className={styles.input}
                placeholder={copy.fields.roomNumberPlaceholder}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="contractorName">
                {copy.fields.contractorName}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <input
                id="contractorName"
                name="contractorName"
                type="text"
                required
                className={styles.input}
                placeholder={copy.fields.contractorNamePlaceholder}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                {copy.fields.phone}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                pattern="[0-9]*"
                required
                className={styles.input}
                placeholder={copy.fields.phonePlaceholder}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                {copy.fields.email}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={styles.input}
                placeholder={copy.fields.emailPlaceholder}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cancelReason">
                {copy.fields.cancelReason}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <select
                id="cancelReason"
                name="cancelReason"
                required
                className={styles.select}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
              >
                <option value="" disabled>
                  ―
                </option>
                {copy.cancelReasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {isOtherReason && (
                <textarea
                  name="cancelReasonDetail"
                  className={styles.textarea}
                  placeholder={copy.fields.cancelReasonOtherPlaceholder}
                />
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cancelDate">
                {copy.fields.cancelDate}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <input id="cancelDate" name="cancelDate" type="date" required className={styles.input} />
              <p className={styles.fieldNote}>{copy.fields.cancelDateNote}</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="attendanceDate">
                {copy.fields.attendanceDate}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <input
                id="attendanceDate"
                name="attendanceDate"
                type="date"
                required
                className={styles.input}
              />
              <p className={styles.fieldNote}>{copy.fields.attendanceDateNote}</p>
            </div>

            <div className={styles.noticeBox}>
              <h2 className={styles.noticeTitle}>{copy.fields.attendanceNoticeTitle}</h2>
              <ul className={styles.noticeList}>
                {copy.attendanceNoticeItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="attendanceTime">
                {copy.fields.attendanceTime}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <select
                id="attendanceTime"
                name="attendanceTime"
                required
                className={styles.select}
                defaultValue=""
              >
                <option value="" disabled>
                  ―
                </option>
                {copy.attendanceTimeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="newAddress">
                {copy.fields.newAddress}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </label>
              <input
                id="newAddress"
                name="newAddress"
                type="text"
                required
                className={styles.input}
                placeholder={copy.fields.newAddressPlaceholder}
              />
            </div>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                {copy.fields.refundAccountTitle}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </legend>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="bankName">
                  {copy.fields.bankName}
                </label>
                <input id="bankName" name="bankName" type="text" className={styles.input} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="branchName">
                  {copy.fields.branchName}
                </label>
                <input id="branchName" name="branchName" type="text" className={styles.input} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="accountType">
                  {copy.fields.accountType}
                </label>
                <select id="accountType" name="accountType" className={styles.select} defaultValue="">
                  <option value="" disabled>
                    ―
                  </option>
                  {copy.accountTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="accountNumber">
                  {copy.fields.accountNumber}
                </label>
                <input id="accountNumber" name="accountNumber" type="text" className={styles.input} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="accountHolderKana">
                  {copy.fields.accountHolderKana}
                </label>
                <input
                  id="accountHolderKana"
                  name="accountHolderKana"
                  type="text"
                  className={styles.input}
                />
              </div>
            </fieldset>

            <div className={styles.agreeField}>
              <div className={styles.agreeHeading}>
                {copy.fields.leftoverItemsTitle}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </div>
              <p className={styles.agreeNote}>{copy.fields.leftoverItemsNote}</p>
              <label className={styles.checkboxOption}>
                <input type="checkbox" name="leftoverItemsAgree" required />
                {copy.fields.leftoverItemsAgree}
              </label>
            </div>

            <div className={styles.agreeField}>
              <div className={styles.agreeHeading}>
                {copy.fields.utilitiesTitle}
                <span className={styles.required}>{copy.requiredBadge}</span>
              </div>
              <p className={styles.agreeNote}>{copy.fields.utilitiesNote}</p>
              <label className={styles.checkboxOption}>
                <input type="checkbox" name="utilitiesAgree" required />
                {copy.fields.utilitiesAgree}
              </label>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="otherMessage">
                {copy.fields.otherMessage}
                <span className={styles.optional}>{copy.optionalBadge}</span>
              </label>
              <textarea
                id="otherMessage"
                name="otherMessage"
                className={styles.textarea}
                placeholder={copy.fields.otherMessagePlaceholder}
              />
            </div>

            <p className={styles.note}>{copy.submittingNote}</p>

            <div className={styles.actions}>
              <Link href={backHref} className={styles.secondaryBtn}>
                {copy.backLabel}
              </Link>
              <button type="submit" className={styles.submitBtn}>
                {copy.submitLabel}
              </button>
            </div>
          </form>
        )}

        {step === "complete" && (
          <div className={styles.successBox}>
            <div className={styles.successTitle}>{copy.successTitle}</div>
            <p>{copy.successBody}</p>
            <div className={styles.successActions}>
              <button type="button" className={styles.secondaryBtn} onClick={handleReset}>
                {copy.continueLabel}
              </button>
              <Link href={homeHref} className={styles.submitBtn}>
                {copy.homeLabel}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
