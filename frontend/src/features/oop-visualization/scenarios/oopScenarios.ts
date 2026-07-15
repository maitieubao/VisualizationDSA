// ============================================================
// OOP Scenarios — Real-world C# examples with animation metadata
// Each step describes WHAT to animate (highlight, glow, arrow, shake)
// ============================================================

export type AnimationType =
  | 'highlight-class'       // Glow border on a class card
  | 'highlight-member'      // Pulse a specific field/method
  | 'create-object'         // Animate object creation (scale-up + fade-in)
  | 'arrow-flow'            // Animated dot traveling along an arrow
  | 'access-denied'         // Shake + red flash on a member
  | 'access-granted'        // Green flash on a member
  | 'inheritance-flow'      // Animate members flowing from parent to child
  | 'override-flash'        // Flash showing method being overridden
  | 'abstract-error'        // Error pulse on abstract class instantiation
  | 'compile-error'         // Compiler error highlight (red underline + tooltip)
  | 'polymorphic-dispatch'  // Arrow redirecting from declared type to actual type
  | 'interface-contract'    // Highlight interface "contract" being satisfied
  | 'multi-interface'       // Show a class signing multiple interface contracts
  | 'warning'               // Yellow caution pulse — "watch out for this"
  | 'compare'               // Side-by-side highlight of two code blocks
  | 'typewriter'            // Typewriter effect on a code line
  | 'none';

export interface AnimationTarget {
  className?: string;
  memberName?: string;       // Phải khớp PascalCase với khai báo trong codeLines
  fromClass?: string;
  toClass?: string;
  secondToClass?: string;    // Dùng cho polymorphic-dispatch nhiều đích (vòng lặp)
}

export interface ScenarioStep {
  codeLineRange: [number, number]; // [startLine, endLine] — 1 dòng thì [n, n]
  explanation: string;
  animation: AnimationType;
  animationTarget: AnimationTarget;
}

export interface OOPScenario {
  id: string;
  order: number;              // Thứ tự học khuyến nghị
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  prerequisiteIds: string[];  // Các bài cần học trước
  title: string;
  description: string;
  lessonQuestion: string;     // Opening question to engage learner
  keyTakeaways: string[];     // 2-3 điểm chốt hiển thị ở màn hình tổng kết
  codeLines: string[];
  steps: ScenarioStep[];
}

