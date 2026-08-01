-- ============================================================
-- VisualizationDSA - Demo Course Seeder
-- Usage: Run this SQL in your SQL Server database after migrations
-- ============================================================

-- ==========================================
-- 1. CREATE A TEACHER USER
-- ==========================================
DECLARE @TeacherId UNIQUEIDENTIFIER = 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890';
DECLARE @StudentId UNIQUEIDENTIFIER = 'B2C3D4E5-F6A7-8901-BCDE-F12345678901';
DECLARE @CourseId UNIQUEIDENTIFIER = NEWID();
DECLARE @ClassroomId UNIQUEIDENTIFIER = NEWID();
DECLARE @Module1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Module2Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Lesson1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Lesson2Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Lesson3Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Codelab1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Lesson4Id UNIQUEIDENTIFIER = NEWID();
DECLARE @ModuleItem1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @ModuleItem2Id UNIQUEIDENTIFIER = NEWID();
DECLARE @ModuleItem3Id UNIQUEIDENTIFIER = NEWID();
DECLARE @ModuleItem4Id UNIQUEIDENTIFIER = NEWID();
DECLARE @ProgressId UNIQUEIDENTIFIER = NEWID();

-- Teacher User
IF NOT EXISTS (SELECT 1 FROM [AspNetUsers] WHERE Id = @TeacherId)
BEGIN
    INSERT INTO [AspNetUsers] (Id, UserName, Email, NormalizedUserName, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp, FirstName, LastName, TotalXP, CurrentLevel, StreakDays, CreatedAt, UpdatedAt)
    VALUES (
        @TeacherId,
        'teacher_demo',
        'teacher@demo.com',
        'TEACHER_DEMO',
        'TEACHER@DEMO.COM',
        1,
        'AQAAAAEAACcQAAAAEKd8YqY6kF8xQ2xR3xP5xN7xM9xO1xP3xQ5xR7xS9xT1xU3xV5xW7xX9xY1xZ3x' +
        'a5xb7xc9xd1xe3xf5xg7xh9xi1xj3xk5xl7xm9xn1xo3xp5xq7xr9xs1xt3xu5xv7xw9xx1xy3xz5',
        'STAMP-TEACHER-001',
        'CONCURRENCY-TEACHER-001',
        N'Teacher',
        N'Demo',
        5000, 10, 30, GETUTCDATE(), GETUTCDATE()
    );
END

-- Student User
IF NOT EXISTS (SELECT 1 FROM [AspNetUsers] WHERE Id = @StudentId)
BEGIN
    INSERT INTO [AspNetUsers] (Id, UserName, Email, NormalizedUserName, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp, FirstName, LastName, TotalXP, CurrentLevel, StreakDays, CreatedAt, UpdatedAt)
    VALUES (
        @StudentId,
        'student_demo',
        'student@demo.com',
        'STUDENT_DEMO',
        'STUDENT@DEMO.COM',
        1,
        'AQAAAAEAACcQAAAAEKd8YqY6kF8xQ2xR3xP5xN7xM9xO1xP3xQ5xR7xS9xT1xU3xV5xW7xX9xY1xZ3x' +
        'a5xb7xc9xd1xe3xf5xg7xh9xi1xj3xk5xl7xm9xn1xo3xp5xq7xr9xs1xt3xu5xv7xw9xx1xy3xz5',
        'STAMP-STUDENT-001',
        'CONCURRENCY-STUDENT-001',
        N'Student',
        N'Demo',
        0, 1, 0, GETUTCDATE(), GETUTCDATE()
    );
END

-- ==========================================
-- 2. CREATE A COURSE
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM [Courses] WHERE Id = @CourseId)
BEGIN
    INSERT INTO [Courses] (Id, TeacherId, Title, Description, Category, Difficulty, IsPremium, CoverImageUrl, IsPublished, CreatedAt, IsDeleted)
    VALUES (
        @CourseId,
        @TeacherId,
        N'DSA Visualization Mastery',
        N'A comprehensive course on Data Structures and Algorithms with interactive visualizations. Learn sorting, searching, graph algorithms, and more through hands-on exercises.',
        'DSA',
        2, -- Medium
        0, -- Not premium
        '',
        1, -- Published
        GETUTCDATE(),
        0
    );
