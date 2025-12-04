import { ResumeData } from "./ResumeBuilder"

interface ResumeTemplateProps {
  data: ResumeData
}

/**
 * Format date string to "Month Year" format
 * Handles numeric formats like "08/2025" or "8/2021" and converts to "August 2025" or "August 2021"
 * Leaves "Present" and already formatted dates unchanged
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr.trim() === "") return ""
  if (dateStr === "Present" || dateStr === "present") return "Present"
  
  // Check if it's already in "Month Year" format (contains a month name)
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]
  const hasMonthName = monthNames.some(month => 
    dateStr.toLowerCase().includes(month.toLowerCase())
  )
  if (hasMonthName) {
    return dateStr // Already formatted, return as-is
  }
  
  // Try to parse numeric formats: MM/YYYY or M/YYYY
  const numericMatch = dateStr.match(/^(\d{1,2})\/(\d{4})$/)
  if (numericMatch) {
    const monthNum = parseInt(numericMatch[1], 10)
    const year = numericMatch[2]
    
    if (monthNum >= 1 && monthNum <= 12) {
      const monthName = monthNames[monthNum - 1]
      return `${monthName} ${year}`
    }
  }
  
  // If we can't parse it, return as-is
  return dateStr
}

export function ResumeTemplate({ data }: ResumeTemplateProps) {
  // Sort professional experience by date (reverse chronological)
  const sortedExperience = [...data.professionalExperience].sort((a, b) => {
    const dateA = new Date(a.endDate === "Present" ? "9999-12-31" : a.endDate)
    const dateB = new Date(b.endDate === "Present" ? "9999-12-31" : b.endDate)
    return dateB.getTime() - dateA.getTime()
  })

  // Format flight hours into 3 columns with perfect vertical alignment
  const formatFlightHours = () => {
    const hours = data.selectedFlightHourCategories.map(category => ({
      label: category,
      value: data.flightHours[category] || 0
    })).filter(item => item.value > 0)

    // Create 3 columns, distributing items evenly
    const columns: Array<Array<{ label: string; value: number }>> = [[], [], []]
    hours.forEach((item, index) => {
      columns[index % 3].push(item)
    })
    
    return columns
  }

  const flightHourColumns = formatFlightHours()

  // Combine all certificates into sentences
  const allCertificates = [
    ...data.certificates,
    ...data.typeRatings.map(rating => `${rating} Type Rating`),
    ...data.medicalAndOther,
    ...data.instructorRatings
  ].filter(cert => cert.trim())

  // Format certificates into 1-2 centered lines
  const formatCertificates = () => {
    if (allCertificates.length === 0) return []
    
    // Combine certificates into sentences
    const combined = allCertificates.join(" - ")
    
    // Split into 1-2 lines if too long (roughly 80-100 characters per line)
    if (combined.length <= 100) {
      return [combined]
    }
    
    // Try to split at a natural break point (dash or period)
    const midPoint = Math.floor(combined.length / 2)
    const breakPoint = combined.lastIndexOf(" - ", midPoint)
    
    if (breakPoint > 0) {
      return [
        combined.substring(0, breakPoint).trim(),
        combined.substring(breakPoint + 3).trim()
      ]
    }
    
    return [combined]
  }

  const certificateLines = formatCertificates()

  return (
    <div 
      className="resume-template" 
      style={{ 
        maxWidth: "8.5in",
        margin: "0 auto",
        padding: "0.5in",
        fontFamily: "Arial, sans-serif",
        fontSize: "11pt",
        lineHeight: "1.4",
        color: "#000000",
        backgroundColor: "#ffffff"
      }}
    >
      {/* TOP NAME + CONTACT BLOCK */}
      <div style={{ textAlign: "center", marginBottom: "0.3in" }}>
        {/* Name - Centered, ALL CAPS, Large Bold */}
        <h1 style={{
          fontSize: "22pt",
          fontWeight: "bold",
          textTransform: "uppercase",
          margin: "0 0 0.15in 0",
          letterSpacing: "0.5px"
        }}>
          {data.fullName || "[FULL NAME]"}
        </h1>

        {/* First horizontal rule */}
        <hr style={{
          width: "90%",
          margin: "0 auto 0.1in auto",
          border: "none",
          borderTop: "1px solid #000000"
        }} />

        {/* Contact info - Centered with pipes */}
        {data.location || data.email || data.phone ? (
          <div style={{
            fontSize: "11pt",
            margin: "0.05in 0",
            textAlign: "center"
          }}>
            {[
              data.location,
              data.email,
              data.phone
            ].filter(Boolean).join(" | ")}
          </div>
        ) : null}

        {/* Second horizontal rule */}
        <hr style={{
          width: "90%",
          margin: "0.1in auto 0 auto",
          border: "none",
          borderTop: "1px solid #000000"
        }} />
      </div>

      {/* OBJECTIVE LINE */}
      {data.objective && (
        <div style={{
          textAlign: "center",
          margin: "0.2in 0",
          fontSize: "11pt"
        }}>
          <strong style={{ textTransform: "uppercase" }}>
            OBJECTIVE: {data.objective}
          </strong>
        </div>
      )}

      {/* FLIGHT HOURS SECTION */}
      {data.selectedFlightHourCategories.length > 0 && (
        <div style={{ margin: "0.25in 0" }}>
          {/* Horizontal rule above */}
          <hr style={{
            width: "90%",
            margin: "0 auto 0.1in auto",
            border: "none",
            borderTop: "1px solid #000000"
          }} />

          {/* Heading - Centered, ALL CAPS, Bold */}
          <h2 style={{
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "12pt",
            margin: "0.05in 0",
            letterSpacing: "0.5px"
          }}>
            FLIGHT HOURS
          </h2>

          {/* Horizontal rule below */}
          <hr style={{
            width: "90%",
            margin: "0.1in auto 0.15in auto",
            border: "none",
            borderTop: "1px solid #000000"
          }} />

          {/* 3-column grid with perfect vertical alignment */}
          <div style={{ 
            display: "flex",
            justifyContent: "center",
            gap: "1.2in",
            margin: "0 auto",
            maxWidth: "7in"
          }}>
            {/* Create 3 columns with fixed width for perfect alignment */}
            {flightHourColumns.map((columnItems, colIndex) => (
              <div 
                key={colIndex}
                style={{
                  flex: "0 0 1.8in",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                {columnItems.map((item, rowIndex) => (
                  <div 
                    key={rowIndex}
                    style={{
                      fontSize: "11pt",
                      marginBottom: rowIndex < columnItems.length - 1 ? "0.1in" : "0",
                      width: "100%",
                      textAlign: "center"
                    }}
                  >
                    {item.label}: {item.value.toLocaleString()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CERTIFICATES SECTION */}
      {allCertificates.length > 0 && (
        <div style={{ margin: "0.25in 0" }}>
          {/* Heading - Centered, ALL CAPS, Bold */}
          <h2 style={{
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "12pt",
            margin: "0 0 0.15in 0",
            letterSpacing: "0.5px"
          }}>
            CERTIFICATES
          </h2>

          {/* Certificate lines - Centered, full-width */}
          <div style={{ textAlign: "center", fontSize: "11pt" }}>
            {certificateLines.map((line, index) => (
              <p 
                key={index}
                style={{
                  margin: index < certificateLines.length - 1 ? "0 0 0.05in 0" : "0",
                  textAlign: "center"
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* PROFESSIONAL EXPERIENCE SECTION */}
      {sortedExperience.length > 0 && (
        <div style={{ margin: "0.25in 0" }}>
          {/* Horizontal rule */}
          <hr style={{
            width: "90%",
            margin: "0 auto 0.15in auto",
            border: "none",
            borderTop: "1px solid #000000"
          }} />

          {/* Heading - Centered, ALL CAPS, Bold */}
          <h2 style={{
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "12pt",
            margin: "0 0 0.2in 0",
            letterSpacing: "0.5px"
          }}>
            PROFESSIONAL EXPERIENCE
          </h2>

          {/* Job entries */}
          {sortedExperience.map((exp, index) => (
            <div 
              key={exp.id}
              style={{
                marginBottom: index < sortedExperience.length - 1 ? "0.15in" : "0"
              }}
            >
              {/* First line: Company (left) | Dates (right) */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.05in"
              }}>
                <span style={{
                  fontWeight: "bold",
                  fontSize: "11pt"
                }}>
                  {exp.company || "[Company]"}
                </span>
                <span style={{
                  fontWeight: "bold",
                  fontSize: "11pt"
                }}>
                  {exp.startDate && exp.endDate 
                    ? `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}` 
                    : formatDate(exp.startDate || exp.endDate || "")}
                </span>
              </div>

              {/* Second line: Job title/description */}
              {exp.jobTitle && (
                <div style={{
                  fontSize: "11pt",
                  marginBottom: "0.05in"
                }}>
                  {exp.jobTitle}
                  {exp.cityState && ` – ${exp.cityState}`}
                </div>
              )}

              {/* Job duties as bullet points */}
              {exp.jobDuties && exp.jobDuties.filter(duty => duty.trim()).length > 0 && (
                <ul style={{
                  fontSize: "11pt",
                  marginBottom: "0.05in",
                  marginLeft: "0.25in",
                  paddingLeft: "0.1in",
                  listStyleType: "disc",
                  listStylePosition: "outside"
                }}>
                  {exp.jobDuties.filter(duty => duty.trim()).map((duty, index) => (
                    <li key={index} style={{ 
                      marginBottom: "0.05in",
                      marginLeft: "0.1in",
                      paddingLeft: "0.05in"
                    }}>
                      {duty}
                    </li>
                  ))}
                </ul>
              )}

              {exp.aircraft && (
                <div style={{
                  fontSize: "11pt",
                  marginBottom: "0.05in"
                }}>
                  <strong>Aircraft:</strong> {exp.aircraft}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDUCATION SECTION */}
      {data.education.length > 0 && (
        <div style={{ margin: "0.25in 0" }}>
          {/* Horizontal rule */}
          <hr style={{
            width: "90%",
            margin: "0 auto 0.15in auto",
            border: "none",
            borderTop: "1px solid #000000"
          }} />

          {/* Heading - Centered, ALL CAPS, Bold */}
          <h2 style={{
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "12pt",
            margin: "0 0 0.2in 0",
            letterSpacing: "0.5px"
          }}>
            EDUCATION
          </h2>

          {/* Education entries */}
          {data.education.map((edu, index) => (
            <div 
              key={edu.id}
              style={{
                marginBottom: index < data.education.length - 1 ? "0.15in" : "0"
              }}
            >
              {/* First line: School (left) | Dates (right) */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.05in"
              }}>
                <span style={{
                  fontWeight: "bold",
                  fontSize: "11pt"
                }}>
                  {edu.schoolName || "[School Name]"}
                </span>
                <span style={{
                  fontWeight: "bold",
                  fontSize: "11pt"
                }}>
                  {edu.startDate && edu.endDate 
                    ? `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}` 
                    : formatDate(edu.startDate || edu.endDate || "")}
                </span>
              </div>

              {/* Second line: Degree */}
              {edu.degree && (
                <div style={{
                  fontSize: "11pt",
                  marginBottom: "0.05in"
                }}>
                  {edu.degree}
                </div>
              )}

              {/* Third line: Major/Field as bullet */}
              {edu.major && (
                <div style={{
                  fontSize: "11pt",
                  marginLeft: "0.2in",
                  marginBottom: "0.05in"
                }}>
                  • {edu.major}
                </div>
              )}

              {/* Special note (for flight school entries) */}
              {edu.specialNote && (
                <div style={{
                  fontSize: "11pt",
                  marginTop: "0.05in"
                }}>
                  {edu.specialNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
