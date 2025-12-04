import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, Calendar as CalendarIcon, Target } from "lucide-react";
import { format, differenceInMonths, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

interface MonthlyData {
  month: string;
  monthShort: string;
  hours: number;
}

interface FlightHoursPredictionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthlyHoursData: MonthlyData[];
  currentTotalHours: number;
}

export function FlightHoursPredictionsDialog({
  open,
  onOpenChange,
  monthlyHoursData,
  currentTotalHours,
}: FlightHoursPredictionsDialogProps) {
  const [targetHours, setTargetHours] = useState<string>("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [targetHoursByDate, setTargetHoursByDate] = useState<string>("");
  const [averageType, setAverageType] = useState<"6month" | "12month" | "custom">("6month");
  const [customAverage, setCustomAverage] = useState<string>("");
  const [predictions, setPredictions] = useState<{
    months: number;
    date: string;
  } | null>(null);
  const [requiredHoursPerMonth, setRequiredHoursPerMonth] = useState<{
    hoursPerMonth: number;
    monthsRemaining: number;
  } | null>(null);

  // Calculate averages
  const calculateAverages = () => {
    // Get the last 6 and 12 months of data
    const last6Months = monthlyHoursData.slice(-6);
    const last12Months = monthlyHoursData.length >= 12 ? monthlyHoursData.slice(-12) : monthlyHoursData;

    const sixMonthTotal = last6Months.reduce((sum, month) => sum + month.hours, 0);
    const twelveMonthTotal = last12Months.reduce((sum, month) => sum + month.hours, 0);

    const sixMonthAverage = last6Months.length > 0 ? sixMonthTotal / last6Months.length : 0;
    const twelveMonthAverage = last12Months.length > 0 ? twelveMonthTotal / last12Months.length : 0;

    return { sixMonthAverage, twelveMonthAverage };
  };

  const { sixMonthAverage, twelveMonthAverage } = calculateAverages();

  // Get the effective average based on user selection
  const getEffectiveAverage = (): number => {
    if (averageType === "custom") {
      const custom = parseFloat(customAverage);
      // Return 0 if invalid, but allow calculation if valid
      if (isNaN(custom) || custom < 0 || customAverage === "") {
        return 0;
      }
      return custom;
    } else if (averageType === "12month") {
      return twelveMonthAverage;
    } else {
      return sixMonthAverage;
    }
  };

  // Get the effective average - recalculated on every render to ensure it's current
  const effectiveAverage = getEffectiveAverage();

  const calculatePredictions = (target: number) => {
    const hoursNeeded = target - currentTotalHours;

    if (hoursNeeded <= 0) {
      return null;
    }

    // Always get fresh average value
    const avg = getEffectiveAverage();
    if (avg <= 0) {
      return null;
    }

    const calculateDate = (months: number) => {
      const date = new Date();
      date.setMonth(date.getMonth() + months);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    const months = Math.ceil(hoursNeeded / avg);

    return {
      months,
      date: calculateDate(months),
    };
  };

  const handleCalculate = () => {
    const target = parseFloat(targetHours);
    if (!isNaN(target) && target > 0) {
      const result = calculatePredictions(target);
      setPredictions(result);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCalculate();
    }
  };

  const calculateRequiredHoursPerMonth = () => {
    if (!targetDate || !targetHoursByDate) {
      setRequiredHoursPerMonth(null);
      return;
    }

    const target = parseFloat(targetHoursByDate);
    if (isNaN(target) || target <= 0) {
      setRequiredHoursPerMonth(null);
      return;
    }

    const hoursNeeded = target - currentTotalHours;
    if (hoursNeeded <= 0) {
      setRequiredHoursPerMonth(null);
      return;
    }

    const now = new Date();
    const targetDateStart = startOfMonth(targetDate);
    const nowStart = startOfMonth(now);

    // Calculate months between now and target date
    const monthsRemaining = differenceInMonths(targetDateStart, nowStart);

    if (monthsRemaining <= 0) {
      setRequiredHoursPerMonth(null);
      return;
    }

    const hoursPerMonth = hoursNeeded / monthsRemaining;

    setRequiredHoursPerMonth({
      hoursPerMonth,
      monthsRemaining,
    });
  };

  const handleDateCalculate = () => {
    calculateRequiredHoursPerMonth();
  };

  const handleDateKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleDateCalculate();
    }
  };

  // Auto-calculate when both date and hours are set
  useEffect(() => {
    if (targetDate && targetHoursByDate && parseFloat(targetHoursByDate) > 0) {
      const target = parseFloat(targetHoursByDate);
      if (isNaN(target) || target <= 0) {
        setRequiredHoursPerMonth(null);
        return;
      }

      const hoursNeeded = target - currentTotalHours;
      if (hoursNeeded <= 0) {
        setRequiredHoursPerMonth(null);
        return;
      }

      const now = new Date();
      const targetDateStart = startOfMonth(targetDate);
      const nowStart = startOfMonth(now);

      const monthsRemaining = differenceInMonths(targetDateStart, nowStart);

      if (monthsRemaining <= 0) {
        setRequiredHoursPerMonth(null);
        return;
      }

      const hoursPerMonth = hoursNeeded / monthsRemaining;

      setRequiredHoursPerMonth({
        hoursPerMonth,
        monthsRemaining,
      });
    } else {
      setRequiredHoursPerMonth(null);
    }
  }, [targetDate, targetHoursByDate, currentTotalHours]);

  // Recalculate predictions when average changes
  useEffect(() => {
    if (targetHours && parseFloat(targetHours) > 0) {
      const target = parseFloat(targetHours);
      const hoursNeeded = target - currentTotalHours;
      
      // Calculate average directly based on current selection
      let avg: number;
      if (averageType === "custom") {
        const custom = parseFloat(customAverage);
        if (isNaN(custom) || custom < 0 || customAverage === "" || customAverage.trim() === "") {
          setPredictions(null);
          return;
        }
        avg = custom;
      } else if (averageType === "12month") {
        avg = twelveMonthAverage;
      } else {
        avg = sixMonthAverage;
      }
      
      if (hoursNeeded <= 0 || avg <= 0) {
        setPredictions(null);
        return;
      }

      const months = Math.ceil(hoursNeeded / avg);
      const date = new Date();
      date.setMonth(date.getMonth() + months);
      const dateString = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

      setPredictions({
        months,
        date: dateString,
      });
    } else {
      setPredictions(null);
    }
  }, [averageType, customAverage, sixMonthAverage, twelveMonthAverage, targetHours, currentTotalHours]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setTargetHours("");
      setTargetDate(undefined);
      setTargetHoursByDate("");
      setAverageType("6month");
      setCustomAverage("");
      setPredictions(null);
      setRequiredHoursPerMonth(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Flight Hours Predictions
          </DialogTitle>
          <DialogDescription>
            Estimate how long it will take to reach your target total flight hours based on your recent flying activity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Total Hours</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <p className="text-2xl font-bold text-foreground">{currentTotalHours.toFixed(1)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Average</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4 space-y-2.5">
                <Select value={averageType} onValueChange={(value: "6month" | "12month" | "custom") => setAverageType(value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6month">6-Month Average ({sixMonthAverage.toFixed(1)} hrs/month)</SelectItem>
                    <SelectItem value="12month">12-Month Average ({twelveMonthAverage.toFixed(1)} hrs/month)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {averageType === "custom" ? (
                  <Input
                    type="number"
                    placeholder="Enter hours/month"
                    value={customAverage}
                    onChange={(e) => setCustomAverage(e.target.value)}
                    min="0"
                    step="0.1"
                    className="h-9 text-sm"
                  />
                ) : (
                  <div className="pt-0.5">
                    <p className="text-2xl font-bold text-foreground">{effectiveAverage.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">hrs/month</span></p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Input Section - Time to Reach Target */}
          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="target-hours" className="text-sm">Target Total Hours</Label>
              <div className="flex gap-2">
                <Input
                  id="target-hours"
                  type="number"
                  placeholder="e.g., 1500"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  onKeyPress={handleKeyPress}
                  min="0"
                  step="0.1"
                  className="h-9"
                />
                <Button onClick={handleCalculate} disabled={!targetHours || parseFloat(targetHours) <= 0} size="sm">
                  Calculate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Calculate when you'll reach your target based on your average flying rate</p>
            </div>
          </div>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Input Section - Required Hours Per Month */}
          <div className="space-y-2">
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="target-hours-by-date" className="text-sm">Target Total Hours</Label>
                <Input
                  id="target-hours-by-date"
                  type="number"
                  placeholder="e.g., 1500"
                  value={targetHoursByDate}
                  onChange={(e) => setTargetHoursByDate(e.target.value)}
                  onKeyPress={handleDateKeyPress}
                  min="0"
                  step="0.1"
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-9",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button 
                onClick={handleDateCalculate} 
                disabled={!targetDate || !targetHoursByDate || parseFloat(targetHoursByDate) <= 0}
                className="w-full h-9"
                size="sm"
              >
                <Target className="mr-2 h-4 w-4" />
                Calculate Required Hours/Month
              </Button>
              <p className="text-xs text-muted-foreground">Calculate how many hours per month you need to fly to reach your target by a specific date</p>
            </div>
          </div>

          {/* Predictions Results */}
          {predictions && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Estimated Time to Reach {targetHours} Hours
              </h3>

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium">
                    Based on {averageType === "custom" ? "Custom Average" : averageType === "12month" ? "12-Month Average" : "6-Month Average"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-base font-semibold">{predictions.date}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Approximately {predictions.months} {predictions.months === 1 ? "month" : "months"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Using {effectiveAverage.toFixed(1)} hrs/month average
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> These estimates are based on your selected average. Actual time may vary based on
                  changes in your flight schedule, weather, aircraft availability, and other factors.
                </p>
              </div>
            </div>
          )}

          {/* Required Hours Per Month Results */}
          {requiredHoursPerMonth && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Required Hours Per Month
              </h3>

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium">To Reach {targetHoursByDate} Hours by {targetDate ? format(targetDate, "MMMM yyyy") : ""}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2.5">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {requiredHoursPerMonth.hoursPerMonth.toFixed(1)} hrs/month
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You need to fly this many hours per month on average
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Hours Needed</p>
                          <p className="font-semibold text-sm">
                            {(parseFloat(targetHoursByDate) - currentTotalHours).toFixed(1)} hrs
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Months Remaining</p>
                          <p className="font-semibold text-sm">
                            {requiredHoursPerMonth.monthsRemaining} {requiredHoursPerMonth.monthsRemaining === 1 ? "month" : "months"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-start gap-2 text-xs">
                        <div className="mt-0.5">
                          {requiredHoursPerMonth.hoursPerMonth > effectiveAverage ? (
                            <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                          ) : (
                            <TrendingUp className="h-3.5 w-3.5 text-green-500 rotate-180" />
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {requiredHoursPerMonth.hoursPerMonth > effectiveAverage ? (
                            <>
                              This is <strong>{(requiredHoursPerMonth.hoursPerMonth - effectiveAverage).toFixed(1)} hrs/month more</strong> than your selected average ({effectiveAverage.toFixed(1)} hrs/month). 
                              You'll need to increase your flying activity to meet this goal.
                            </>
                          ) : (
                            <>
                              This is <strong>{(effectiveAverage - requiredHoursPerMonth.hoursPerMonth).toFixed(1)} hrs/month less</strong> than your selected average ({effectiveAverage.toFixed(1)} hrs/month). 
                              You're on track to meet this goal!
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