END

-- ==========================================
-- 3. CREATE A CLASSROOM (for enrollment)
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM [Classrooms] WHERE Id = @ClassroomId)
BEGIN
    INSERT INTO [Classrooms] (Id, Name, Description, IsAssigned, CreatedById, CreatedAt, UpdatedAt, IsDeleted)
    VALUES (
        @ClassroomId,
        N'DSA Class - Fall 2026',
        N'Classroom for DSA Visualization Mastery course',
        1,
        @TeacherId,
        GETUTCDATE(),
        GETUTCDATE(),
        0
    );
END

-- ==========================================
-- 4. CREATE COURSE MODULES
-- ==========================================
-- Module 1: Sorting Algorithms
IF NOT EXISTS (SELECT 1 FROM [CourseModules] WHERE Id = @Module1Id)
BEGIN
    INSERT INTO [CourseModules] (Id, CourseId, Title, Description, SortOrder, IsPublished, CreatedAt)
    VALUES (
        @Module1Id,
        @CourseId,
        N'Module 1: Sorting Algorithms',
        N'Learn the fundamentals of sorting algorithms from basic to advanced.',
        1,
        1,
        GETUTCDATE()
    );
END

-- Module 2: Graph Algorithms
IF NOT EXISTS (SELECT 1 FROM [CourseModules] WHERE Id = @Module2Id)
BEGIN
    INSERT INTO [CourseModules] (Id, CourseId, Title, Description, SortOrder, IsPublished, CreatedAt)
    VALUES (
        @Module2Id,
        @CourseId,
        N'Module 2: Graph Algorithms',
        N'Explore graph traversal, shortest path, and minimum spanning tree algorithms.',
        2,
        1,
        GETUTCDATE()
    );
END

-- ==========================================
-- 5. CREATE LESSONS
-- ==========================================
-- Lesson 1: Bubble Sort Theory (in Module 1)
IF NOT EXISTS (SELECT 1 FROM [Lessons] WHERE Id = @Lesson1Id)
BEGIN
    INSERT INTO [Lessons] (Id, CourseModuleId, Title, Description, Content, EstimatedDurationMinutes, SortOrder, IsPublished, CreatedById, CreatedAt)
    VALUES (
        @Lesson1Id,
        @Module1Id,
        N'Lesson 1: Bubble Sort',
        N'Learn how Bubble Sort works step by step with interactive visualization.',
        N'## Bubble Sort

Bubble Sort is the simplest sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.

### How It Works
1. Start from the first element
2. Compare each pair of adjacent items
3. Swap them if they are in the wrong order
4. Repeat until no swaps are needed

### Time Complexity
- **Best Case**: O(N) - when array is already sorted
- **Average Case**: O(N)
- **Worst Case**: O(N)

### Space Complexity
- O(1) - in-place sorting',
        5, -- 5 minutes
        1,
        1, -- Published
        @TeacherId,
        GETUTCDATE()
    );
END

-- Lesson 2: Quick Sort Theory (in Module 1)
IF NOT EXISTS (SELECT 1 FROM [Lessons] WHERE Id = @Lesson2Id)
BEGIN
    INSERT INTO [Lessons] (Id, CourseModuleId, Title, Description, Content, EstimatedDurationMinutes, SortOrder, IsPublished, CreatedById, CreatedAt)
    VALUES (
        @Lesson2Id,
        @Module1Id,
        N'Lesson 2: Quick Sort',
        N'Learn the Quick Sort divide-and-conquer algorithm with visualization.',
        N'## Quick Sort

Quick Sort is a divide-and-conquer algorithm that picks a pivot element and partitions the array around it.

### How It Works
1. Choose a pivot element
2. Partition the array so elements less than pivot are on the left, greater on the right
3. Recursively sort the left and right sub-arrays

### Time Complexity
- **Best Case**: O(N log N)
- **Average Case**: O(N log N)
- **Worst Case**: O(N) - when pivot is always the smallest/largest

### Space Complexity
- O(log N) - recursive call stack',
        10,
        2,
        1,
        @TeacherId,
        GETUTCDATE()
    );
