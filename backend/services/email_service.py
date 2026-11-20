import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import config


def email_configured() -> bool:
    return bool(config.SMTP_HOST and config.SMTP_USER and config.SMTP_PASSWORD)


def send_report_email(
    to_email: str,
    patient_name: str,
    risk_level: str,
    probability: float,
    model_used: str,
    pdf_bytes: bytes | None = None,
) -> bool:
    """Send a prediction report email. Returns True on success."""
    if not email_configured():
        raise RuntimeError(
            "SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in the .env file."
        )

    msg = MIMEMultipart()
    msg["Subject"] = "Your Heart Disease Risk Assessment Report"
    msg["From"] = config.SMTP_FROM or config.SMTP_USER
    msg["To"] = to_email

    body = f"""Hello {patient_name},

Thank you for using the HeartGuard Risk Assessment System.

Your assessment result:
  Risk Level:  {risk_level}
  Probability: {probability * 100:.1f}%
  Model Used:  {model_used}

Please find your detailed report attached.

Medical Disclaimer: This is an educational tool only and NOT a medical
diagnosis. Always consult a qualified healthcare professional.

Regards,
HeartGuard Team
"""
    msg.attach(MIMEText(body, "plain"))

    if pdf_bytes:
        part = MIMEApplication(pdf_bytes, _subtype="pdf")
        part.add_header(
            "Content-Disposition",
            "attachment",
            filename=f"heartguard_report_{patient_name.replace(' ', '_')}.pdf",
        )
        msg.attach(part)

    with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=30) as server:
        if config.SMTP_TLS:
            server.starttls()
        server.login(config.SMTP_USER, config.SMTP_PASSWORD)
        server.sendmail(config.SMTP_FROM or config.SMTP_USER, [to_email], msg.as_string())

    return True
