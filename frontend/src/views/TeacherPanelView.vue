<template>
  <div class="teacher-panel">
    <h1 class="panel-title">
      <BaseIcon name="academic" class="w-6 h-6 text-accent inline-block mr-2 align-bottom" />
      Bảng điều khiển Giảng viên
      <span class="panel-title__badge">Giảng viên</span>
    </h1>

    <!-- Analytics Grid -->
    <section class="analytics-section">
      <h2 class="section-heading">Thống kê lớp học</h2>
      <div class="analytics-grid">
        <div v-for="metric in analyticsCards" :key="metric.label" class="metric-card">
          <span class="metric-card__value">{{ metric.value }}</span>
          <span class="metric-card__label">{{ metric.label }}</span>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <div class="panel-tabs flex border-b border-white/10 gap-6 mb-8 mt-2">
      <button 
        type="button" 
        class="pb-3 text-lg font-bold transition-all relative cursor-pointer"
        :class="activeTab === 'quizzes' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'"
        @click="activeTab = 'quizzes'"
      >
        Quản lý Trắc nghiệm
      </button>
      <button 
        type="button" 
        class="pb-3 text-lg font-bold transition-all relative cursor-pointer"
        :class="activeTab === 'courses' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'"
        @click="activeTab = 'courses'"
      >
        Quản lý Khóa học & Bài giảng
      </button>
      <button 
        type="button" 
        class="pb-3 text-lg font-bold transition-all relative cursor-pointer"
        :class="activeTab === 'students' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'"
        @click="activeTab = 'students'"
      >
        Quản lý Học viên
      </button>
      <button 
        type="button" 
        class="pb-3 text-lg font-bold transition-all relative cursor-pointer"
        :class="activeTab === 'analytics' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'"
        @click="activeTab = 'analytics'"
      >
        Báo cáo & Phân tích
      </button>
    </div>

    <!-- TAB 1: Quiz Management -->
    <section v-if="activeTab === 'quizzes'" class="quiz-manage-section">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 class="section-heading m-0">Quản lý ngân hàng câu hỏi trắc nghiệm</h2>
        <div class="flex gap-2">
          <button 
            type="button" 
            class="btn-toggle-form" 
            :class="{ 'btn-toggle-form--active': activeFormType === 'manual' }"
            @click="toggleForm('manual')"
          >
            <span v-if="activeFormType === 'manual'"><BaseIcon name="close" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Đóng Form</span>
            <span v-else><BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Tạo trắc nghiệm thủ công</span>
          </button>
          <button 
            type="button" 
            class="btn-toggle-form btn-toggle-form--excel" 
            :class="{ 'btn-toggle-form--active': activeFormType === 'excel' }"
            @click="toggleForm('excel')"
          >
            <span v-if="activeFormType === 'excel'"><BaseIcon name="close" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Đóng Form</span>
            <span v-else><BaseIcon name="export-share" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Nhập từ Excel</span>
          </button>
        </div>
      </div>

      <!-- Form Thêm / Chỉnh sửa Quiz thủ công -->
      <form v-if="activeFormType === 'manual'" class="quiz-form mb-8 animate-fade-in" @submit.prevent="submitQuiz">
        <h3 class="form-title-context">
          <span v-if="isEditMode"><BaseIcon name="edit" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Chỉnh sửa bài trắc nghiệm</span>
          <span v-else><BaseIcon name="plus" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Thêm câu hỏi trắc nghiệm mới</span>
        </h3>
        <div class="form-row">
          <label class="form-label">Tiêu đề trắc nghiệm</label>
          <input v-model="newQuiz.title" class="form-input" placeholder="VD: Cơ bản về danh sách liên kết" required />
        </div>
        <div class="form-row">
          <label class="form-label">Chủ đề</label>
          <select v-model="newQuiz.topic" class="form-select" required>
            <option value="" disabled selected>Chọn chủ đề...</option>
            <option value="sorting">Sắp xếp</option>
            <option value="graph">Đồ thị</option>
            <option value="oop">Hướng đối tượng</option>
            <option value="solid">Nguyên lý SOLID</option>
            <option value="di">DI/IoC (Dependency Injection)</option>
            <option value="array">Mảng tĩnh & Mảng động</option>
            <option value="linked-list">Danh sách liên kết</option>
            <option value="design-patterns">Mẫu thiết kế</option>
          </select>
        </div>
        <div class="form-row form-row--inline">
          <div>
            <label class="form-label">Độ khó</label>
            <select v-model="newQuiz.difficulty" class="form-select">
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>
          <div>
            <label class="form-label">XP thưởng</label>
            <input v-model.number="newQuiz.xpReward" type="number" class="form-input" min="10" max="500" />
          </div>
        </div>

        <!-- Questions -->
        <div class="questions-section">
          <h3 class="questions-heading">
            Câu hỏi ({{ newQuiz.questions.length }})
            <button type="button" class="btn-add-q" @click="addQuestion">+ Thêm câu</button>
          </h3>
          <div v-for="(q, qi) in newQuiz.questions" :key="qi" class="question-block">
            <div class="question-block__header">
              <span class="question-block__num">Câu {{ qi + 1 }}</span>
              <button v-if="newQuiz.questions.length > 1" type="button" class="btn-remove" @click="removeQuestion(qi)">×</button>
            </div>
            <input v-model="q.text" class="form-input" placeholder="Nội dung câu hỏi..." required />
            <div class="options-grid">
              <div v-for="(_, oi) in q.options" :key="oi" class="option-row">
                <input type="radio" :name="'correct-' + qi" :value="oi" v-model="q.correctIndex" />
                <input v-model="q.options[oi]" class="form-input form-input--sm" :placeholder="'Đáp án ' + String.fromCharCode(65 + oi)" required />
              </div>
            </div>
            <input v-model="q.explanation" class="form-input form-input--sm" placeholder="Giải thích đáp án đúng..." />
          </div>
        </div>

        <div class="form-actions flex justify-center gap-3">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Đang gửi...' : isEditMode ? 'Cập nhật bài trắc nghiệm' : 'Thêm bài trắc nghiệm vào hệ thống' }}
          </button>
          <button type="button" class="btn-cancel" @click="cancelEdit">
            {{ isEditMode ? 'Hủy' : 'Đóng' }}
          </button>
        </div>
        <div class="text-center">
          <p v-if="submitMessage" class="submit-message" :class="{ 'submit-message--error': submitError }">
            {{ submitMessage }}
          </p>
        </div>
      </form>

      <!-- Import Excel Component -->
      <div v-if="activeFormType === 'excel'" class="mb-8 animate-fade-in">
        <ExcelQuizImporter @import-success="onImportSuccess" />
      </div>

      <!-- Danh sách Quiz hiện có (CRUD Panel) -->
      <div class="quizzes-list-container">
        <h3 class="subsection-heading mb-4">Danh sách bài trắc nghiệm đang hoạt động</h3>
        <div v-if="loadingQuizzes" class="loading-state">
          <div class="spinner"></div>
          <span>Đang tải danh sách bài trắc nghiệm...</span>
        </div>
        <div v-else-if="quizzesList.length === 0" class="empty-state">
          Chưa có bài trắc nghiệm nào trong hệ thống. Hãy tạo mới!
        </div>
        <div v-else class="table-responsive">
          <table class="quizzes-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Chủ đề</th>
                <th>Độ khó</th>
                <th>XP Thưởng</th>
                <th>Số câu hỏi</th>
                <th class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="q in quizzesList" :key="q.id">
                <tr @click="toggleQuizAccordion(String(q.id))" class="cursor-pointer hover:bg-white/5 transition-colors">
                  <td class="font-bold text-white">
                    <span class="inline-block mr-1 transition-transform duration-200" :style="expandedQuizId === String(q.id) ? 'transform: rotate(90deg)' : ''">▶</span>
                    {{ q.title }}
                  </td>
                  <td>
                    <span class="topic-badge" :class="'topic-' + q.topic">
                      {{ formatTopic(q.topic) }}
                    </span>
                  </td>
                  <td>
                    <span class="diff-badge" :class="'diff-' + q.difficulty">
                      {{ formatDifficulty(q.difficulty) }}
                    </span>
                  </td>
                  <td class="font-mono text-amber-400 font-bold"><BaseIcon name="diamond" class="w-4 h-4 text-amber-400 inline mr-1 align-text-bottom" />+{{ q.xpReward }} XP</td>
                  <td class="font-mono text-slate-300">{{ q.questionCount }} câu</td>
                  <td>
                    <div class="flex justify-center gap-2" @click.stop>
                      <button type="button" class="btn-action btn-action--edit" @click="editQuiz(q.id)" title="Chỉnh sửa">
                        <BaseIcon name="edit" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Sửa
                      </button>
                      <button type="button" class="btn-action btn-action--delete" @click="deleteQuiz(q.id)" title="Xóa">
                        <BaseIcon name="trash" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- Accordion Row -->
                <tr v-if="expandedQuizId === String(q.id)" class="accordion-row">
                  <td colspan="6" class="accordion-cell">
                    <div v-if="loadingDetail[String(q.id)]" class="loading-detail py-4">
                      <div class="spinner spinner--sm"></div>
                      <span>Đang tải danh sách câu hỏi...</span>
                    </div>
                    <div v-else-if="quizDetails[String(q.id)]" class="quiz-detail-panel animate-fade-in">
                      <div class="flex justify-between items-center mb-4">
                        <h4 class="detail-title text-indigo-400 font-bold m-0"><BaseIcon name="quiz" class="w-4 h-4 text-indigo-400 inline mr-1 align-text-bottom" /> Chỉnh sửa câu hỏi con</h4>
                        <button type="button" class="btn-add-inline" @click="addInlineQuestion(String(q.id))">
                          <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Thêm câu hỏi mới
                        </button>
                      </div>

                      <div v-if="quizDetails[String(q.id)].questions.length === 0" class="empty-state py-4 text-center">
                        Bài trắc nghiệm này chưa có câu hỏi nào. Hãy thêm câu hỏi mới!
                      </div>
                      
                      <div v-for="(subQ, qi) in quizDetails[String(q.id)].questions" :key="qi" class="sub-question-card">
                        <div class="flex justify-between items-center mb-3">
                          <span class="sub-q-num text-amber-400 font-bold">Câu hỏi {{ Number(qi) + 1 }}</span>
                          <button type="button" class="btn-remove-inline" @click="removeInlineQuestion(String(q.id), Number(qi))">
                            <BaseIcon name="close" class="w-3 h-3 inline mr-1 align-text-bottom" /> Xóa câu này
                          </button>
                        </div>

                        <!-- Nhập câu hỏi -->
                        <div class="form-row">
                          <label class="form-label">Nội dung câu hỏi</label>
                          <input v-model="subQ.text" class="form-input" placeholder="Nhập nội dung câu hỏi..." />
                        </div>

                        <!-- Các đáp án -->
                        <div class="options-grid">
                          <div v-for="(_, oi) in subQ.options" :key="oi" class="option-row">
                            <input type="radio" :name="'correct-inline-' + String(q.id) + '-' + qi" :value="oi" v-model="subQ.correctIndex" />
                            <input v-model="subQ.options[oi]" class="form-input form-input--sm" :placeholder="'Đáp án ' + String.fromCharCode(65 + Number(oi))" />
                          </div>
                        </div>

                        <!-- Giải thích -->
                        <div class="form-row">
                          <label class="form-label">Giải thích đáp án đúng</label>
                          <input v-model="subQ.explanation" class="form-input form-input--sm" placeholder="Giải thích vì sao đáp án này đúng..." />
                        </div>
                      </div>

                      <div class="flex justify-end gap-2 mt-4">
                        <button type="button" class="btn-save-inline" @click="saveInlineQuiz(String(q.id))" :disabled="savingDetail[String(q.id)]">
                          <span v-if="savingDetail[String(q.id)]">Đang lưu...</span>
                          <span v-else><BaseIcon name="save" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Lưu tất cả thay đổi</span>
                        </button>
                        <button type="button" class="btn-close-inline" @click="expandedQuizId = null">
                          Đóng
                        </button>
                      </div>
                      <p v-if="inlineError[String(q.id)]" class="text-rose-400 text-sm mt-2 text-right">
                        {{ inlineError[String(q.id)] }}
                      </p>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- PB-304: Quiz Performance Analytics Report -->
        <div class="quizzes-report-container mt-10 p-6 rounded-2xl border border-white/10 bg-slate-900/40">
          <h3 class="subsection-heading mb-2 flex items-center gap-2 text-white">
            <BaseIcon name="chart-bar" class="w-5 h-5 text-indigo-400" />
            Báo cáo hiệu suất bài tập trắc nghiệm
          </h3>
          <p class="text-xs text-slate-400 mb-6">Thống kê tổng hợp điểm số trung bình và tỷ lệ đậu theo từng chủ đề bài thi.</p>

          <div v-if="loadingAnalytics" class="text-center py-6 text-slate-500">
            Đang tải dữ liệu báo cáo...
          </div>
          <div v-else-if="!quizPerformanceStats.length" class="text-center py-6 text-slate-500">
            Chưa có lượt làm bài nào để thống kê hiệu suất.
          </div>
          <div v-else class="table-responsive">
            <table class="quizzes-table">
              <thead>
                <tr>
                  <th>Tên bài trắc nghiệm</th>
                  <th>Chủ đề</th>
                  <th class="text-center">Tổng lượt làm</th>
                  <th class="text-center">Lượt đậu</th>
                  <th class="text-center">Điểm TB (%)</th>
                  <th class="text-center">Tỷ lệ đậu (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in quizPerformanceStats" :key="stat.quizId">
                  <td class="font-bold text-white">{{ stat.title }}</td>
                  <td>
                    <span class="topic-badge" :class="'topic-' + stat.topic">
                      {{ formatTopic(stat.topic) }}
                    </span>
                  </td>
                  <td class="text-center font-mono font-bold text-slate-300">{{ stat.totalAttempts }} lượt</td>
                  <td class="text-center font-mono text-emerald-400">{{ stat.passedCount }} lượt</td>
                  <td class="text-center font-mono text-indigo-300 font-bold">{{ stat.avgScore }}%</td>
                  <td class="text-center">
                    <span 
                      class="px-2 py-0.5 rounded-lg text-xs font-bold font-mono"
                      :class="stat.passRatePercent >= 70 ? 'bg-emerald-500/10 text-emerald-400' : stat.passRatePercent >= 40 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'"
                    >
                      {{ stat.passRatePercent }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 2: Course & Lesson Management -->
    <section v-else-if="activeTab === 'courses'" class="course-manage-section">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 class="section-heading m-0">Quản lý khóa học & bài giảng</h2>
        <button 
          type="button" 
          class="btn-toggle-form" 
          :class="{ 'btn-toggle-form--active': activeCourseForm !== 'none' }"
          @click="toggleCourseForm()"
        >
          <span v-if="activeCourseForm !== 'none'"><BaseIcon name="close" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Đóng Form</span>
          <span v-else><BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Tạo khóa học mới</span>
        </button>
      </div>

      <!-- Form Create/Edit Course -->
      <form v-if="activeCourseForm !== 'none'" class="quiz-form mb-8 animate-fade-in" @submit.prevent="submitCourse">
        <h3 class="form-title-context">
          <span v-if="activeCourseForm === 'edit'"><BaseIcon name="edit" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Chỉnh sửa khóa học</span>
          <span v-else><BaseIcon name="plus" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Tạo khóa học mới</span>
        </h3>
        <div class="form-row">
          <label class="form-label">Tiêu đề khóa học</label>
          <input v-model="courseForm.title" class="form-input" placeholder="VD: Thuật toán Sắp xếp Cơ bản" required />
        </div>
        <div class="form-row">
          <label class="form-label">Mô tả ngắn</label>
          <textarea v-model="courseForm.description" class="form-input h-24 py-2" placeholder="Nhập mô tả chi tiết khóa học..." required></textarea>
        </div>
        <div class="form-row form-row--inline">
          <div>
            <label class="form-label">Danh mục</label>
            <select v-model="courseForm.category" class="form-select">
              <option value="sorting">Sắp xếp (Sorting)</option>
              <option value="graph">Đồ thị (Graph)</option>
              <option value="oop">Hướng đối tượng (OOP)</option>
              <option value="solid">Nguyên lý SOLID</option>
              <option value="patterns">Mẫu thiết kế (Patterns)</option>
              <option value="system">Thiết kế hệ thống (System)</option>
            </select>
          </div>
          <div>
            <label class="form-label">Độ khó</label>
            <select v-model="courseForm.difficulty" class="form-select">
              <option value="Easy">Dễ</option>
              <option value="Medium">Trung bình</option>
              <option value="Hard">Khó</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">Đường dẫn ảnh bìa (Cover Image URL)</label>
          <input v-model="courseForm.coverImageUrl" class="form-input" placeholder="http://example.com/cover.jpg" />
        </div>
        <div class="form-row flex items-center gap-6 mt-4">
          <label class="flex items-center gap-2 cursor-pointer text-slate-300 text-sm">
            <input type="checkbox" v-model="courseForm.isPremium" />
            Yêu cầu tài khoản Premium
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-slate-300 text-sm">
            <input type="checkbox" v-model="courseForm.isPublished" />
            Xuất bản khóa học ngay
          </label>
        </div>

        <div class="form-actions flex justify-center gap-3 mt-6">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Đang gửi...' : activeCourseForm === 'edit' ? 'Cập nhật khóa học' : 'Tạo khóa học' }}
          </button>
          <button type="button" class="btn-cancel" @click="cancelCourseEdit">Hủy</button>
        </div>
      </form>

      <!-- Form Create/Edit Lesson -->
      <form v-if="activeLessonForm !== 'none'" class="quiz-form mb-8 animate-fade-in" @submit.prevent="submitLesson">
        <h3 class="form-title-context">
          <span v-if="activeLessonForm === 'edit'"><BaseIcon name="edit" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Chỉnh sửa bài giảng</span>
          <span v-else><BaseIcon name="plus" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Thêm bài giảng vào khóa: {{ activeCourseForLesson?.title }}</span>
        </h3>
        <div class="form-row">
          <label class="form-label">Tiêu đề bài giảng</label>
          <input v-model="lessonForm.title" class="form-input" placeholder="VD: Sắp xếp Nổi bọt (Bubble Sort)" required />
        </div>
        <div class="form-row">
          <label class="form-label">Nội dung bài giảng (Markdown)</label>
          <textarea v-model="lessonForm.contentMd" class="form-input h-48 py-2 font-mono text-sm leading-relaxed" placeholder="# Tiêu đề lớn&#10;- Ý chính 1&#10;- Ý chính 2&#10;**Chữ in đậm**" required></textarea>
        </div>
        <div class="form-row form-row--inline">
          <div>
            <label class="form-label">Không gian tương tác (Sandbox)</label>
            <select v-model="lessonForm.sandboxType" class="form-select">
              <option value="">Không có sandbox</option>
              <option value="sorting">Sắp xếp (Sorting)</option>
              <option value="graph">Đồ thị (Graph)</option>
              <option value="oop">Hướng đối tượng (OOP)</option>
              <option value="solid">Nguyên lý SOLID</option>
              <option value="patterns">Mẫu thiết kế (Patterns)</option>
              <option value="system">Thiết kế hệ thống (System)</option>
            </select>
          </div>
          <div>
            <label class="form-label">Bài trắc nghiệm liên kết (Không bắt buộc)</label>
            <select v-model="lessonForm.quizId" class="form-select">
              <option :value="null">Không liên kết quiz</option>
              <option v-for="q in quizzesList" :key="q.id" :value="q.id">
                {{ q.title }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-row form-row--inline">
          <div>
            <label class="form-label">XP Thưởng hoàn thành</label>
            <input type="number" v-model.number="lessonForm.xpReward" class="form-input" min="10" max="200" required />
          </div>
          <div>
            <label class="form-label">Thứ tự bài giảng (Index)</label>
            <input type="number" v-model.number="lessonForm.orderIndex" class="form-input" min="1" required />
          </div>
        </div>

        <div class="form-actions flex justify-center gap-3 mt-6">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Đang gửi...' : activeLessonForm === 'edit' ? 'Cập nhật bài giảng' : 'Tạo bài giảng' }}
          </button>
          <button type="button" class="btn-cancel" @click="cancelLessonEdit">Hủy</button>
        </div>
      </form>

      <!-- Course List -->
      <div class="quizzes-list-container">
        <h3 class="subsection-heading mb-4">Danh sách khóa học hiện có</h3>
        <div v-if="loadingCourses" class="loading-state">
          <div class="spinner"></div>
          <span>Đang tải danh sách khóa học...</span>
        </div>
        <div v-else-if="coursesList.length === 0" class="empty-state">
          Chưa có khóa học nào trong hệ thống. Hãy tạo mới!
        </div>
        <div v-else class="table-responsive">
          <table class="quizzes-table">
            <thead>
              <tr>
                <th>Tiêu đề khóa học</th>
                <th>Danh mục</th>
                <th>Độ khó</th>
                <th>Yêu cầu</th>
                <th>Số bài học</th>
                <th class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="c in coursesList" :key="c.id">
                <tr @click="toggleCourseAccordion(String(c.id))" class="cursor-pointer hover:bg-white/5 transition-colors">
                  <td class="font-bold text-white">
                    <span class="inline-block mr-1 transition-transform duration-200" :style="expandedCourseId === String(c.id) ? 'transform: rotate(90deg)' : ''">▶</span>
                    {{ c.title }}
                  </td>
                  <td>
                    <span class="topic-badge" :class="'topic-' + c.category">
                      {{ formatTopic(c.category) }}
                    </span>
                  </td>
                  <td>
                    <span class="diff-badge" :class="'diff-' + c.difficulty?.toLowerCase()">
                      {{ formatDifficulty(c.difficulty?.toLowerCase()) }}
                    </span>
                  </td>
                  <td class="font-bold">
                    <span v-if="c.isPremium" class="text-amber-400">👑 Premium</span>
                    <span v-else class="text-slate-400">Miễn phí</span>
                  </td>
                  <td class="font-mono text-slate-300">{{ c.totalLessons }} bài</td>
                  <td>
                    <div class="flex justify-center gap-2" @click.stop>
                      <button type="button" class="btn-action btn-action--edit" @click="editCourse(c)" title="Chỉnh sửa">
                        <BaseIcon name="edit" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Sửa
                      </button>
                      <button type="button" class="btn-action btn-action--delete" @click="deleteCourse(c.id)" title="Xóa">
                        <BaseIcon name="trash" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Course Accordion for Lessons list -->
                <tr v-if="expandedCourseId === String(c.id)" class="accordion-row">
                  <td colspan="6" class="accordion-cell">
                    <div v-if="loadingCourseLessons[String(c.id)]" class="loading-detail py-4">
                      <div class="spinner spinner--sm"></div>
                      <span>Đang tải danh sách bài học...</span>
                    </div>
                    <div v-else class="quiz-detail-panel animate-fade-in">
                      <div class="flex justify-between items-center mb-4">
                        <h4 class="detail-title text-indigo-400 font-bold m-0"><BaseIcon name="academic" class="w-4 h-4 text-indigo-400 inline mr-1 align-text-bottom" /> Danh sách bài giảng của khóa</h4>
                        <button type="button" class="btn-add-inline" @click="addNewLessonToCourse(c)">
                          <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Thêm bài giảng mới
                        </button>
                      </div>

                      <div v-if="!courseLessons[String(c.id)] || courseLessons[String(c.id)].length === 0" class="empty-state py-4 text-center">
                        Khóa học này chưa có bài giảng nào. Hãy thêm mới!
                      </div>
                      <div v-else class="space-y-3">
                        <div v-for="l in courseLessons[String(c.id)]" :key="l.id" class="sub-question-card flex justify-between items-center p-4 border border-white/5 bg-slate-950/20 rounded-xl">
                          <div>
                            <span class="text-xs text-indigo-300 font-mono mr-2">#{{ l.orderIndex }}</span>
                            <span class="text-sm font-bold text-white">{{ l.title }}</span>
                            <div class="flex gap-3 text-xs text-slate-400 mt-1">
                              <span>⚡ {{ l.xpReward }} XP</span>
                              <span v-if="l.sandboxType" class="text-indigo-400 uppercase text-[10px] font-bold">{{ l.sandboxType }}</span>
                              <span v-if="l.quizId" class="text-purple-400 text-[10px]">Có liên kết quiz</span>
                            </div>
                          </div>
                          <div class="flex gap-2">
                            <button type="button" class="btn-action btn-action--edit" @click="editLesson(l, c)">
                              Sửa
                            </button>
                            <button type="button" class="btn-action btn-action--delete" @click="deleteLesson(l.id, c.id)">
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 3: Student Directory & Detailed Progress -->
    <section v-else-if="activeTab === 'students'" class="students-manage-section">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 class="section-heading m-0 text-white">Quản lý & Theo dõi tiến trình học viên</h2>
        <!-- Search bar -->
        <div class="flex gap-2 w-full sm:w-auto">
          <input 
            v-model="searchStudentQuery" 
            @input="debouncedSearchStudents"
            class="form-input form-input--sm w-64" 
            placeholder="Tìm theo email hoặc username..." 
          />
        </div>
      </div>

      <div class="quizzes-list-container">
        <div v-if="loadingStudents" class="loading-state">
          <div class="spinner"></div>
          <span>Đang tải danh sách học viên...</span>
        </div>
        <div v-else-if="studentsList.length === 0" class="empty-state">
          Không tìm thấy học viên nào phù hợp với từ khóa tìm kiếm.
        </div>
        <div v-else class="table-responsive">
          <table class="quizzes-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Cấp độ</th>
                <th>Tích lũy XP</th>
                <th>Streak hiện tại</th>
                <th>Ngày tham gia</th>
                <th class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in studentsList" :key="student.id">
                <td class="font-bold text-white">
                  <div class="flex flex-col">
                    <span>{{ student.username }}</span>
                    <span class="text-xs text-slate-400 font-normal">{{ student.email }}</span>
                  </div>
                </td>
                <td class="font-bold text-indigo-300">Cấp {{ student.currentLevel ?? 1 }}</td>
                <td class="font-mono text-amber-400 font-bold">+{{ student.totalXP ?? 0 }} XP</td>
                <td class="font-mono text-purple-400">{{ student.streakDays ?? 0 }} ngày 🔥</td>
                <td class="text-slate-400 text-xs">{{ formatDate(student.createdAt) }}</td>
                <td>
                  <div class="flex justify-center">
                    <button 
                      type="button" 
                      class="btn-action btn-action--edit" 
                      @click="viewStudentProgress(student)"
                    >
                      <BaseIcon name="eye" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Xem chi tiết
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-6">
            <span class="text-xs text-slate-400">Hiển thị {{ studentsList.length }} học viên (Tổng số: {{ totalStudents }})</span>
            <div class="flex gap-2">
              <button 
                :disabled="studentsPage === 1" 
                @click="changeStudentsPage(-1)" 
                class="btn-cancel px-3 py-1.5 text-xs disabled:opacity-50 cursor-pointer"
              >
                Trước
              </button>
              <span class="text-xs font-mono text-white flex items-center px-2">Trang {{ studentsPage }} / {{ totalStudentsPages }}</span>
              <button 
                :disabled="studentsPage >= totalStudentsPages" 
                @click="changeStudentsPage(1)" 
                class="btn-cancel px-3 py-1.5 text-xs disabled:opacity-50 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Progress Detail Modal -->
      <div v-if="selectedStudentForProgress" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
        <div class="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
          <!-- Modal Header -->
          <div class="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
            <div>
              <h3 class="text-xl font-black text-white">Chi tiết tiến trình: {{ selectedStudentForProgress.username }}</h3>
              <p class="text-xs text-slate-400 mt-1">Email: {{ selectedStudentForProgress.email }} &middot; Cấp độ: {{ selectedStudentForProgress.currentLevel }} &middot; XP: {{ selectedStudentForProgress.totalXP }} XP</p>
            </div>
            <button @click="selectedStudentForProgress = null" class="text-slate-400 hover:text-white text-2xl font-bold p-1 cursor-pointer">&times;</button>
          </div>

          <!-- Modal Body (Two-column layout scrollable) -->
          <div class="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
            <!-- Left Column: Course Progress -->
            <div class="flex flex-col gap-4">
              <h4 class="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2">
                <BaseIcon name="learning-path" class="w-4 h-4 text-indigo-400" />
                Tiến độ khóa học
              </h4>

              <div v-if="loadingStudentCourseProgress" class="text-center py-6 text-slate-500 text-xs">
                Đang tải tiến độ học tập...
              </div>
              <div v-else-if="studentCourseProgress.length === 0" class="text-center py-6 text-slate-500 text-xs">
                Học viên chưa tham gia khóa học nào.
              </div>
              <div v-else class="space-y-4">
                <div v-for="course in studentCourseProgress" :key="course.id" class="p-4 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col gap-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-bold text-white">{{ course.title }}</span>
                    <span class="text-xs font-mono font-bold text-indigo-300">{{ course.progressPercent }}%</span>
                  </div>
                  <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                      :style="{ width: course.progressPercent + '%' }"
                    ></div>
                  </div>
                  <div class="text-[10px] text-slate-500 flex justify-between">
                    <span>Độ khó: {{ course.difficulty }}</span>
                    <span>Đã học: {{ course.completedLessons }} / {{ course.totalLessons }} bài giảng</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Quiz Attempts History -->
            <div class="flex flex-col gap-4">
              <h4 class="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-2">
                <BaseIcon name="quiz" class="w-4 h-4 text-purple-400" />
                Lịch sử làm bài trắc nghiệm
              </h4>

              <div v-if="loadingStudentQuizHistory" class="text-center py-6 text-slate-500 text-xs">
                Đang tải lịch sử thi trắc nghiệm...
              </div>
              <div v-else-if="studentQuizHistory.length === 0" class="text-center py-6 text-slate-500 text-xs">
                Học viên chưa thực hiện bài trắc nghiệm nào.
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="attempt in studentQuizHistory" 
                  :key="attempt.id" 
                  class="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span class="font-bold text-white block">{{ attempt.quizTitle }}</span>
                    <span class="text-[10px] text-slate-500">{{ formatAttemptDate(attempt.attemptedAt) }}</span>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="font-mono font-bold text-indigo-300">{{ attempt.score }} / {{ attempt.maxScore }}</span>
                    <span 
                      class="px-2 py-0.5 rounded text-[10px] font-bold"
                      :class="attempt.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'"
                    >
                      {{ attempt.passed ? 'ĐẠT' : 'HỎNG' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="border-t border-white/10 pt-4 mt-4 flex justify-end">
            <button @click="selectedStudentForProgress = null" class="btn-cancel px-5 py-2 text-xs font-bold rounded-xl cursor-pointer">
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 4: Course Analytics -->
    <section v-else-if="activeTab === 'analytics'" class="analytics-manage-section animate-fade-in mt-6">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 class="section-heading m-0 text-white">Thống kê & Phân tích chi tiết khóa học</h2>
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-slate-400 uppercase">Chọn khóa học:</label>
          <select 
            v-model="selectedCourseIdForAnalytics" 
            @change="loadCourseAnalytics" 
            class="form-select bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 w-64"
          >
            <option value="" disabled>-- Chọn khóa học --</option>
            <option v-for="c in coursesList" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingAnalyticsData" class="loading-state py-12 flex flex-col items-center justify-center gap-3">
        <div class="spinner inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <span class="text-slate-400 text-xs">Đang tải số liệu thống kê...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!selectedCourseIdForAnalytics" class="empty-state py-12 text-center text-slate-500 text-xs bg-slate-900/20 border border-white/5 border-dashed rounded-3xl">
        Vui lòng chọn một khóa học ở trên để xem phân tích chi tiết.
      </div>

      <!-- Analytics Report Content -->
      <div v-else class="space-y-8 animate-fade-in">
        <!-- Metric Cards -->
        <div class="analytics-grid">
          <div class="metric-card bg-indigo-950/20 border border-indigo-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
            <span class="metric-card__value text-3xl font-black text-indigo-400">{{ analyticsData.totalStudents }}</span>
            <span class="metric-card__label text-xs font-bold text-slate-400 mt-1">Học viên tham gia</span>
          </div>
          <div class="metric-card bg-emerald-950/20 border border-emerald-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
            <span class="metric-card__value text-3xl font-black text-emerald-400">{{ analyticsData.averageCompletionRate }}%</span>
            <span class="metric-card__label text-xs font-bold text-slate-400 mt-1">Tỷ lệ hoàn thành TB</span>
          </div>
          <div class="metric-card bg-amber-950/20 border border-amber-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
            <span class="metric-card__value text-3xl font-black text-amber-400">{{ analyticsData.averageQuizScore }}</span>
            <span class="metric-card__label text-xs font-bold text-slate-400 mt-1">Điểm Quiz TB (100)</span>
          </div>
        </div>

        <!-- Lesson Distribution Detail -->
        <div class="quizzes-list-container p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
          <h3 class="text-sm font-bold text-white mb-4">Phân bổ tiến độ học viên theo bài học</h3>
          <div class="table-responsive overflow-x-auto">
            <table class="quizzes-table w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-slate-400 text-xs">
                  <th class="pb-3">Tên bài học</th>
                  <th class="pb-3 text-center">Thứ tự</th>
                  <th class="pb-3 text-center">Đang học (InProgress)</th>
                  <th class="pb-3 text-center">Hoàn thành (Completed)</th>
                  <th class="pb-3" style="width: 40%">Biểu đồ trực quan (Tỷ lệ hoàn thành)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in analyticsData.lessonDistribution" :key="l.lessonId" class="border-b border-white/5 text-xs hover:bg-white/[0.02] transition-colors">
                  <td class="py-4 font-bold text-white">{{ l.title }}</td>
                  <td class="py-4 text-center font-mono text-slate-400">#{{ l.orderIndex }}</td>
                  <td class="py-4 text-center font-mono text-amber-400 font-bold">{{ l.started }}</td>
                  <td class="py-4 text-center font-mono text-emerald-400 font-bold">{{ l.completed }}</td>
                  <td class="py-4">
                    <!-- CSS bar representing completion rate relative to total students -->
                    <div class="flex items-center gap-3">
                      <div class="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" 
                          :style="{ width: getCompletionPercent(l.completed) + '%' }"
                        ></div>
                      </div>
                      <span class="font-mono text-[10px] text-slate-400 w-12 text-right">
                        {{ getCompletionPercent(l.completed) }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import ExcelQuizImporter from '../features/core-learning/quiz/components/ExcelQuizImporter.vue';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';
const authStore = useAuthStore();

// Tab state
const activeTab = ref<'quizzes' | 'courses' | 'students' | 'analytics'>('quizzes');

// Course Analytics State
const selectedCourseIdForAnalytics = ref<string>('');
const loadingAnalyticsData = ref(false);
const analyticsData = ref({
  totalStudents: 0,
  averageCompletionRate: 0.0,
  averageQuizScore: 0.0,
  lessonDistribution: [] as any[]
});

function getCompletionPercent(completedCount: number): number {
  if (analyticsData.value.totalStudents === 0) return 0;
  return Math.round((completedCount / analyticsData.value.totalStudents) * 100);
}

async function loadCourseAnalytics() {
  if (!selectedCourseIdForAnalytics.value) return;
  loadingAnalyticsData.value = true;
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/concepts/teacher/courses/${selectedCourseIdForAnalytics.value}/analytics`,
      { headers: getAuthHeaders() }
    );
    if (res.ok) {
      analyticsData.value = await res.json();
    } else {
      alert('Không thể tải dữ liệu thống kê của khóa học.');
    }
  } catch (err) {
    console.error('Failed to load course analytics:', err);
  } finally {
    loadingAnalyticsData.value = false;
  }
}

interface QuestionForm {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const activeFormType = ref<'none' | 'manual' | 'excel'>('none');
const isEditMode = ref(false);
const editingQuizId = ref<string | null>(null);

const expandedQuizId = ref<string | null>(null);
const loadingDetail = ref<Record<string, boolean>>({});
const savingDetail = ref<Record<string, boolean>>({});
const quizDetails = ref<Record<string, any>>({});
const inlineError = ref<Record<string, string>>({});

const newQuiz = reactive({
  title: '',
  topic: '',
  difficulty: 'medium',
  xpReward: 50,
  questions: [createEmptyQuestion()] as QuestionForm[],
});

const submitting = ref(false);
const submitMessage = ref('');
const submitError = ref(false);

const quizzesList = ref<any[]>([]);
const loadingQuizzes = ref(false);

// ── Course & Lesson State ──────────────────────────────────────────────
const coursesList = ref<any[]>([]);
const loadingCourses = ref(false);
const expandedCourseId = ref<string | null>(null);
const courseLessons = ref<Record<string, any[]>>({});
const loadingCourseLessons = ref<Record<string, boolean>>({});

// Course Form
const activeCourseForm = ref<'none' | 'create' | 'edit'>('none');
const editingCourseId = ref<string | null>(null);
const courseForm = reactive({
  title: '',
  description: '',
  category: 'sorting',
  difficulty: 'Medium',
  isPremium: false,
  coverImageUrl: '',
  isPublished: true
});

// Lesson Form
const activeLessonForm = ref<'none' | 'create' | 'edit'>('none');
const editingLessonId = ref<string | null>(null);
const activeCourseForLesson = ref<any | null>(null);
const lessonForm = reactive({
  title: '',
  contentMd: '',
  sandboxType: 'sorting',
  sandboxConfig: '{}',
  quizId: null as string | null,
  xpReward: 20,
  orderIndex: 1
});

interface AnalyticsMetric {
  label: string;
  value: string | number;
}

const analyticsCards = ref<AnalyticsMetric[]>([
  { label: 'Tổng số bài trắc nghiệm', value: '—' },
  { label: 'Tổng số câu hỏi', value: '—' },
  { label: 'Tổng số người dùng', value: '—' },
  { label: 'Thành viên Premium', value: '—' },
]);

function createEmptyQuestion(): QuestionForm {
  return { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };
}

function addQuestion(): void {
  newQuiz.questions.push(createEmptyQuestion());
}

function removeQuestion(index: number): void {
  newQuiz.questions.splice(index, 1);
}

function toggleForm(type: 'manual' | 'excel'): void {
  if (activeFormType.value === type) {
    activeFormType.value = 'none';
    if (isEditMode.value) cancelEdit();
  } else {
    activeFormType.value = type;
    if (type !== 'manual' && isEditMode.value) cancelEdit();
  }
}

function cancelEdit(): void {
  isEditMode.value = false;
  editingQuizId.value = null;
  activeFormType.value = 'none';
  newQuiz.title = '';
  newQuiz.topic = '';
  newQuiz.difficulty = 'medium';
  newQuiz.xpReward = 50;
  newQuiz.questions = [createEmptyQuestion()];
  submitMessage.value = '';
}

function getAuthHeaders() {
  const token = authStore.getAccessToken() || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function loadAnalytics(): Promise<void> {
  loadingAnalytics.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/analytics`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return;
    const data = await res.json();
    analyticsCards.value = [
      { label: 'Tổng số bài trắc nghiệm', value: data.totalQuizzes },
      { label: 'Tổng số câu hỏi', value: data.totalQuestionsInBank },
      { label: 'Tổng số người dùng', value: data.totalUsers },
      { label: 'Thành viên Premium', value: data.premiumUsers },
    ];
    quizPerformanceStats.value = data.perQuizStats || [];
  } catch { /* analytics is optional */ }
  finally {
    loadingAnalytics.value = false;
  }
}

async function loadQuizzes(): Promise<void> {
  loadingQuizzes.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/all`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      quizzesList.value = await res.json();
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách quiz:', err);
  } finally {
    loadingQuizzes.value = false;
  }
}

// ── Course & Lesson Methods ───────────────────────────────────────────
async function loadCourses(): Promise<void> {
  loadingCourses.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      coursesList.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load courses:', err);
  } finally {
    loadingCourses.value = false;
  }
}

async function toggleCourseAccordion(courseId: string) {
  if (expandedCourseId.value === courseId) {
    expandedCourseId.value = null;
  } else {
    expandedCourseId.value = courseId;
    await loadCourseLessons(courseId);
  }
}

async function loadCourseLessons(courseId: string) {
  loadingCourseLessons.value[courseId] = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses/${courseId}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      courseLessons.value[courseId] = data.lessons;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingCourseLessons.value[courseId] = false;
  }
}

// Course CRUD
function toggleCourseForm() {
  if (activeCourseForm.value !== 'none') {
    cancelCourseEdit();
  } else {
    activeCourseForm.value = 'create';
  }
}

function cancelCourseEdit() {
  activeCourseForm.value = 'none';
  editingCourseId.value = null;
  courseForm.title = '';
  courseForm.description = '';
  courseForm.category = 'sorting';
  courseForm.difficulty = 'Medium';
  courseForm.isPremium = false;
  courseForm.coverImageUrl = '';
  courseForm.isPublished = true;
}

async function submitCourse() {
  submitting.value = true;
  try {
    const url = editingCourseId.value 
      ? `${BASE_URL}/api/v1/concepts/courses/${editingCourseId.value}`
      : `${BASE_URL}/api/v1/concepts/courses`;
    const method = editingCourseId.value ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(courseForm)
    });

    if (res.ok) {
      alert(editingCourseId.value ? 'Cập nhật khóa học thành công!' : 'Tạo khóa học thành công!');
      cancelCourseEdit();
      await loadCourses();
    } else {
      const err = await res.json();
      alert(err.message || 'Lỗi khi lưu khóa học.');
    }
  } catch (err) {
    console.error(err);
    alert('Không thể kết nối máy chủ.');
  } finally {
    submitting.value = false;
  }
}

function editCourse(c: any) {
  activeCourseForm.value = 'edit';
  editingCourseId.value = c.id;
  courseForm.title = c.title;
  courseForm.description = c.description;
  courseForm.category = c.category;
  courseForm.difficulty = c.difficulty ?? 'Medium';
  courseForm.isPremium = c.isPremium;
  courseForm.coverImageUrl = c.coverImageUrl;
  courseForm.isPublished = c.isPublished;
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

async function deleteCourse(courseId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa khóa học này? Tất cả bài giảng con liên quan sẽ bị xóa sạch!')) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      alert('Xóa khóa học thành công!');
      await loadCourses();
    }
  } catch (err) {
    console.error(err);
  }
}

// Lesson CRUD
function addNewLessonToCourse(c: any) {
  activeLessonForm.value = 'create';
  activeCourseForLesson.value = c;
  editingLessonId.value = null;
  lessonForm.title = '';
  lessonForm.contentMd = '';
  lessonForm.sandboxType = 'sorting';
  lessonForm.sandboxConfig = '{}';
  lessonForm.quizId = null;
  lessonForm.xpReward = 20;
  
  const currentLessons = courseLessons.value[c.id] ?? [];
  lessonForm.orderIndex = currentLessons.length + 1;
}

function cancelLessonEdit() {
  activeLessonForm.value = 'none';
  activeCourseForLesson.value = null;
  editingLessonId.value = null;
}

async function submitLesson() {
  if (!activeCourseForLesson.value) return;
  submitting.value = true;

  try {
    const url = editingLessonId.value
      ? `${BASE_URL}/api/v1/concepts/lessons/${editingLessonId.value}`
      : `${BASE_URL}/api/v1/concepts/courses/${activeCourseForLesson.value.id}/lessons`;
    const method = editingLessonId.value ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonForm)
    });

    if (res.ok) {
      alert(editingLessonId.value ? 'Cập nhật bài giảng thành công!' : 'Tạo bài giảng thành công!');
      const courseId = activeCourseForLesson.value.id;
      cancelLessonEdit();
      await loadCourseLessons(courseId);
      await loadCourses();
    } else {
      const err = await res.json();
      alert(err.message || 'Lỗi khi lưu bài giảng.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    submitting.value = false;
  }
}

function editLesson(l: any, c: any) {
  activeLessonForm.value = 'edit';
  activeCourseForLesson.value = c;
  editingLessonId.value = l.id;
  lessonForm.title = l.title;
  lessonForm.contentMd = l.contentMd;
  lessonForm.sandboxType = l.sandboxType;
  lessonForm.sandboxConfig = l.sandboxConfig ?? '{}';
  lessonForm.quizId = l.quizId;
  lessonForm.xpReward = l.xpReward;
  lessonForm.orderIndex = l.orderIndex;
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

async function deleteLesson(lessonId: string, courseId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa bài giảng này?')) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      alert('Xóa bài giảng thành công!');
      await loadCourseLessons(courseId);
      await loadCourses();
    }
  } catch (err) {
    console.error(err);
  }
}

// ── Existing Quiz Methods ─────────────────────────────────────────────
async function editQuiz(quizId: string): Promise<void> {
  submitMessage.value = '';
  submitError.value = false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${quizId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải chi tiết trắc nghiệm');
    const data = await res.json();

    isEditMode.value = true;
    editingQuizId.value = quizId;
    activeFormType.value = 'manual';

    newQuiz.title = data.title;
    newQuiz.topic = data.topic;
    newQuiz.difficulty = data.difficulty;
    newQuiz.xpReward = data.xpReward;
    newQuiz.questions = data.questions.map((q: any) => ({
      text: q.text,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? ''
    }));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err: any) {
    alert(err.message || 'Lỗi khi tải thông tin bài trắc nghiệm');
  }
}

async function deleteQuiz(quizId: string): Promise<void> {
  if (!confirm('Bạn có chắc chắn muốn xóa bài trắc nghiệm này?')) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Xóa bài trắc nghiệm thất bại');
    alert('Đã xóa bài trắc nghiệm thành công!');
    await loadQuizzes();
    await loadAnalytics();
  } catch (err: any) {
    alert(err.message || 'Lỗi không xác định khi xóa');
  }
}

async function submitQuiz(): Promise<void> {
  submitting.value = true;
  submitMessage.value = '';
  submitError.value = false;

  const payload = {
    id: isEditMode.value ? editingQuizId.value : '',
    title: newQuiz.title,
    topic: newQuiz.topic,
    difficulty: newQuiz.difficulty,
    xpReward: newQuiz.xpReward,
    questions: newQuiz.questions.map((q, i) => ({
      id: isEditMode.value ? `q${i + 1}` : `custom-q${i + 1}`,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
  };

  try {
    const url = isEditMode.value 
      ? `${BASE_URL}/api/v1/concepts/quiz/manage/${editingQuizId.value}`
      : `${BASE_URL}/api/v1/concepts/quiz/manage`;
      
    const res = await fetch(url, {
      method: isEditMode.value ? 'PUT' : 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? (isEditMode.value ? 'Cập nhật bài trắc nghiệm thất bại' : 'Thêm bài trắc nghiệm thất bại'));
    }
    
    submitMessage.value = isEditMode.value 
      ? 'Bài trắc nghiệm đã được cập nhật thành công!'
      : 'Bài trắc nghiệm đã được thêm thành công!';
      
    // Reset form
    isEditMode.value = false;
    editingQuizId.value = null;
    activeFormType.value = 'none';
    newQuiz.title = '';
    newQuiz.topic = '';
    newQuiz.difficulty = 'medium';
    newQuiz.xpReward = 50;
    newQuiz.questions = [createEmptyQuestion()];
    
    await loadQuizzes();
    await loadAnalytics();
  } catch (err: unknown) {
    submitError.value = true;
    submitMessage.value = err instanceof Error ? err.message : 'Lỗi không xác định';
  } finally {
    submitting.value = false;
  }
}

async function toggleQuizAccordion(quizId: string): Promise<void> {
  if (expandedQuizId.value === quizId) {
    expandedQuizId.value = null;
    return;
  }
  expandedQuizId.value = quizId;
  if (!quizDetails.value[quizId]) {
    await fetchQuizDetail(quizId);
  }
}

async function fetchQuizDetail(quizId: string): Promise<void> {
  loadingDetail.value[quizId] = true;
  inlineError.value[quizId] = '';
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${quizId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải chi tiết trắc nghiệm');
    quizDetails.value[quizId] = await res.json();
  } catch (err: any) {
    inlineError.value[quizId] = err.message || 'Lỗi khi tải chi tiết';
  } finally {
    loadingDetail.value[quizId] = false;
  }
}

function addInlineQuestion(quizId: string): void {
  if (!quizDetails.value[quizId]) return;
  quizDetails.value[quizId].questions.push({
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  });
}

function removeInlineQuestion(quizId: string, index: number): void {
  if (!quizDetails.value[quizId]) return;
  quizDetails.value[quizId].questions.splice(index, 1);
}

async function saveInlineQuiz(quizId: string): Promise<void> {
  savingDetail.value[quizId] = true;
  inlineError.value[quizId] = '';
  try {
    const payload = quizDetails.value[quizId];
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Cập nhật bài trắc nghiệm thất bại');
    }

    alert('Đã cập nhật các câu hỏi con thành công!');
    expandedQuizId.value = null;
    await loadQuizzes();
    await loadAnalytics();
  } catch (err: any) {
    inlineError.value[quizId] = err.message || 'Lỗi khi lưu thay đổi';
  } finally {
    savingDetail.value[quizId] = false;
  }
}

function onImportSuccess(): void {
  alert('Nhập danh sách trắc nghiệm từ Excel thành công!');
  activeFormType.value = 'none';
  loadQuizzes();
  loadAnalytics();
}

function formatTopic(topic: string): string {
  const map: Record<string, string> = {
    'sorting': 'Sắp xếp',
    'graph': 'Đồ thị',
    'oop': 'Hướng đối tượng',
    'solid': 'Nguyên lý SOLID',
    'di': 'DI/IoC',
    'array': 'Mảng',
    'linked-list': 'Danh sách liên kết',
    'design-patterns': 'Mẫu thiết kế'
  };
  return map[topic] || topic;
}

function formatDifficulty(diff: string): string {
  const map: Record<string, string> = {
    'easy': 'Dễ',
    'medium': 'Trung bình',
    'hard': 'Khó'
  };
  return map[diff] || diff;
}

// --- PB-701 & PB-702 & PB-305 State & Methods ---
const loadingAnalytics = ref(false);
const quizPerformanceStats = ref<any[]>([]);
const studentsList = ref<any[]>([]);
const loadingStudents = ref(false);
const searchStudentQuery = ref('');
const studentsPage = ref(1);
const totalStudents = ref(0);
const studentsPageSize = 10;

const totalStudentsPages = computed(() => {
  return Math.ceil(totalStudents.value / studentsPageSize) || 1;
});

const selectedStudentForProgress = ref<any | null>(null);
const studentCourseProgress = ref<any[]>([]);
const loadingStudentCourseProgress = ref(false);
const studentQuizHistory = ref<any[]>([]);
const loadingStudentQuizHistory = ref(false);

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN');
  } catch {
    return dateString;
  }
}

function formatAttemptDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

async function loadStudents(): Promise<void> {
  loadingStudents.value = true;
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/concepts/admin/users?page=${studentsPage.value}&pageSize=${studentsPageSize}&search=${encodeURIComponent(searchStudentQuery.value)}`,
      { headers: getAuthHeaders() }
    );
    if (res.ok) {
      const data = await res.json();
      studentsList.value = data.users || [];
      totalStudents.value = data.total || 0;
    }
  } catch (err) {
    console.error('Failed to load students:', err);
  } finally {
    loadingStudents.value = false;
  }
}

function changeStudentsPage(delta: number): void {
  const newPage = studentsPage.value + delta;
  if (newPage >= 1 && newPage <= totalStudentsPages.value) {
    studentsPage.value = newPage;
    loadStudents();
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSearchStudents(): void {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    studentsPage.value = 1;
    loadStudents();
  }, 400);
}

async function viewStudentProgress(student: any): Promise<void> {
  selectedStudentForProgress.value = student;
  loadingStudentCourseProgress.value = true;
  loadingStudentQuizHistory.value = true;
  
  studentCourseProgress.value = [];
  studentQuizHistory.value = [];
  
  // 1. Fetch course progress
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/concepts/courses?userId=${student.id}`,
      { headers: getAuthHeaders() }
    );
    if (res.ok) {
      studentCourseProgress.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch student course progress:', err);
  } finally {
    loadingStudentCourseProgress.value = false;
  }

  // 2. Fetch quiz history
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/concepts/quiz/history?userId=${student.id}`,
      { headers: getAuthHeaders() }
    );
    if (res.ok) {
      studentQuizHistory.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch student quiz history:', err);
  } finally {
    loadingStudentQuizHistory.value = false;
  }
}

onMounted(() => {
  loadAnalytics();
  loadQuizzes();
  loadStudents();
});
</script>

<style scoped>
.teacher-panel {
  padding: 2rem;
  min-height: 100%;
  overflow-y: auto;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-title__badge {
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 4px;
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
  font-weight: 700;
  text-transform: uppercase;
}

.section-heading {
  font-size: 1.1rem;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 1rem;
  font-weight: 500;
}

.subsection-heading {
  font-size: 1rem;
  color: var(--text-secondary, #94a3b8);
  font-weight: 500;
}

/* ── Analytics ──────────────────────────── */
.analytics-section {
  margin-bottom: 2.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
}

.metric-card__value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-card__label {
  font-size: 0.8rem;
  color: var(--text-tertiary, #64748b);
}

/* ── Quiz Form ──────────────────────────── */
.quiz-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
}

.form-title-context {
  font-size: 1rem;
  font-weight: 600;
  color: #818cf8;
  margin-top: 0;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.5rem;
}

.form-row {
  margin-bottom: 1rem;
}

.form-row--inline {
  display: flex;
  gap: 1rem;
}

.form-row--inline > div {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary, #94a3b8);
  margin-bottom: 0.35rem;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary, #e2e8f0);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus,
.form-select:focus {
  border-color: #6366f1;
}

.form-input--sm {
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
}

.form-select option {
  background: #1e1e2e;
  color: #e2e8f0;
}

/* ── Questions ──────────────────────────── */
.questions-section {
  margin-top: 1.5rem;
}

.questions-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 1rem;
}

.btn-add-q {
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.4);
  background: transparent;
  color: #818cf8;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add-q:hover {
  background: rgba(99, 102, 241, 0.1);
}

.question-block {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.question-block__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.question-block__num {
  font-size: 0.8rem;
  font-weight: 600;
  color: #818cf8;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #f87171;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.option-row input[type="radio"] {
  accent-color: #6366f1;
}

/* ── Actions ───────────────────────────── */
.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.btn-submit {
  padding: 0.7rem 2rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.15s, box-shadow 0.15s;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
}

.btn-cancel {
  padding: 0.7rem 2rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-toggle-form {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.25);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-form:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}

.btn-toggle-form--active {
  background: linear-gradient(135deg, #6366f1, #a855f7) !important;
  color: #fff !important;
  border-color: transparent !important;
}

.btn-toggle-form--excel {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.1);
}

.btn-toggle-form--excel:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.submit-message {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #34d399;
}

.submit-message--error {
  color: #f87171;
}

/* ── Quizzes List Table ────────────────── */
.quizzes-list-container {
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1.5rem;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.quizzes-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.quizzes-table th {
  padding: 0.75rem 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary, #94a3b8);
  font-weight: 600;
}

.quizzes-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text-primary, #e2e8f0);
}

.quizzes-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.01);
}

/* Badges */
.topic-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}
.topic-sorting { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
.topic-graph { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
.topic-oop { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
.topic-solid { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.topic-di { background: rgba(16, 185, 129, 0.15); color: #34d399; }

.diff-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
.diff-easy { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.diff-medium { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.diff-hard { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.btn-action {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  background: transparent;
}
.btn-action--edit {
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}
.btn-action--edit:hover {
  background: rgba(245, 158, 11, 0.1);
}
.btn-action--delete {
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}
.btn-action--delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Loading & Empty States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-secondary, #94a3b8);
  font-size: 0.95rem;
  gap: 1rem;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.m-0 { margin: 0; }
.font-bold { font-weight: 700; }
.text-white { color: #fff; }
.text-center { text-align: center; }
.font-mono { font-family: var(--font-mono); }
.text-amber-400 { color: #fbbf24; }
.text-slate-300 { color: #cbd5e1; }

/* ── Responsive ─────────────────────── */
@media (max-width: 768px) {
  .teacher-panel { padding: 1rem; }
  .panel-title { font-size: 1.2rem; }
  .analytics-grid { grid-template-columns: 1fr 1fr; }
  .form-row--inline { flex-direction: column; gap: 0.75rem; }
  .options-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .analytics-grid { grid-template-columns: 1fr; }
  .metric-card__value { font-size: 1.4rem; }
}

/* ── Accordion & Inline CRUD ────────── */
.cursor-pointer {
  cursor: pointer;
}
.inline-block {
  display: inline-block;
}
.mr-1 {
  margin-right: 0.25rem;
}
.transition-transform {
  transition-property: transform;
}
.duration-200 {
  transition-duration: 200ms;
}

.accordion-row {
  background: rgba(255, 255, 255, 0.01);
}

.accordion-cell {
  padding: 1.5rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.quiz-detail-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.sub-question-card {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.sub-question-card:last-child {
  margin-bottom: 0;
}

.btn-add-inline {
  font-size: 0.8rem;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.4);
  background: transparent;
  color: #34d399;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-add-inline:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.btn-remove-inline {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: transparent;
  color: #f87171;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-remove-inline:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
}

.btn-save-inline {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: box-shadow 0.15s;
}

.btn-save-inline:hover {
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
}

.btn-save-inline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-close-inline {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-close-inline:hover {
  background: rgba(255, 255, 255, 0.15);
}

.loading-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary, #94a3b8);
  font-size: 0.9rem;
}

.spinner--sm {
  width: 16px !important;
  height: 16px !important;
  border-width: 2px !important;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.text-rose-400 {
  color: #fb7185;
}

.text-indigo-400 {
  color: #818cf8;
}

.text-amber-400 {
  color: #fbbf24;
}

.text-right {
  text-align: right;
}

.text-sm {
  font-size: 0.875rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}
</style>