export const OOP_SCENARIOS: OOPScenario[] = [

  // ================================================================
  // 🔒 ENCAPSULATION — BankAccount
  // Thêm: constructor, Withdraw, animation compile-error
  // ================================================================
  {
    id: 'encapsulation',
    order: 1,
    difficultyLevel: 'beginner',
    prerequisiteIds: [],
    title: '🔒 Đóng gói (Encapsulation)',
    description: 'Bảo vệ dữ liệu bên trong lớp, chỉ cho phép truy cập qua phương thức công khai.',
    lessonQuestion: '💡 Nếu ai cũng được tự ý thay đổi số dư tài khoản ngân hàng, chuyện gì sẽ xảy ra?',
    keyTakeaways: [
      'private = chỉ code bên trong lớp mới được đọc/ghi trực tiếp',
      'Constructor là "cổng vào duy nhất lúc sinh ra" — đảm bảo đối tượng hợp lệ ngay từ đầu',
      'Public method kiểm soát mọi thay đổi — ngăn trạng thái không hợp lệ (số dư âm, giá trị rác...)',
    ],
    codeLines: [
      'public class BankAccount {',                              //  0
      '    private double balance;',                             //  1
      '',                                                        //  2
      '    // Constructor — cổng vào duy nhất lúc tạo đối tượng', //  3
      '    public BankAccount(double initialBalance) {',         //  4
      '        if (initialBalance >= 0)',                        //  5
      '            this.balance = initialBalance;',              //  6
      '    }',                                                   //  7
      '',                                                        //  8
      '    public void Deposit(double amount) {',                //  9
      '        if (amount > 0) this.balance += amount;',         // 10
      '    }',                                                   // 11
      '',                                                        // 12
      '    public bool Withdraw(double amount) {',               // 13
      '        if (amount > 0 && this.balance >= amount) {',     // 14
      '            this.balance -= amount;',                     // 15
      '            return true;',                                // 16
      '        }',                                               // 17
      '        return false; // Số dư không đủ',                // 18
      '    }',                                                   // 19
      '',                                                        // 20
      '    public double GetBalance() => this.balance;',         // 21
      '}',                                                       // 22
      '',                                                        // 23
      'BankAccount acc = new BankAccount(1000);',                // 24
      'acc.balance = 9999;     // ❌ Lỗi biên dịch! Private',   // 25
      'acc.Deposit(500);       // ✅ balance = 1500',            // 26
      'acc.Withdraw(200);      // ✅ balance = 1300',            // 27
      'acc.Withdraw(9999);     // ❌ Từ chối — không đủ số dư', // 28
      'acc.GetBalance();       // ✅ Đọc an toàn → 1300',       // 29
    ],
    steps: [
      {
        codeLineRange: [0, 22],
        explanation: '📦 Khai báo lớp BankAccount. Toàn bộ dữ liệu và logic được giữ bên trong — bên ngoài chỉ tương tác qua những cổng được cho phép. Hãy để ý: không có thứ gì public ngoài các method được chọn lọc kỹ.',
        animation: 'highlight-class',
        animationTarget: { className: 'BankAccount' },
      },
      {
        codeLineRange: [1, 1],
        explanation: '🔒 Trường `balance` là `private` — chỉ code BÊN TRONG BankAccount mới được đọc/ghi trực tiếp. Bên ngoài không thể chạm vào, kể cả đọc. Muốn biết số dư? Phải gọi `GetBalance()`.',
        animation: 'highlight-member',
        animationTarget: { className: 'BankAccount', memberName: 'balance' },
      },
      {
        codeLineRange: [4, 7],
        explanation: '🏗️ Constructor là "cổng vào duy nhất lúc sinh ra đối tượng". Ngay từ lúc tạo, ta kiểm tra `initialBalance >= 0` — không ai có thể tạo một tài khoản với số dư âm. Đây là cách đảm bảo đối tượng HỢP LỆ ngay từ đầu.',
        animation: 'highlight-member',
        animationTarget: { className: 'BankAccount', memberName: 'BankAccount' },
      },
      {
        codeLineRange: [9, 11],
        explanation: '🌐 `Deposit()` là `public` — ai cũng gọi được. Nhưng bên trong có bảo vệ: `amount > 0`, không thể "nạp" số tiền âm hay bằng 0 để lách quy định. Đây là logic kiểm soát mà `private balance` không thể tự làm được.',
        animation: 'highlight-member',
        animationTarget: { className: 'BankAccount', memberName: 'Deposit' },
      },
      {
        codeLineRange: [13, 19],
        explanation: '🏦 `Withdraw()` bảo vệ khỏi trạng thái không hợp lệ: kiểm tra đồng thời `amount > 0` VÀ `balance >= amount`. Rút quá số dư → trả về `false`, balance không thay đổi. Không có đóng gói, code bên ngoài có thể trừ thẳng vào balance mà không kiểm tra gì.',
        animation: 'highlight-member',
        animationTarget: { className: 'BankAccount', memberName: 'Withdraw' },
      },
      {
        codeLineRange: [24, 24],
        explanation: '🆕 Tạo đối tượng `acc` qua constructor, truyền số dư ban đầu là 1000. Constructor kiểm tra và gán — đối tượng ra đời đã ở trạng thái hợp lệ. Không có cách nào tạo BankAccount "rỗng" mà không qua cổng này.',
        animation: 'create-object',
        animationTarget: { className: 'BankAccount' },
      },
      {
        codeLineRange: [25, 25],
        explanation: '❌ LỖI BIÊN DỊCH! `acc.balance = 9999` — trình biên dịch từ chối ngay, không cho chạy. `balance` là `private`, không tồn tại với thế giới bên ngoài. Không phải lỗi runtime mà là lỗi ngay lúc viết code — C# bắt lỗi này sớm nhất có thể.',
        animation: 'compile-error',
        animationTarget: { className: 'BankAccount', memberName: 'balance' },
      },
      {
        codeLineRange: [26, 26],
        explanation: '✅ `Deposit(500)` — hợp lệ, balance tăng lên 1500. Phương thức public kiểm tra rồi mới cập nhật.',
        animation: 'access-granted',
        animationTarget: { className: 'BankAccount', memberName: 'Deposit' },
      },
      {
        codeLineRange: [27, 27],
        explanation: '✅ `Withdraw(200)` — hợp lệ, 200 < 1500 nên được rút. balance còn 1300.',
        animation: 'access-granted',
        animationTarget: { className: 'BankAccount', memberName: 'Withdraw' },
      },
      {
        codeLineRange: [28, 28],
        explanation: '❌ `Withdraw(9999)` — bị từ chối! 9999 > 1300 (số dư hiện tại), điều kiện `balance >= amount` không thỏa. Phương thức trả về `false`, balance giữ nguyên 1300. Đóng gói ngăn số dư rơi xuống âm.',
        animation: 'access-denied',
        animationTarget: { className: 'BankAccount', memberName: 'Withdraw' },
      },
    ],
  },

  // ================================================================
  // 🧬 INHERITANCE — Animal → Dog, Cat
  // Thêm: protected Name, animation phân biệt public/protected/private
  // ================================================================
  {
    id: 'inheritance',
    order: 2,
    difficultyLevel: 'beginner',
    prerequisiteIds: ['encapsulation'],
    title: '🧬 Kế thừa (Inheritance)',
    description: 'Lớp con thừa hưởng thuộc tính và phương thức từ lớp cha, tái sử dụng code hiệu quả.',
    lessonQuestion: '💡 Dog và Cat đều biết ăn và ngủ — viết lại code cho mỗi loài, hay chia sẻ chung?',
    keyTakeaways: [
      'public → lớp con kế thừa được, bên ngoài cũng thấy được',
      'protected → lớp con kế thừa được, nhưng bên ngoài KHÔNG thấy',
      'private → lớp con KHÔNG kế thừa được — chỉ lớp cha giữ riêng',
    ],
    codeLines: [
      'public class Animal {',                              //  0
      '    private int age;              // Chỉ Animal giữ', //  1
      '    protected string Name;        // Lớp con dùng được', //  2
      '    public void Eat()   { /* ... */ }',              //  3
      '    public void Sleep() { /* ... */ }',              //  4
      '}',                                                  //  5
      '',                                                   //  6
      'public class Dog : Animal {',                        //  7
      '    public void Fetch() { /* ... */ }',              //  8
      '    public void Introduce() {',                      //  9
      '        Console.WriteLine(Name);  // ✅ protected — OK', // 10
      '        Console.WriteLine(age);   // ❌ private — Lỗi!', // 11
      '    }',                                              // 12
      '}',                                                  // 13
      '',                                                   // 14
      'public class Cat : Animal {',                        // 15
      '    public void Purr() { /* ... */ }',               // 16
      '}',                                                  // 17
      '',                                                   // 18
      'Dog dog = new Dog();',                               // 19
      'dog.Eat();              // ✅ public — kế thừa OK',  // 20
      'dog.Fetch();            // ✅ riêng của Dog',        // 21
      'Console.WriteLine(dog.Name); // ❌ protected — bên ngoài không thấy', // 22
    ],
    steps: [
      {
        codeLineRange: [0, 5],
        explanation: '🐾 Lớp Animal chứa hành vi CHUNG. Chú ý ba mức truy cập được dùng đồng thời: `private age` (chỉ Animal giữ), `protected Name` (chia sẻ với lớp con), `public Eat/Sleep` (ai cũng dùng được).',
        animation: 'highlight-class',
        animationTarget: { className: 'Animal' },
      },
      {
        codeLineRange: [1, 1],
        explanation: '🔐 `private int age` — trường này KHÔNG được kế thừa. Kể cả Dog hay Cat cũng không thể đọc hay ghi `age`. Lớp cha đôi khi cần giữ riêng dữ liệu nhạy cảm ngay cả với lớp con.',
        animation: 'highlight-member',
        animationTarget: { className: 'Animal', memberName: 'age' },
      },
      {
        codeLineRange: [2, 2],
        explanation: '🛡️ `protected string Name` — đây là mức ở giữa: lớp con (Dog, Cat) có thể dùng trực tiếp, nhưng code bên ngoài (main program) không thấy. `protected` tạo ra "kênh riêng" giữa cha và con.',
        animation: 'highlight-member',
        animationTarget: { className: 'Animal', memberName: 'Name' },
      },
      {
        codeLineRange: [7, 13],
        explanation: '🐕 Dog kế thừa Animal bằng `: Animal`. Bên trong Dog, phương thức `Introduce()` dùng thử cả `Name` (protected) VÀ `age` (private) để minh họa sự khác biệt.',
        animation: 'highlight-class',
        animationTarget: { className: 'Dog' },
      },
      {
        codeLineRange: [10, 10],
        explanation: '✅ `Console.WriteLine(Name)` bên trong Dog — hoạt động! `Name` là `protected`, Dog là lớp con của Animal nên được phép truy cập trực tiếp.',
        animation: 'access-granted',
        animationTarget: { className: 'Dog', memberName: 'Name' },
      },
      {
        codeLineRange: [11, 11],
        explanation: '❌ `Console.WriteLine(age)` bên trong Dog — lỗi biên dịch! Dù Dog kế thừa Animal, `age` là `private` nên Dog không nhìn thấy. Private không đi xuyên qua kế thừa.',
        animation: 'compile-error',
        animationTarget: { className: 'Animal', memberName: 'age' },
      },
      {
        codeLineRange: [7, 13],
        explanation: '⬇️ Luồng kế thừa: `public` VÀ `protected` chảy từ Animal xuống Dog và Cat. `private` giữ lại ở Animal — không chảy xuống. Đây là nguyên tắc cốt lõi của visibility trong kế thừa.',
        animation: 'inheritance-flow',
        animationTarget: { fromClass: 'Animal', toClass: 'Dog' },
      },
      {
        codeLineRange: [19, 21],
        explanation: '✅ Từ bên ngoài: `dog.Eat()` (public — OK), `dog.Fetch()` (public — OK). Hai phương thức này "trồi" lên mặt nước, ai cũng gọi được.',
        animation: 'arrow-flow',
        animationTarget: { fromClass: 'Dog', toClass: 'Animal', memberName: 'Eat' },
      },
      {
        codeLineRange: [22, 22],
        explanation: '❌ `dog.Name` từ bên ngoài — lỗi biên dịch! Dù Dog kế thừa `Name`, modifier `protected` có nghĩa là bên ngoài không nhìn thấy. Chỉ code bên trong Animal hoặc lớp con mới dùng được.',
        animation: 'compile-error',
        animationTarget: { className: 'Dog', memberName: 'Name' },
      },
    ],
  },

  // ================================================================
  // 📐 ABSTRACTION — Vehicle → Car, Bike
  // Thêm: phương thức thường GetDescription() bên cạnh abstract members
  // ================================================================
  {
    id: 'abstraction',
    order: 3,
    difficultyLevel: 'intermediate',
    prerequisiteIds: ['inheritance'],
    title: '📐 Trừu tượng (Abstraction)',
    description: 'Lớp abstract định nghĩa "hợp đồng" — lớp con BẮT BUỘC phải triển khai.',
    lessonQuestion: '💡 "Phương tiện" là khái niệm chung — bạn không thể lái "một phương tiện", nhưng bạn CÓ THỂ lái xe hơi hoặc xe máy!',
    keyTakeaways: [
      'abstract class không thể tạo đối tượng trực tiếp — chỉ dùng làm nền tảng',
      'Phương thức abstract BUỘC lớp con phải triển khai — bỏ qua là lỗi biên dịch',
      'abstract class vừa có "hợp đồng" (abstract) vừa có code dùng chung (non-abstract)',
    ],
    codeLines: [
      'public abstract class Vehicle {',                            //  0
      '    public string Brand { get; set; }',                     //  1
      '',                                                           //  2
      '    // Phương thức THƯỜNG — có sẵn code dùng chung',       //  3
      '    public string GetDescription() {',                      //  4
      '        return $"{Brand} chạy bằng {FuelType()}";',        //  5
      '    }',                                                      //  6
      '',                                                           //  7
      '    // Phương thức ABSTRACT — bắt buộc lớp con triển khai', //  8
      '    public abstract string Start();',                        //  9
      '    public abstract string FuelType();',                     // 10
      '}',                                                          // 11
      '',                                                           // 12
      'public class Car : Vehicle {',                               // 13
      '    public override string Start()    => "Brum brum! 🚗";', // 14
      '    public override string FuelType() => "Xăng";',          // 15
      '}',                                                          // 16
      '',                                                           // 17
      'public class Bike : Vehicle {',                              // 18
      '    public override string Start()    => "Vroom! 🏍️";',    // 19
      '    public override string FuelType() => "Xăng pha";',      // 20
      '}',                                                          // 21
      '',                                                           // 22
      'Vehicle v   = new Vehicle(); // ❌ Lỗi — không thể tạo!',  // 23
      'Car car     = new Car();     // ✅ OK',                      // 24
      'car.Start();                 // ✅ "Brum brum! 🚗"',        // 25
      'car.GetDescription();        // ✅ "Toyota chạy bằng Xăng"', // 26
    ],
    steps: [
      {
        codeLineRange: [0, 11],
        explanation: '📐 Vehicle là `abstract class` — bản thiết kế, không phải sản phẩm hoàn chỉnh. Điểm quan trọng: nó KHÔNG phải trống rỗng. Nó vừa có code dùng chung (GetDescription), vừa có "hợp đồng" bắt buộc (Start, FuelType).',
        animation: 'highlight-class',
        animationTarget: { className: 'Vehicle' },
      },
      {
        codeLineRange: [1, 1],
        explanation: '✅ `Brand` là thuộc tính thường — Vehicle cung cấp thẳng cho lớp con, không cần override. Car và Bike đều kế thừa và dùng được ngay.',
        animation: 'highlight-member',
        animationTarget: { className: 'Vehicle', memberName: 'Brand' },
      },
      {
        codeLineRange: [3, 6],
        explanation: '🔧 `GetDescription()` là phương thức thường có đầy đủ thân hàm. Điều đặc biệt: nó gọi `FuelType()` — một phương thức abstract chưa được triển khai! Vehicle tin tưởng rằng lớp con SẼ triển khai FuelType(), nên dùng trước ở đây hoàn toàn hợp lệ.',
        animation: 'highlight-member',
        animationTarget: { className: 'Vehicle', memberName: 'GetDescription' },
      },
      {
        codeLineRange: [9, 10],
        explanation: '❓ `Start()` và `FuelType()` là `abstract` — chỉ có chữ ký, không có thân hàm. Vehicle tuyên bố: "Mọi phương tiện đều phải Start() và FuelType(), nhưng mỗi loại tự quyết định cách làm." Đây là phần "hợp đồng" của bản thiết kế.',
        animation: 'highlight-member',
        animationTarget: { className: 'Vehicle', memberName: 'Start' },
      },
      {
        codeLineRange: [23, 23],
        explanation: '❌ `new Vehicle()` — lỗi biên dịch ngay lập tức. Vehicle có phương thức abstract chưa có thân hàm, tạo ra rồi gọi Start() thì chạy gì? C# chặn điều này từ trước. Bạn không thể "lái một bản thiết kế".',
        animation: 'abstract-error',
        animationTarget: { className: 'Vehicle' },
      },
      {
        codeLineRange: [13, 16],
        explanation: '🚗 Car override ĐẦY ĐỦ cả `Start()` lẫn `FuelType()` — hợp đồng được thực hiện trọn vẹn. Nếu quên một cái, trình biên dịch sẽ báo lỗi. Hợp đồng không cho phép ký một nửa.',
        animation: 'highlight-class',
        animationTarget: { className: 'Car' },
      },
      {
        codeLineRange: [24, 25],
        explanation: '✅ `new Car()` thành công. `car.Start()` trả về "Brum brum! 🚗" — phiên bản Car override.',
        animation: 'create-object',
        animationTarget: { className: 'Car' },
      },
      {
        codeLineRange: [26, 26],
        explanation: '🎁 `car.GetDescription()` — phương thức này được kế thừa từ Vehicle (không cần override). Nó gọi `FuelType()` bên trong — lúc này Car đã có FuelType() nên trả về "Toyota chạy bằng Xăng". Code ở Vehicle viết một lần, tất cả lớp con dùng được.',
        animation: 'arrow-flow',
        animationTarget: { fromClass: 'Car', toClass: 'Vehicle', memberName: 'GetDescription' },
      },
    ],
  },

  // ================================================================
  // 🎭 POLYMORPHISM — Animal Speak()
  // Thêm: step vòng lặp với dispatch hai đích khác nhau
  // ================================================================
  {
    id: 'polymorphism',
    order: 4,
    difficultyLevel: 'intermediate',
    prerequisiteIds: ['inheritance', 'abstraction'],
    title: '🎭 Đa hình (Polymorphism)',
    description: 'Cùng một phương thức nhưng mỗi lớp con thực hiện theo cách riêng.',
    lessonQuestion: '💡 Khi bạn nói "kêu đi!" — chó sủa "Gâu!", mèo kêu "Meo!". Cùng lệnh, khác kết quả — đó là Đa Hình!',
    keyTakeaways: [
      'virtual cho phép override — override thay thế hoàn toàn hành vi của lớp cha',
      'Biến kiểu cha có thể chứa đối tượng con — hành vi phụ thuộc kiểu THỰC TẾ lúc chạy',
      'Vòng lặp duyệt Animal[] gọi Speak() mà không cần biết từng loài là gì — mở rộng không giới hạn',
    ],
    codeLines: [
      'public class Animal {',                                          //  0
      '    public virtual string Speak() => "...";',                   //  1
      '}',                                                              //  2
      '',                                                               //  3
      'public class Dog : Animal {',                                    //  4
      '    public override string Speak() => "Gâu gâu! 🐕";',         //  5
      '}',                                                              //  6
      '',                                                               //  7
      'public class Cat : Animal {',                                    //  8
      '    public override string Speak() => "Meo meo! 🐱";',         //  9
      '}',                                                              // 10
      '',                                                               // 11
      '// ⚠️ Không có virtual → override không hoạt động',            // 12
      'public class Fish : Animal {',                                   // 13
      '    public new string Speak() => "Blub blub 🐟";',             // 14
      '}',                                                              // 15
      '',                                                               // 16
      '// Biến kiểu Animal, đối tượng thực tế là Dog',               // 17
      'Animal pet = new Dog();',                                        // 18
      'pet.Speak();  // → "Gâu gâu! 🐕"',                            // 19
      '',                                                               // 20
      'pet = new Cat();',                                               // 21
      'pet.Speak();  // → "Meo meo! 🐱"',                            // 22
      '',                                                               // 23
      '// Đa hình phát huy khi duyệt danh sách',                     // 24
      'Animal[] animals = { new Dog(), new Cat(), new Dog() };',       // 25
      'foreach (var a in animals)',                                     // 26
      '    Console.WriteLine(a.Speak()); // Tự động đúng loài',       // 27
      '',                                                               // 28
      '// ⚠️ Fish dùng new thay override — KHÔNG phải đa hình!',     // 29
      'Animal f = new Fish();',                                         // 30
      'f.Speak(); // → "..." — chạy Animal.Speak(), KHÔNG phải Fish!', // 31
    ],
    steps: [
      {
        codeLineRange: [1, 1],
        explanation: '🐾 `virtual` trên `Animal.Speak()` — đây là tín hiệu: "Phương thức này có thể bị thay thế bởi lớp con." Nếu không có `virtual`, lớp con không thể override theo cơ chế đa hình.',
        animation: 'highlight-member',
        animationTarget: { className: 'Animal', memberName: 'Speak' },
      },
      {
        codeLineRange: [5, 5],
        explanation: '🐕 `override` trên `Dog.Speak()` — Dog tuyên bố thay thế hoàn toàn phiên bản của Animal. Từ khóa `override` là bắt buộc và tường minh: C# không cho phép ghi đè âm thầm.',
        animation: 'override-flash',
        animationTarget: { className: 'Dog', memberName: 'Speak' },
      },
      {
        codeLineRange: [9, 9],
        explanation: '🐱 Cat cũng `override Speak()` theo cách riêng. Cùng tên phương thức, cùng chữ ký — hoàn toàn khác kết quả. Đây chính là đa hình.',
        animation: 'override-flash',
        animationTarget: { className: 'Cat', memberName: 'Speak' },
      },
      {
        codeLineRange: [12, 15],
        explanation: '⚠️ Fish dùng `new` thay vì `override`. Đây KHÔNG phải đa hình — Fish chỉ đang "che khuất" Animal.Speak() chứ không thay thế. Sự khác biệt sẽ rõ ở bước cuối.',
        animation: 'warning',
        animationTarget: { className: 'Fish', memberName: 'Speak' },
      },
      {
        codeLineRange: [18, 19],
        explanation: '🎯 Biến `pet` kiểu `Animal` nhưng chứa đối tượng `Dog`. Gọi `pet.Speak()` — hệ thống nhìn vào đối tượng THỰC TẾ (Dog) và chạy `Dog.Speak()` → "Gâu gâu!". Cơ chế này là DYNAMIC DISPATCH — quyết định lúc runtime, không phải compile time.',
        animation: 'polymorphic-dispatch',
        animationTarget: { fromClass: 'Animal', toClass: 'Dog', memberName: 'Speak' },
      },
      {
        codeLineRange: [21, 22],
        explanation: '🔄 `pet` đổi sang Cat. Cùng dòng lệnh `pet.Speak()` nhưng kết quả hoàn toàn khác → "Meo meo!". MỘT biến, NHIỀU hành vi — phụ thuộc vào đối tượng thực tế đằng sau.',
        animation: 'polymorphic-dispatch',
        animationTarget: { fromClass: 'Animal', toClass: 'Cat', memberName: 'Speak' },
      },
      {
        codeLineRange: [25, 27],
        explanation: '💥 Sức mạnh thực sự: vòng lặp chỉ biết đây là `Animal[]`, nhưng mỗi `a.Speak()` tự động dispatch đúng loài (Dog → "Gâu gâu!", Cat → "Meo meo!", Dog → "Gâu gâu!"). Thêm 100 loài mới? Vòng lặp không thay đổi một chữ.',
        animation: 'polymorphic-dispatch',
        animationTarget: { fromClass: 'Animal', toClass: 'Dog', secondToClass: 'Cat', memberName: 'Speak' },
      },
      {
        codeLineRange: [30, 31],
        explanation: '⚠️ Fish dùng `new` — cái bẫy! `Animal f = new Fish()` rồi `f.Speak()` → trả về "..." (Animal.Speak), KHÔNG phải "Blub blub"! Vì `new` không tham gia vào cơ chế dynamic dispatch. Bài học: muốn đa hình, phải dùng `override`, không phải `new`.',
        animation: 'warning',
        animationTarget: { fromClass: 'Animal', toClass: 'Fish', memberName: 'Speak' },
      },
    ],
  },

  // ================================================================
  // 🤝 INTERFACE — IPayment + ILoggable
  // Thêm: implement nhiều interface, so sánh abstract class vs interface
  // ================================================================
  {
    id: 'interface',
    order: 5,
    difficultyLevel: 'intermediate',
    prerequisiteIds: ['abstraction', 'polymorphism'],
    title: '🤝 Interface',
    description: 'Interface là "hợp đồng thuần túy" — định nghĩa những gì phải làm, không nói cách làm.',
    lessonQuestion: '💡 Ổ cắm điện không quan tâm đây là quạt hay tivi — miễn là đúng chuẩn là cắm vào được. Interface hoạt động y hệt như vậy!',
    keyTakeaways: [
      'Interface chỉ định nghĩa "phải làm gì" — không có code, không có constructor',
      'Một class có thể implement NHIỀU interface — khác với kế thừa chỉ được một lớp cha',
      'Code nên phụ thuộc vào interface, không vào class cụ thể — dễ thay thế, dễ test',
    ],
    codeLines: [
      '// Interface 1 — hợp đồng thanh toán',                       //  0
      'public interface IPayment {',                                  //  1
      '    bool ProcessPayment(decimal amount);',                     //  2
      '    string GetProviderName();',                                //  3
      '}',                                                            //  4
      '',                                                             //  5
      '// Interface 2 — hợp đồng ghi log',                         //  6
      'public interface ILoggable {',                                 //  7
      '    void Log(string message);',                               //  8
      '}',                                                            //  9
      '',                                                             // 10
      '// CreditCard ký CẢ HAI hợp đồng',                          // 11
      'public class CreditCard : IPayment, ILoggable {',             // 12
      '    public bool ProcessPayment(decimal amount) {',            // 13
      '        Log($"Thanh toán {amount} qua thẻ");',               // 14
      '        return true;',                                         // 15
      '    }',                                                        // 16
      '    public string GetProviderName() => "Credit Card";',       // 17
      '    public void Log(string message) {',                       // 18
      '        Console.WriteLine($"[LOG] {message}");',              // 19
      '    }',                                                        // 20
      '}',                                                            // 21
      '',                                                             // 22
      '// MoMo chỉ ký hợp đồng IPayment',                          // 23
      'public class MoMo : IPayment {',                              // 24
      '    public bool ProcessPayment(decimal amount) => true;',     // 25
      '    public string GetProviderName() => "MoMo";',              // 26
      '}',                                                            // 27
      '',                                                             // 28
      '// OrderService phụ thuộc interface, không phụ thuộc class', // 29
      'public class OrderService {',                                  // 30
      '    private IPayment _payment;',                              // 31
      '    public OrderService(IPayment payment) {',                 // 32
      '        _payment = payment;',                                  // 33
      '    }',                                                        // 34
      '    public void Checkout(decimal total) {',                   // 35
      '        _payment.ProcessPayment(total);',                     // 36
      '    }',                                                        // 37
      '}',                                                            // 38
      '',                                                             // 39
      '// Hoán đổi tự do — OrderService không đổi một chữ',        // 40
      'var order1 = new OrderService(new CreditCard());',            // 41
      'var order2 = new OrderService(new MoMo());',                  // 42
      '',                                                             // 43
      '// So sánh: abstract class vs interface',                     // 44
      '// abstract class: CÓ code dùng chung, chỉ kế thừa 1 lớp', // 45
      '// interface:      KHÔNG có code,      implement bao nhiêu cũng được', // 46
    ],
    steps: [
      {
        codeLineRange: [1, 4],
        explanation: '🤝 Interface `IPayment` — chỉ có chữ ký phương thức, không có thân hàm, không có constructor. Đây là "hợp đồng thuần túy": bất kỳ ai ký tên (implement) phải thực hiện đầy đủ `ProcessPayment()` và `GetProviderName()`. Quy ước đặt tên: bắt đầu bằng chữ `I`.',
        animation: 'interface-contract',
        animationTarget: { className: 'IPayment' },
      },
      {
        codeLineRange: [7, 9],
        explanation: '📋 Interface `ILoggable` — một hợp đồng khác, hoàn toàn độc lập với `IPayment`. Bất kỳ class nào muốn có khả năng ghi log thì implement interface này. Hợp đồng nhỏ, đơn nhiệm — đây là best practice.',
        animation: 'interface-contract',
        animationTarget: { className: 'ILoggable' },
      },
      {
        codeLineRange: [12, 21],
        explanation: '💳 CreditCard implement CẢ HAI interface: `IPayment, ILoggable`. Một class ký nhiều hợp đồng cùng lúc — điều này không thể làm với kế thừa (C# chỉ cho phép kế thừa từ một lớp cha). Interface giải phóng giới hạn đó.',
        animation: 'multi-interface',
        animationTarget: { className: 'CreditCard', fromClass: 'IPayment', toClass: 'ILoggable' },
      },
      {
        codeLineRange: [13, 16],
        explanation: '🔗 Bên trong `ProcessPayment()`, CreditCard gọi `Log()` — phương thức đến từ `ILoggable`. Đây là sức mạnh của nhiều interface: CreditCard vừa biết thanh toán vừa biết ghi log, và có thể phối hợp hai khả năng đó.',
        animation: 'highlight-member',
        animationTarget: { className: 'CreditCard', memberName: 'ProcessPayment' },
      },
      {
        codeLineRange: [24, 27],
        explanation: '📱 MoMo chỉ implement `IPayment` — không implement `ILoggable`. Hoàn toàn hợp lệ. Mỗi class tự chọn ký những hợp đồng phù hợp với mình. Không ai bắt buộc phải ký hết.',
        animation: 'highlight-class',
        animationTarget: { className: 'MoMo' },
      },
      {
        codeLineRange: [30, 38],
        explanation: '🏆 `OrderService` nhận vào `IPayment` — không phải CreditCard, không phải MoMo. OrderService không quan tâm đằng sau là gì, chỉ cần biết có `ProcessPayment()`. Đây là "lập trình theo interface, không theo implementation" — nền tảng của Dependency Injection.',
        animation: 'interface-contract',
        animationTarget: { className: 'OrderService', memberName: '_payment' },
      },
      {
        codeLineRange: [41, 42],
        explanation: '🔀 Muốn dùng thẻ tín dụng → truyền `new CreditCard()`. Muốn đổi sang MoMo → truyền `new MoMo()`. OrderService không thay đổi một chữ. Muốn thêm ZaloPay? Tạo `class ZaloPay : IPayment` rồi truyền vào — xong.',
        animation: 'polymorphic-dispatch',
        animationTarget: { fromClass: 'IPayment', toClass: 'CreditCard', memberName: 'ProcessPayment' },
      },
      {
        codeLineRange: [44, 46],
        explanation: '📊 So sánh abstract class vs interface: abstract class có code dùng chung nhưng chỉ kế thừa được một lớp; interface không có code nhưng implement bao nhiêu cũng được. Nguyên tắc chọn: có logic/dữ liệu chung → abstract class; chỉ định nghĩa hành vi → interface.',
        animation: 'compare',
        animationTarget: { fromClass: 'Vehicle', toClass: 'IPayment' },
      },
    ],
  },

];
