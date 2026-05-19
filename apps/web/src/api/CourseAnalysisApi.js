import apiServerClient from '@/lib/apiServerClient';

/**
 * Generates a new course analysis using the Anthropic API
 * @param {Object} courseData - { courseId, courseTitle, courseDescription, pdfUrl }
 * @returns {Promise<Object>} - { resume, objectifs, taches, points_cles }
 */
export const generateCourseAnalysis = async (courseData) => {
  const response = await apiServerClient.fetch('/courses/analyze-course', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate course analysis');
  }

  return response.json();
};

/**
 * Fetches an existing course analysis from the database, or generates one if it doesn't exist
 * @param {string} courseId - The ID of the course
 * @returns {Promise<Object>} - { courseId, resume, objectifs, taches, points_cles }
 */
export const getCourseAnalysis = async (courseId) => {
  const response = await apiServerClient.fetch(`/courses/${courseId}/generate-analysis`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch or generate course analysis (${response.status})`);
  }

  return response.json();
};

/**
 * Generates fallback analysis content when PDF analysis fails or is unavailable
 * @param {Object} course - The course object from PocketBase
 * @returns {Object} - { resume, objectifs, taches, points_cles }
 */
export const generateFallbackAnalysis = (course) => {
  const title = course?.titre || 'Ce cours';
  const desc = course?.description || 'Découvrez les concepts fondamentaux et développez vos compétences.';

  return {
    resume: `${title} est conçu pour vous aider à maîtriser les concepts clés. ${desc.substring(0, 150)}${desc.length > 150 ? '...' : ''}`,
    objectifs: [
      `Comprendre les principes de base de ${title}`,
      'Acquérir des compétences pratiques applicables immédiatement',
      'Développer une expertise approfondie dans le domaine',
      'Se préparer aux défis réels du secteur'
    ],
    taches: [
      'Suivre attentivement les modules vidéo',
      'Compléter les exercices pratiques proposés',
      'Réviser les concepts clés régulièrement',
      'Appliquer les connaissances dans un projet personnel'
    ],
    points_cles: [
      'Fondamentaux théoriques solides',
      'Approche orientée vers la pratique',
      'Progression étape par étape',
      'Validation des acquis'
    ]
  };
};