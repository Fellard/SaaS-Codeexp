import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const EnrollmentForm = ({ courseId, onSuccess }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to enroll');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('course_enrollments').create({
        user_id: currentUser.id,
        course_id: courseId,
        progression: 0,
        complete: false
      }, { requestKey: null });
      
      toast.success('Successfully enrolled in course');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 active:scale-[0.98]"
    >
      {loading ? 'Enrolling...' : 'Enroll Now'}
    </Button>
  );
};

export default EnrollmentForm;