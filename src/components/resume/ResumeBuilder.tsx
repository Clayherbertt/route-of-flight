import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, ArrowLeft, FileText, Download } from "lucide-react"
import { ResumeTemplate } from "./ResumeTemplate"
import { exportResumeToPDF } from "@/utils/resumePdfExport"

export interface ProfessionalExperience {
  id: string
  jobTitle: string
  company: string
  cityState?: string
  startDate: string
  endDate: string
  jobDuties: string[]
  aircraft: string
}

export interface Education {
  id: string
  schoolName: string
  degree: string
  major: string
  startDate: string
  endDate: string
  specialNote?: string
}

export interface ResumeData {
  fullName: string
  location: string
  email: string
  phone: string
  objective: string
  professionalExperience: ProfessionalExperience[]
  education: Education[]
  certificates: string[]
  typeRatings: string[]
  medicalAndOther: string[]
  instructorRatings: string[]
  flightHours: Record<string, number>
  selectedFlightHourCategories: string[]
}

const FLIGHT_HOUR_CATEGORIES = [
  "Total Time (TT)",
  "Pilot-in-Command (PIC) Time",
  "Second-in-Command (SIC) Time",
  "Multi-Engine Time (ME)",
  "Single-Engine Time (SE)",
  "Turbine PIC",
  "Turbine SIC",
  "Cross-Country (XC) Time",
  "Instrument Time (IFR / Actual Instrument)",
  "Simulated Instrument Time (Hood)",
  "Night Time"
]

