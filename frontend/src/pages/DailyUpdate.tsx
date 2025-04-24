import { useEffect, useState } from "react";
import { standup, StandupEntry, ApiError } from "@/lib/api";
import { StandupForm } from "@/components/standup/StandupForm";
import { StandupView } from "@/components/standup/StandupView";
import { Loading } from "@/components/Loading";
import { PageWrapper } from "@/components/PageWrapper";

export function DailyUpdatePage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [todaysStandup, setTodaysStandup] = useState<StandupEntry | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<{
    yesterday: string;
    today: string;
    blockers: string;
  } | null>(null);

  useEffect(() => {
    async function fetchTodaysStandup() {
      try {
        setIsLoading(true);
        const result = await standup.checkTodaysEntry();
        if (result.hasSubmittedToday && result.standup) {
          const standup = result.standup;
          setTodaysStandup(standup);
          setFormValues({
            yesterday: standup.yesterday,
            today: standup.today,
            blockers: standup.blockers || ''
          });
        }
      } catch (error) {
        console.error("Failed to check today's standup:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTodaysStandup();
  }, []);

  const handleSubmit = async (yesterday: string, today: string, blockers: string) => {
    setError(null);
    setValidationErrors({});
    
    setFormValues({
      yesterday,
      today,
      blockers
    });
    
    try {
      setIsSubmitting(true);
      
      let response;
      
      if (isEditMode && todaysStandup) {
        response = await standup.update(
          todaysStandup._id, 
          yesterday, 
          today, 
          blockers
        );
      } else {
        response = await standup.create(yesterday, today, blockers);
      }
      
      setTodaysStandup(response);
      setIsEditMode(false);
      
    } catch (err: unknown) {
      // Direct access to typed properties
      if (err instanceof ApiError && err.validationErrors) {
        setValidationErrors(err.validationErrors);
        setError("Please fix the validation errors below.");
      } else {
        const action = isEditMode ? 'update' : 'submit';
        setError(`Failed to ${action} your standup. Please try again.`);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (todaysStandup) {
      setFormValues({
        yesterday: todaysStandup.yesterday,
        today: todaysStandup.today,
        blockers: todaysStandup.blockers || ''
      });
    }
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  return (
    <PageWrapper 
      title="Daily Update"
      maxWidth="4xl"
    >
      {isLoading ? (
        <Loading message="Loading today's standup status..." />
      ) : (
        <>
          {todaysStandup && !isEditMode ? (
            <StandupView 
              standup={todaysStandup} 
              onEdit={handleEdit} 
            />
          ) : (
            <StandupForm 
              onSubmit={handleSubmit}
              validationErrors={validationErrors}
              error={error}
              isSubmitting={isSubmitting}
              initialValues={formValues || undefined}
              isEditing={isEditMode}
              onCancel={handleCancel}
            />
          )}
        </>
      )}
    </PageWrapper>
  );
}