END

-- Lesson 3: BFS Theory (in Module 2)
IF NOT EXISTS (SELECT 1 FROM [Lessons] WHERE Id = @Lesson3Id)
BEGIN
    INSERT INTO [Lessons] (Id, CourseModuleId, Title, Description, Content, EstimatedDurationMinutes, SortOrder, IsPublished, CreatedById, CreatedAt)
    VALUES (
        @Lesson3Id,
        @Module2Id,
        N'Lesson 1: Breadth-First Search (BFS)',
        N'Learn Breadth-First Search for graph traversal with interactive visualization.',
        N'## Breadth-First Search (BFS)

BFS is a graph traversal algorithm that explores all vertices at the present depth before moving on to vertices at the next depth level.

### How It Works
1. Start at the source node
2. Visit all neighboring nodes first
3. Then visit their neighbors
4. Continue until all reachable nodes are visited

### Time Complexity
- O(V + E) where V = vertices, E = edges

### Space Complexity
- O(V) for the queue and visited set',
        8,
        1,
        1,
        @TeacherId,
        GETUTCDATE()
    );
END

-- Lesson 4: Dijkstra Theory (in Module 2)
IF NOT EXISTS (SELECT 1 FROM [Lessons] WHERE Id = @Lesson4Id)
BEGIN
    INSERT INTO [Lessons] (Id, CourseModuleId, Title, Description, Content, EstimatedDurationMinutes, SortOrder, IsPublished, CreatedById, CreatedAt)
    VALUES (
        @Lesson4Id,
        @Module2Id,
        N'Lesson 2: Dijkstra Shortest Path',
        N'Learn Dijkstra algorithm for finding shortest paths in weighted graphs.',
        N'## Dijkstra Algorithm

Dijkstra algorithm finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edge weights.

### How It Works
1. Initialize distances: source = 0, all others = infinity
2. Pick the unvisited node with the smallest distance
3. Update distances of its neighbors
4. Mark the node as visited
5. Repeat until all nodes are visited

### Time Complexity
- O((V + E) log V) with priority queue

### Space Complexity
- O(V)',
        10,
        2,
        1,
        @TeacherId,
        GETUTCDATE()
    );
END

-- ==========================================
-- 6. CREATE CODELABS (ModuleItems)
-- ==========================================
-- Codelab 1: Bubble Sort Implementation (Lesson 1 codelab)
IF NOT EXISTS (SELECT 1 FROM [Codelabs] WHERE Id = @Codelab1Id)
BEGIN
    INSERT INTO [Codelabs] (Id, Title, Description, InitialCode, Difficulty, XPReward, MaxRuntimeMs, MaxMemoryBytes, AllowedLanguages, Constraints, CreatedById, CreatedAt, IsDeleted)
    VALUES (
        @Codelab1Id,
        N'Implement Bubble Sort',
        N'Write a function that sorts an integer array in ascending order using the Bubble Sort algorithm.',
        N'using System;

public class Solution {
    public int[] BubbleSort(int[] arr) {
        // TODO: Implement bubble sort
        return arr;
    }
}',
        1, -- Easy
        50, -- 50 XP
        3000, -- 3 seconds
        67108864, -- 64 MB
        N'csharp',
        N'- Array length: 1 to 1000
- Element values: -1000 to 1000',
        @TeacherId,
        GETUTCDATE(),
        0
    );
END

-- ==========================================
-- 7. CREATE MODULE ITEMS (link lessons + codelabs)
-- ==========================================
-- ModuleItem 1: Lesson 1 (Bubble Sort theory)
IF NOT EXISTS (SELECT 1 FROM [CourseModuleItems] WHERE Id = @ModuleItem1Id)
BEGIN
    INSERT INTO [CourseModuleItems] (Id, CourseModuleId, LessonId, CodelabId, Title, Description, SortOrder, ItemType, CreatedAt)
    VALUES (
        @ModuleItem1Id,
        @Module1Id,
        @Lesson1Id,
        @Codelab1Id,
        N'Bubble Sort - Theory & Practice',
        N'Learn Bubble Sort theory and implement it yourself.',
        1,
        N'Lesson+Codelab',
        GETUTCDATE()
    );
