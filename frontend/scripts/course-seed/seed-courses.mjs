import { beginnerCourse } from './data/beginner.mjs';
import { intermediateCourse } from './data/intermediate.mjs';
import { advancedCourse } from './data/advanced.mjs';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5055/api/v1/concepts';

const COURSES = [beginnerCourse, intermediateCourse, advancedCourse];

let accessToken = '';
let totalLessons = 0;
let totalModules = 0;

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const detail = data && typeof data === 'object' ? JSON.stringify(data) : text;
    throw new Error(`${method} ${path} -> ${res.status}: ${detail.slice(0, 300)}`);
  }
  return data;
}

async function login() {
  const email = process.env.ADMIN_EMAIL || 'demo@visualizationdsa.dev';
  const password = process.env.ADMIN_PASSWORD || 'Demo@2024';
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed (${res.status}): ${JSON.stringify(data)}`);
  accessToken = data.accessToken || data.AccessToken;
  if (!accessToken) throw new Error(`Login response has no accessToken: ${JSON.stringify(data)}`);
  console.log(`✅ Logged in as ${email} (role: ${data.user?.role ?? data.User?.Role})`);
}

async function createCourse(course) {
  const { courseId } = await request('/courses', {
    method: 'POST',
    body: {
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      expectedTime: course.expectedTime,
      category: course.category,
      difficulty: course.difficulty,
      isPremium: course.isPremium,
      isPublished: course.isPublished,
    },
  });
  console.log(`✅ Course created: "${course.title}" (id=${courseId})`);
  return courseId;
}

async function createModule(courseId, module, index) {
  const { moduleId } = await request(`/courses/${courseId}/modules`, {
    method: 'POST',
    body: { title: module.title, description: module.description, orderIndex: (index + 1) * 1000 },
  });
  totalModules++;
  console.log(`  ➕ Module: "${module.title}" (id=${moduleId})`);
  return moduleId;
}

async function createLesson(courseId, moduleId, lesson, index) {
  const { lessonId } = await request(`/courses/${courseId}/lessons`, {
    method: 'POST',
    body: {
      title: lesson.title,
      contentMd: lesson.contentMd,
      sandboxType: lesson.sandboxType,
      sandboxConfig: '{}',
      moduleId,
      xpReward: lesson.xpReward,
      orderIndex: (index + 1) * 10,
    },
  });
  totalLessons++;
  console.log(`    📘 Lesson: "${lesson.title}" (id=${lessonId}, sandbox=${lesson.sandboxType})`);
  return lessonId;
}

async function seedCourse(course) {
  const courseId = await createCourse(course);
  for (const [mIndex, module] of course.modules.entries()) {
    const moduleId = await createModule(courseId, module, mIndex);
    for (const [lIndex, lesson] of module.lessons.entries()) {
      await createLesson(courseId, moduleId, lesson, lIndex);
    }
  }
}

async function main() {
  await login();
  for (const course of COURSES) {
    await seedCourse(course);
  }
  console.log(`\n🎉 Done! Seeded ${COURSES.length} courses, ${totalModules} modules, ${totalLessons} lessons.`);
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
