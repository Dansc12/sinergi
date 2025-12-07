import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { motion } from 'framer-motion';
import { ChevronLeft, Info, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function PersonalDetailsScreen() {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleContinue = () => {
    if (data.biologicalSex && data.birthdate) {
      setCurrentStep(6);
    }
  };

  const isValid = data.biologicalSex && data.birthdate;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen"
    >
      <OnboardingProgress />
      
      <div className="flex-1 px-6 py-8">
        <button 
          onClick={() => setCurrentStep(4)}
          className="flex items-center gap-1 text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-2">Tell us about yourself</h1>
        <p className="text-muted-foreground mb-8">This helps us personalize your experience.</p>

        <div className="space-y-6">
          {/* Biological Sex */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-base font-medium">Biological Sex</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={16} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Used to calculate metabolic rate.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-3">
              {['male', 'female'].map((sex) => (
                <button
                  key={sex}
                  onClick={() => updateData({ biologicalSex: sex as 'male' | 'female' })}
                  className={cn(
                    "flex-1 py-4 rounded-xl border-2 font-medium transition-all capitalize",
                    data.biologicalSex === sex
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  {sex}
                </button>
              ))}
            </div>
          </div>

          {/* Birthdate */}
          <div>
            <Label className="text-base font-medium mb-3 block">Birthdate</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-14 rounded-xl",
                    !data.birthdate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {data.birthdate ? format(data.birthdate, "MMMM d, yyyy") : "Select your birthdate"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={data.birthdate || undefined}
                  onSelect={(date) => updateData({ birthdate: date || null })}
                  disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                  initialFocus
                  className="pointer-events-auto"
                  captionLayout="dropdown-buttons"
                  fromYear={1920}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Zip Code */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Zip Code <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter zip code"
              value={data.zipCode}
              onChange={(e) => updateData({ zipCode: e.target.value })}
              className="h-14 rounded-xl text-base"
              maxLength={10}
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <Button 
          size="xl" 
          className="w-full"
          disabled={!isValid}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
