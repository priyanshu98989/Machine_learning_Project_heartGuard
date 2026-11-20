import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def _label(value: int | float) -> str:
    return str(value)


def generate_report_bytes(record, feature_importance: dict | None = None) -> bytes:
    """Generate a PDF report in-memory and return the bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        title="Heart Disease Risk Report",
        author="HeartGuard Risk Assessment System",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleX", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=18, textColor=colors.HexColor("#CC0000")
    )
    sub_style = ParagraphStyle(
        "SubX", parent=styles["Normal"], fontSize=10, textColor=colors.grey, alignment=1
    )
    h_style = ParagraphStyle(
        "HX", parent=styles["Heading2"], fontSize=13, textColor=colors.HexColor("#333333"), spaceAfter=8
    )
    normal = styles["Normal"]

    elements = []
    elements.append(Paragraph("Heart Disease Risk Report", title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Educational & demonstration purposes only — not a medical diagnosis.", sub_style))
    elements.append(Spacer(1, 12))

    risk = record.risk_level
    risk_hex = "#22c55e"
    if risk == "High Risk":
        risk_hex = "#ef4444"
    elif risk == "Moderate Risk":
        risk_hex = "#f59e0b"

    summary = [
        ["Patient Name", record.patient_name or "Anonymous"],
        ["Risk Level", Paragraph(f'<font color="{risk_hex}" size="12"><b>{risk}</b></font>', normal)],
        ["Probability", f"{(record.probability * 100):.1f}%"],
        ["Model Used", record.model_used],
        ["Report Date", datetime.now().strftime("%Y-%m-%d %H:%M")],
    ]
    t = Table(summary, colWidths=[45 * mm, 100 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f3f4f6")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("Clinical Parameters", h_style))
    fields = [
        ("Age", _label(record.age)),
        ("Sex", "Male" if record.sex == 1 else "Female"),
        ("Chest Pain Type", _label(record.cp)),
        ("Resting Blood Pressure", f"{record.trestbps} mm Hg"),
        ("Serum Cholesterol", f"{record.chol} mg/dl"),
        ("Fasting Blood Sugar > 120", "Yes" if record.fbs == 1 else "No"),
        ("Resting ECG", _label(record.restecg)),
        ("Max Heart Rate", f"{record.thalach} bpm"),
        ("Exercise Angina", "Yes" if record.exang == 1 else "No"),
        ("ST Depression (Oldpeak)", _label(record.oldpeak)),
        ("ST Slope", _label(record.slope)),
        ("Major Vessels", _label(record.ca)),
        ("Thalassemia", _label(record.thal)),
    ]
    params = Table(fields, colWidths=[55 * mm, 90 * mm])
    params.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
    ]))
    elements.append(params)

    if feature_importance:
        elements.append(Spacer(1, 14))
        elements.append(Paragraph("Top Contributing Factors", h_style))
        fi_rows = [["#", "Factor", "Relative Importance"]]
        for i, (name, val) in enumerate(list(feature_importance.items())[:6], start=1):
            fi_rows.append([str(i), name, f"{val * 100:.1f}%"])
        ft = Table(fi_rows, colWidths=[15 * mm, 90 * mm, 40 * mm])
        ft.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(ft)

    elements.append(Spacer(1, 14))
    elements.append(Paragraph("Disclaimer", h_style))
    elements.append(
        Paragraph(
            "This report was generated for educational and demonstration purposes only. "
            "It is NOT a medical diagnosis and should NEVER be used as a substitute for "
            "professional medical advice, diagnosis, or treatment. Always consult a "
            "qualified healthcare provider for any health concerns.",
            normal,
        )
    )

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