export function ResumeBuilder() {
  const [currentStep, setCurrentStep] = useState(1)
  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: "",
    location: "",
    email: "",
    phone: "",
    objective: "",
    professionalExperience: [],
    education: [],
    certificates: [],
    typeRatings: [],
    medicalAndOther: [],
    instructorRatings: [],
    flightHours: {},
    selectedFlightHourCategories: []
  })
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [newCustomCategory, setNewCustomCategory] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const addProfessionalExperience = () => {
    setResumeData(prev => ({
      ...prev,
      professionalExperience: [
        ...prev.professionalExperience,
        {
          id: Date.now().toString(),
          jobTitle: "",
          company: "",
          cityState: "",
          startDate: "",
          endDate: "",
          jobDuties: [""],
          aircraft: "",
        }
      ]
    }))
  }

  const updateProfessionalExperience = (id: string, field: keyof ProfessionalExperience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      professionalExperience: prev.professionalExperience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }


  const removeProfessionalExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      professionalExperience: prev.professionalExperience.filter(exp => exp.id !== id)
    }))
  }

  const addJobDuty = (expId: string) => {
    setResumeData(prev => ({
      ...prev,
      professionalExperience: prev.professionalExperience.map(exp =>
        exp.id === expId
          ? { ...exp, jobDuties: [...exp.jobDuties, ""] }
          : exp
      )
    }))
  }

  const removeJobDuty = (expId: string, dutyIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      professionalExperience: prev.professionalExperience.map(exp =>
        exp.id === expId
          ? { ...exp, jobDuties: exp.jobDuties.filter((_, index) => index !== dutyIndex) }
          : exp
      )
    }))
  }

  const updateJobDuty = (expId: string, dutyIndex: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      professionalExperience: prev.professionalExperience.map(exp =>
        exp.id === expId
          ? {
              ...exp,
              jobDuties: exp.jobDuties.map((duty, index) => (index === dutyIndex ? value : duty))
            }
          : exp
      )
    }))
  }

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          schoolName: "",
          degree: "",
          major: "",
          startDate: "",
          endDate: "",
          specialNote: ""
        }
      ]
    }))
  }

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const toggleFlightHourCategory = (category: string) => {
    setResumeData(prev => {
      const isSelected = prev.selectedFlightHourCategories.includes(category)
      
      // Allow free selection/deselection - no restrictions
      return {
        ...prev,
        selectedFlightHourCategories: isSelected
          ? prev.selectedFlightHourCategories.filter(c => c !== category)
          : [...prev.selectedFlightHourCategories, category]
      }
    })
  }

  const addCustomCategory = () => {
    if (newCustomCategory.trim() && !customCategories.includes(newCustomCategory.trim())) {
      setCustomCategories(prev => [...prev, newCustomCategory.trim()])
      setResumeData(prev => ({
        ...prev,
        selectedFlightHourCategories: [...prev.selectedFlightHourCategories, newCustomCategory.trim()]
      }))
      setNewCustomCategory("")
    }
  }

  const updateFlightHours = (category: string, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value) || 0
    setResumeData(prev => ({
      ...prev,
      flightHours: {
        ...prev.flightHours,
        [category]: numValue
      }
    }))
  }

  const handleExportPDF = () => {
    exportResumeToPDF(resumeData)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">1) FULL NAME</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What is your full name exactly as you want it displayed at the top of your résumé?
              </p>
              <Input
                id="fullName"
                value={resumeData.fullName}
                onChange={(e) => setResumeData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder=""
              />
            </div>
            <div>
              <Label htmlFor="location">2) LOCATION</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What city and state should appear under your name? (e.g., "Scottsdale, AZ")
              </p>
              <Input
                id="location"
                value={resumeData.location}
                onChange={(e) => setResumeData(prev => ({ ...prev, location: e.target.value }))}
                placeholder=""
              />
            </div>
            <div>
              <Label htmlFor="email">3) EMAIL</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What email address should appear on the résumé?
              </p>
              <Input
                id="email"
                type="email"
                value={resumeData.email}
                onChange={(e) => setResumeData(prev => ({ ...prev, email: e.target.value }))}
                placeholder=""
              />
            </div>
            <div>
              <Label htmlFor="phone">4) PHONE NUMBER</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What phone number should appear on the résumé?
              </p>
              <Input
                id="phone"
                value={resumeData.phone}
                onChange={(e) => setResumeData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder=""
              />
            </div>
            <div>
              <Label htmlFor="objective">5) OBJECTIVE</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What is your specific objective line, in terms of the role you're seeking? (Example style: "FIRST OFFICER POSITION WITH [AIRLINE]" or similar, IN ALL CAPS.)
              </p>
              <Input
                id="objective"
                value={resumeData.objective}
                onChange={(e) => setResumeData(prev => ({ ...prev, objective: e.target.value.toUpperCase() }))}
                placeholder=""
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>6) PROFESSIONAL EXPERIENCE – POSITIONS</Label>
              <p className="text-sm text-muted-foreground mb-4">
                For each job you want listed, please provide the following information:
              </p>
            </div>
            {resumeData.professionalExperience.map((exp, index) => (
              <Card key={exp.id} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Job {index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProfessionalExperience(exp.id)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={exp.jobTitle}
                      onChange={(e) => updateProfessionalExperience(exp.id, "jobTitle", e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <Label>Company / Operator</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateProfessionalExperience(exp.id, "company", e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <Label>City/State</Label>
                    <Input
                      value={exp.cityState || ""}
                      onChange={(e) => updateProfessionalExperience(exp.id, "cityState", e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date (Month/Year)</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) => updateProfessionalExperience(exp.id, "startDate", e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div>
                      <Label>End Date (Month/Year or "Present")</Label>
                      <Input
                        value={exp.endDate}
                        onChange={(e) => updateProfessionalExperience(exp.id, "endDate", e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Job duties/description</Label>
                    {exp.jobDuties.map((duty, dutyIndex) => (
                      <div key={dutyIndex} className="flex gap-2 mb-2">
                        <Input
                          value={duty}
                          onChange={(e) => updateJobDuty(exp.id, dutyIndex, e.target.value)}
                          placeholder=""
                          className="flex-1"
                        />
                        {exp.jobDuties.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeJobDuty(exp.id, dutyIndex)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addJobDuty(exp.id)}
                      className="mt-2"
                    >
                      Add another job duty/description
                    </Button>
                  </div>
                  <div>
                    <Label>Aircraft / Fleet Used</Label>
                    <Input
                      value={exp.aircraft}
                      onChange={(e) => updateProfessionalExperience(exp.id, "aircraft", e.target.value)}
                      placeholder=""
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addProfessionalExperience}>
              Add Another Position
            </Button>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>7) EDUCATION</Label>
              <p className="text-sm text-muted-foreground mb-4">
                For each school or program, please provide the following information:
              </p>
            </div>
            {resumeData.education.map((edu, index) => (
              <Card key={edu.id} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Education {index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(edu.id)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>School Name</Label>
                    <Input
                      value={edu.schoolName}
                      onChange={(e) => updateEducation(edu.id, "schoolName", e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <Label>Degree Earned</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <Label>Major / Program</Label>
                    <Input
                      value={edu.major}
                      onChange={(e) => updateEducation(edu.id, "major", e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date (Month/Year)</Label>
                      <Input
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div>
                      <Label>End Date (Month/Year)</Label>
                      <Input
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Special Track or Note (optional)</Label>
                    <Input
                      value={edu.specialNote || ""}
                      onChange={(e) => updateEducation(edu.id, "specialNote", e.target.value)}
                      placeholder=""
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addEducation}>
              Add Another Education Entry
            </Button>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>8) CERTIFICATES AND RATINGS</Label>
              <p className="text-sm text-muted-foreground mb-4">
                List all your certificates, ratings, and credentials:
              </p>
            </div>
            <div>
              <Label>Pilot Certificates</Label>
              <p className="text-sm text-muted-foreground mb-2">
                (e.g., "Airline Transport Pilot, Airplane Multiengine Land", "Commercial Pilot Single Engine Land")
              </p>
              <Textarea
                value={resumeData.certificates.join("\n")}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  certificates: e.target.value.split("\n").filter(line => line.trim())
                }))}
                placeholder=""
                rows={3}
              />
            </div>
            <div>
              <Label>Type Ratings</Label>
              <p className="text-sm text-muted-foreground mb-2">
                (e.g., "Boeing 737", "Challenger 605/650")
              </p>
              <Textarea
                value={resumeData.typeRatings.join("\n")}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  typeRatings: e.target.value.split("\n").filter(line => line.trim())
                }))}
                placeholder=""
                rows={3}
              />
            </div>
            <div>
              <Label>Medical and Other Credentials</Label>
              <p className="text-sm text-muted-foreground mb-2">
                (e.g., "FAA First Class Medical", "FCC Radio Operator's Permit")
              </p>
              <Textarea
                value={resumeData.medicalAndOther.join("\n")}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  medicalAndOther: e.target.value.split("\n").filter(line => line.trim())
                }))}
                placeholder=""
                rows={3}
              />
            </div>
            <div>
              <Label>Instructor Ratings or Designations</Label>
              <p className="text-sm text-muted-foreground mb-2">
                (e.g., "CFI", "CFII", "Gold Seal", "Check Instructor")
              </p>
              <Textarea
                value={resumeData.instructorRatings.join("\n")}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  instructorRatings: e.target.value.split("\n").filter(line => line.trim())
                }))}
                placeholder=""
                rows={3}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label>9) FLIGHT HOURS – CATEGORY SELECTION</Label>
              <p className="text-sm text-muted-foreground mb-4">
                From the list below, select which flight-hour items you want to show in your FLIGHT HOURS section:
              </p>
              <p className="text-sm font-medium text-amber-600 mb-4">
                You must select exactly 3, 6, or 9 categories for proper formatting.
              </p>
            </div>
            <div className="space-y-2">
              {FLIGHT_HOUR_CATEGORIES.map(category => {
                const isSelected = resumeData.selectedFlightHourCategories.includes(category)
                
                return (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={isSelected}
                      onCheckedChange={() => toggleFlightHourCategory(category)}
                    />
                    <Label 
                      htmlFor={category} 
                      className="cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                )
              })}
            </div>
            <Separator />
            <div>
              <Label>Custom Categories</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Do you want to include any additional custom categories (e.g., "B-737", "CL-650", "Gulfstream 550")?
              </p>
              <div className="flex gap-2">
                <Input
                  value={newCustomCategory}
                  onChange={(e) => setNewCustomCategory(e.target.value)}
                  placeholder=""
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addCustomCategory()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCustomCategory}>
                  Add
                </Button>
              </div>
              {customCategories.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Custom Categories:</p>
                  {customCategories.map(cat => {
                    const isSelected = resumeData.selectedFlightHourCategories.includes(cat)
                    
                    return (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                          id={`custom-${cat}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleFlightHourCategory(cat)}
                        />
                        <Label 
                          htmlFor={`custom-${cat}`} 
                          className="cursor-pointer"
                        >
                          {cat}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )

      case 6:
        // Only show categories that are currently selected (filter out any stale selections)
        const validSelectedCategories = resumeData.selectedFlightHourCategories.filter(cat => 
          FLIGHT_HOUR_CATEGORIES.includes(cat) || customCategories.includes(cat)
        )
        
        return (
          <div className="space-y-4">
            <div>
              <Label>10) FLIGHT HOURS – NUMERIC TOTALS</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Please provide the numeric totals for each selected category:
              </p>
            </div>
            {validSelectedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories selected. Please go back and select at least one category.</p>
            ) : (
              validSelectedCategories.map(category => (
                <div key={category}>
                  <Label htmlFor={`hours-${category}`}>What is your {category}?</Label>
                  <Input
                    id={`hours-${category}`}
                    type="number"
                    value={resumeData.flightHours[category] || ""}
                    onChange={(e) => updateFlightHours(category, e.target.value)}
                    placeholder=""
                  />
                </div>
              ))
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Resume Preview</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Edit
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
        <div id="resume-content" className="bg-white p-8 max-w-4xl mx-auto">
          <ResumeTemplate data={resumeData} />
        </div>
      </div>
    )
  }

  const totalSteps = 6
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return resumeData.fullName && resumeData.location && resumeData.email && resumeData.phone && resumeData.objective
      case 2:
        return resumeData.professionalExperience.length > 0
      case 3:
        return resumeData.education.length > 0
      case 4:
        return true // Certificates are optional
      case 5:
        const selectedCount = resumeData.selectedFlightHourCategories.length
        // Only allow proceeding if exactly 3, 6, or 9 categories are selected
        return selectedCount === 3 || selectedCount === 6 || selectedCount === 9
      case 6:
        return resumeData.selectedFlightHourCategories.every(cat => 
          resumeData.flightHours[cat] !== undefined && resumeData.flightHours[cat] > 0
        )
      default:
        return false
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Builder</CardTitle>
        <CardDescription>
          Step {currentStep} of {totalSteps}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderStep()}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setShowPreview(true)} disabled={!canProceed()}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Resume
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

