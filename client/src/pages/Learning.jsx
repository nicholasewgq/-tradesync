import { BookOpen, PlayCircle, FileText, Award } from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';

const courses = [
  {
    title: 'Technical Analysis Fundamentals',
    description: 'Learn the basics of chart reading and technical indicators',
    lessons: 12,
    duration: '2h 30m',
    level: 'Beginner',
    progress: 0
  },
  {
    title: 'Risk Management Mastery',
    description: 'Master position sizing and risk-reward strategies',
    lessons: 8,
    duration: '1h 45m',
    level: 'Intermediate',
    progress: 0
  },
  {
    title: 'Price Action Trading',
    description: 'Trade using pure price action without indicators',
    lessons: 15,
    duration: '3h 15m',
    level: 'Advanced',
    progress: 0
  },
  {
    title: 'Trading Psychology',
    description: 'Develop the mental edge for consistent trading',
    lessons: 10,
    duration: '2h',
    level: 'All Levels',
    progress: 0
  }
];

const resources = [
  { icon: FileText, title: 'Trading Glossary', description: 'Essential trading terms explained' },
  { icon: PlayCircle, title: 'Video Tutorials', description: 'Step-by-step video guides' },
  { icon: Award, title: 'Certifications', description: 'Earn badges as you learn' }
];

export function Learning() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Center</h1>
        <p className="text-gray-500 dark:text-gray-400">Improve your trading skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {resources.map(({ icon: Icon, title, description }) => (
          <Card key={title} hover className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          </Card>
        ))}
      </div>

      <CardTitle className="mb-4">Available Courses</CardTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.title} hover>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                course.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                course.level === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                course.level === 'Advanced' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                {course.level}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{course.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>{course.lessons} lessons</span>
              <span>{course.duration}</span>
            </div>

            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>

            <button className="mt-4 w-full py-2 rounded-lg border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              Start Course
            </button>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
            <p className="text-white/80">Interactive courses with real-time market analysis and live trading sessions.</p>
          </div>
          <div className="hidden md:block">
            <BookOpen className="w-16 h-16 text-white/30" />
          </div>
        </div>
      </Card>
    </div>
  );
}
