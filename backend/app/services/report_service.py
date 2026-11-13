import io
import csv
from datetime import datetime
from typing import Dict, Any, Optional

def generate_csv_report(metrics: Dict[str, Any], experiment_info: Optional[Dict] = None, is_demo: bool = False) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["=" * 60])
    writer.writerow(["BloodEye - Experimental Blood Group Classification"])
    writer.writerow(["Research Report"])
    writer.writerow(["=" * 60])
    writer.writerow([])
    writer.writerow(["DISCLAIMER"])
    writer.writerow(["BloodEye is an experimental research application."])
    writer.writerow(["Predictions are NOT clinically validated and must NOT be used for medical decisions."])
    writer.writerow([])
    
    if is_demo:
        writer.writerow(["*** DEMONSTRATION DATA ***"])
        writer.writerow(["The metrics below are illustrative examples, NOT actual experimental results."])
        writer.writerow([])
    
    writer.writerow(["Generated At", datetime.utcnow().isoformat()])
    writer.writerow([])
    
    if experiment_info:
        writer.writerow(["Experiment Configuration"])
        for k, v in experiment_info.items():
            writer.writerow([k, str(v)])
        writer.writerow([])
    
    writer.writerow(["Evaluation Metrics"])
    writer.writerow(["Metric", "Value"])
    for k, v in metrics.items():
        if isinstance(v, (int, float)):
            writer.writerow([k, f"{v:.4f}" if isinstance(v, float) else str(v)])
    
    writer.writerow([])
    writer.writerow(["Random Baseline (8 classes)", "0.125 (12.5%)"])
    
    return output.getvalue()

def generate_pdf_report(metrics: Dict[str, Any], experiment_info: Optional[Dict] = None, is_demo: bool = False) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []
        
        elements.append(Paragraph("BloodEye - Research Report", styles['Title']))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(
            "<b>DISCLAIMER:</b> This is an experimental research application. "
            "Results are NOT clinically validated.", styles['Normal']
        ))
        elements.append(Spacer(1, 12))
        
        if is_demo:
            elements.append(Paragraph(
                "<b>*** DEMONSTRATION DATA ***</b> - These metrics are illustrative examples.",
                styles['Normal']
            ))
            elements.append(Spacer(1, 12))
        
        elements.append(Paragraph(f"Generated: {datetime.utcnow().isoformat()}", styles['Normal']))
        elements.append(Spacer(1, 24))
        
        # Metrics table
        table_data = [["Metric", "Value"]]
        for k, v in metrics.items():
            if isinstance(v, (int, float)):
                table_data.append([k, f"{v:.4f}" if isinstance(v, float) else str(v)])
        
        table = Table(table_data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.06, 0.09, 0.16)),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.Color(0.95, 0.97, 0.99)])
        ]))
        elements.append(table)
        elements.append(Spacer(1, 24))
        
        elements.append(Paragraph(
            f"Random baseline for 8 classes: 12.5%", styles['Normal']
        ))
        
        doc.build(elements)
        return buffer.getvalue()
    except ImportError:
        return b"PDF generation requires reportlab. Install it with: pip install reportlab"
