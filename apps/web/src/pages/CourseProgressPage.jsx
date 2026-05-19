import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CourseProgressPage = () => {
  const { currentUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const records = await pb.collection('course_enrollments').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        expand: 'course_id',
        sort: '-date_inscription',
        requestKey: null
      });
      setEnrollments(records);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Progress - IWS Smart Platform</title>
        <meta name="description" content="Track your learning progress across all courses" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ textWrap: 'balance' }}>
                My Learning Progress
              </h1>
              <p className="text-slate-600">Track your progress across all enrolled courses</p>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-2 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Circle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No enrolled courses yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">
                          {enrollment.expand?.course_id?.titre
                            || enrollment.expand?.course_id?.title_fr
                            || enrollment.expand?.course_id?.title
                            || 'Cours sans titre'}
                        </CardTitle>
                        {enrollment.complete && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">Overall Progress</span>
                            <span className="text-sm font-semibold text-slate-900">{enrollment.progression || 0}%</span>
                          </div>
                          <Progress value={enrollment.progression || 0} className="h-3" />
                        </div>
                        <p className="text-sm text-slate-600">
                          Enrolled on {new Date(enrollment.date_inscription).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CourseProgressPage;