import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { ResumeData } from "@/components/resume/ResumeBuilder"

export async function exportResumeToPDF(data: ResumeData) {
  const resumeElement = document.getElementById("resume-content")
  
  if (!resumeElement) {
    console.error("Resume content element not found")
    return
  }

  try {
    // Create canvas from the resume element
    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: resumeElement.scrollWidth,
      height: resumeElement.scrollHeight
    })

    // Calculate PDF dimensions
    const imgWidth = 8.5 // inches (standard letter width)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pdf = new jsPDF({
      orientation: imgHeight > 11 ? "portrait" : "portrait",
      unit: "in",
      format: [8.5, Math.max(11, imgHeight)]
    })

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

    // Generate filename
    const filename = `${data.fullName.replace(/\s+/g, "_")}_Resume.pdf`

    // Save PDF
    pdf.save(filename)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