END

-- ModuleItem 2: Lesson 2 (Quick Sort theory)
IF NOT EXISTS (SELECT 1 FROM [CourseModuleItems] WHERE Id = @ModuleItem2Id)
BEGIN
    INSERT INTO [CourseModuleItems] (Id, CourseModuleId, LessonId, CodelabId, Title, Description, SortOrder, ItemType, CreatedAt)
    VALUES (
        @ModuleItem2Id,
        @Module1Id,
        @Lesson2Id,
        NULL, -- No codelab yet
        N'Quick Sort - Theory Only',
        N'Learn Quick Sort algorithm concept.',
        2,
        N'Lesson',
        GETUTCDATE()
    );
END

-- ModuleItem 3: Lesson 3 (BFS theory)
IF NOT EXISTS (SELECT 1 FROM [CourseModuleItems] WHERE Id = @ModuleItem3Id)
BEGIN
    INSERT INTO [CourseModuleItems] (Id, CourseModuleId, LessonId, CodelabId, Title, Description, SortOrder, ItemType, CreatedAt)
    VALUES (
        @ModuleItem3Id,
        @Module2Id,
        @Lesson3Id,
        NULL,
        N'BFS - Theory Only',
        N'Learn Breadth-First Search algorithm.',
        1,
        N'Lesson',
        GETUTCDATE()
    );
END

-- ModuleItem 4: Lesson 4 (Dijkstra theory)
IF NOT EXISTS (SELECT 1 FROM [CourseModuleItems] WHERE Id = @ModuleItem4Id)
BEGIN
    INSERT INTO [CourseModuleItems] (Id, CourseModuleId, LessonId, CodelabId, Title, Description, SortOrder, ItemType, CreatedAt)
    VALUES (
        @ModuleItem4Id,
        @Module2Id,
        @Lesson4Id,
        NULL,
        N'Dijkstra - Theory Only',
        N'Learn Dijkstra shortest path algorithm.',
        2,
        N'Lesson',
        GETUTCDATE()
    );
END

-- ==========================================
-- 8. CREATE CODELAB TEST CASES
-- ==========================================
-- Test Case 1 for Bubble Sort Codelab
IF NOT EXISTS (SELECT 1 FROM [CodelabTestCases] WHERE Id = NEWID())
BEGIN
    INSERT INTO [CodelabTestCases] (Id, CodelabId, Input, ExpectedOutput, IsHidden, ScoreWeight, OrderIndex, CreatedAt)
    VALUES (
        NEWID(),
        @Codelab1Id,
        N'[5, 2, 9, 1, 5, 6]',
        N'[1, 2, 5, 5, 6, 9]',
        0, -- Visible
        30, -- 30% weight
        1,
        GETUTCDATE()
    );
END

-- Test Case 2 for Bubble Sort Codelab
IF NOT EXISTS (SELECT 1 FROM [CodelabTestCases] WHERE Id = NEWID())
BEGIN
    INSERT INTO [CodelabTestCases] (Id, CodelabId, Input, ExpectedOutput, IsHidden, ScoreWeight, OrderIndex, CreatedAt)
    VALUES (
        NEWID(),
        @Codelab1Id,
        N'[10, -2, 4, 0]',
        N'[-2, 0, 4, 10]',
        0, -- Visible
        30, -- 30% weight
        2,
        GETUTCDATE()
    );
END

-- Test Case 3 (Hidden) for Bubble Sort Codelab
IF NOT EXISTS (SELECT 1 FROM [CodelabTestCases] WHERE Id = NEWID())
BEGIN
    INSERT INTO [CodelabTestCases] (Id, CodelabId, Input, ExpectedOutput, IsHidden, ScoreWeight, OrderIndex, CreatedAt)
    VALUES (
        NEWID(),
        @Codelab1Id,
        N'[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]',
        N'[1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]',
        1, -- Hidden
        40, -- 40% weight
        3,
        GETUTCDATE()
    );
END

-- ==========================================
-- 9. CREATE CODELAB TEMPLATES (starter code)
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM [CodelabTemplates] WHERE Id = NEWID())
BEGIN
    INSERT INTO [CodelabTemplates] (Id, CodelabId, Language, StarterCode, SolutionCode, IsDefault, CreatedAt)
    VALUES (
        NEWID(),
        @Codelab1Id,
        N'csharp',
        N'using System;

public class Solution {
    public int[] BubbleSort(int[] arr) {
        // TODO: Implement bubble sort
        return arr;
    }
}',
        N'using System;

public class Solution {
    public int[] BubbleSort(int[] arr) {
        int n = arr.Length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
}',
        1, -- Default template
        GETUTCDATE()
    );
END

-- ==========================================
-- 10. ENROLL STUDENT IN CLASSROOM
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM [ClassroomEnrollments] WHERE ClassroomId = @ClassroomId AND StudentId = @StudentId)
BEGIN
    INSERT INTO [ClassroomEnrollments] (Id, ClassroomId, StudentId, EnrolledAt, Status, ProgressPercent, CreatedAt)
    VALUES (
        NEWID(),
        @ClassroomId,
        @StudentId,
        GETUTCDATE(),
        0, -- Active
        0.0,
        GETUTCDATE()
    );
END

-- ==========================================
-- 11. CREATE CLASSROOM CURRICULUM (link modules to classroom)
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM [ClassroomModules] WHERE Id = NEWID())
BEGIN
    INSERT INTO [ClassroomModules] (Id, ClassroomId, CourseModuleId, Title, SortOrder, CreatedAt)
    VALUES (
        NEWID(),
        @ClassroomId,
        @Module1Id,
        N'Module 1: Sorting Algorithms',
        1,
        GETUTCDATE()
    );
END

-- ==========================================
-- 12. CREATE INITIAL PROGRESS TRACKING
-- ==========================================
-- Student progress on ModuleItem 1 (Bubble Sort)
IF NOT EXISTS (SELECT 1 FROM [UserModuleItemProgresses] WHERE UserId = @StudentId AND ModuleItemId = @ModuleItem1Id)
BEGIN
    INSERT INTO [UserModuleItemProgresses] (Id, UserId, ModuleItemId, Status, ProgressPercent, Score, Attempts, StartedAt, CreatedAt)
    VALUES (
        NEWID(),
        @StudentId,
        @ModuleItem1Id,
        0, -- NotStarted
        0.0,
        0,
        0,
        GETUTCDATE(),
        GETUTCDATE()
    );
END

-- ==========================================
-- 13. CREATE LESSON PROGRESS (initial)
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM [UserLessonProgresses] WHERE UserId = @StudentId AND LessonId = @Lesson1Id)
BEGIN
    INSERT INTO [UserLessonProgresses] (Id, UserId, LessonId, Status, ProgressPercent, LastActiveFrameIndex, LastScrollPercent, LastAccessedAt, CompletedAt, CreatedAt)
    VALUES (
        NEWID(),
        @StudentId,
        @Lesson1Id,
        0, -- NotStarted
        0.0,
        0,
        0.0,
        GETUTCDATE(),
        NULL,
        GETUTCDATE()
    );
END

-- ==========================================
-- PRINT SUMMARY
-- ==========================================
PRINT '=== Demo Course Seeded Successfully ===';
PRINT 'Course: DSA Visualization Mastery';
PRINT 'Teacher: teacher_demo';
PRINT 'Student: student_demo';
PRINT 'Classroom: DSA Class - Fall 2026';
PRINT 'Modules: 2 (Sorting + Graph)';
PRINT 'Lessons: 4 (Bubble Sort + Quick Sort + BFS + Dijkstra)';
PRINT 'Codelabs: 1 (Bubble Sort Implementation)';
PRINT 'Test Cases: 3 (2 visible + 1 hidden)';
PRINT 'Enrollment: student_demo enrolled in classroom';