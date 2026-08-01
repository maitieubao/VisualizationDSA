import type { TheoryDocument } from '@/shared/types/theory.types';

export const oopTheoryDocs: Record<string, TheoryDocument> = {
  encapsulation: {
    id: 'oop-encapsulation',
    title: 'Tính Đóng Gói (Encapsulation)',
    sections: [
      {
        id: 'encap-concept',
        title: '1. Định nghĩa Đóng gói',
        content: `**Tính đóng gói (Encapsulation)** là cơ chế che giấu thông tin nội bộ của đối tượng và bảo vệ dữ liệu khỏi sự truy cập trái phép từ bên ngoài. 

Nó gom các biến (trường dữ liệu) và phương thức hoạt động trên dữ liệu đó vào trong một lớp duy nhất, đồng thời giới hạn quyền truy cập trực tiếp bằng các **Access Modifiers** (phạm vi truy cập).`,
        keywordTags: ['dong goi', 'encapsulation', 'dinh nghia']
      },
      {
        id: 'access-modifiers',
        title: '2. Phạm vi Truy cập (Access Modifiers)',
        content: `Trong C#, chúng ta sử dụng các Access Modifier sau để kiểm soát tính đóng gói:
- \`private\`: Chỉ cho phép truy cập bên trong chính lớp đó.
- \`protected\`: Cho phép truy cập bên trong lớp đó và các lớp con kế thừa.
- \`public\`: Cho phép truy cập tự do từ mọi nơi bên ngoài.

*Quy tắc vàng:* Luôn để các trường dữ liệu là \`private\` hoặc \`protected\`, và chỉ mở ra thông qua các thuộc tính (\`Properties\`) công khai với các bộ lọc dữ liệu hợp lệ.`,
        keywordTags: ['access modifier', 'public', 'private', 'protected']
      },
      {
        id: 'encap-properties',
        title: '3. Thuộc tính & Bộ lọc Dữ liệu (Getter & Setter)',
        content: `Thuộc tính (Properties) cung cấp cơ chế bảo vệ để đọc, ghi hoặc tính toán giá trị của một trường dữ liệu riêng tư. Bằng cách sử dụng các khối \`get\` và \`set\`, bạn có thể kiểm tra tính hợp lệ của dữ liệu trước khi gán.`,
        codeSample: `public class BankAccount {
    // 1. Trường dữ liệu private (Che giấu bộ nhớ)
    private decimal _balance;

    // 2. Thuộc tính public kiểm soát truy cập
    public decimal Balance {
        get { return _balance; }
        set {
            // Bộ lọc dữ liệu - Tránh gán số âm
            if (value >= 0) {
                _balance = value;
            } else {
                throw new ArgumentException("Số dư không thể là số âm!");
            }
        }
    }
}`,
        keywordTags: ['properties', 'getter', 'setter', 'balance', 'loc du lieu']
      },
      {
        id: 'memory-protection',
        title: '4. Bộ nhớ Heap và Cơ chế Bảo vệ',
        content: `Khi bạn gọi lệnh \`acc.balance = 9999\` trực tiếp lên một trường dữ liệu \`private\` từ bên ngoài lớp:
- **Trình biên dịch** sẽ báo lỗi ngay lập tức (Compile Error).
- **Trên Vùng nhớ Heap**, vùng nhớ tương ứng với ô dữ liệu đó được bảo vệ bởi một lá chắn quyền truy cập (*Access Shield*), chặn đứng mọi nỗ lực can thiệp từ bên ngoài mà không thông qua thuộc tính hoặc phương thức chính thức.`,
        keywordTags: ['heap', 'memory', 'bao ve', 'shield']
      }
    ]
  },
  inheritance: {
    id: 'oop-inheritance',
    title: 'Tính Kế Thừa (Inheritance)',
    sections: [
      {
        id: 'inherit-concept',
        title: '1. Khái niệm Kế thừa',
        content: `**Tính kế thừa (Inheritance)** cho phép chúng ta xây dựng một lớp mới (Lớp con - Subclass / Derived Class) dựa trên một lớp đã tồn tại (Lớp cha - Base Class / Parent Class).

Lớp con tự động thừa hưởng tất cả các thành viên công khai (\`public\`) và được bảo vệ (\`protected\`) của lớp cha, giúp tái sử dụng mã nguồn và thiết lập mối quan hệ phân cấp dạng **"IS-A"** (Ví dụ: Chó *là một* Động vật).`,
        keywordTags: ['ke thua', 'inheritance', 'is-a', 'cha con']
      },
      {
        id: 'code-reuse',
        title: '2. Tái sử dụng Mã nguồn',
        content: `Thay vì phải sao chép hoặc viết lại các phương thức dùng chung cho mọi loài vật như \`Eat()\` và \`Sleep()\`, ta định nghĩa chúng ở lớp cha \`Animal\`. Lớp con \`Dog\` và \`Cat\` chỉ cần tập trung vào các đặc tả hành vi riêng của mình như \`Speak()\` hay \`Fetch()\`.`,
        codeSample: `public class Animal {
    public string Name { get; set; }
    public void Eat() {
        Console.WriteLine(Name + " đang ăn...");
    }
}

// Dog kế thừa từ Animal sử dụng dấu hai chấm (:)
public class Dog : Animal {
    public void Fetch() {
        Console.WriteLine(Name + " đang nhặt bóng...");
    }
}`,
        keywordTags: ['tai su dung', 'animal', 'dog', 'code reuse']
      },
      {
        id: 'memory-inheritance',
        title: '3. Phân bổ Bộ nhớ đối tượng Kế thừa',
        content: `Trong bộ nhớ Heap, khi bạn khởi tạo một đối tượng lớp con:
- \`Dog dog = new Dog();\`
- Hệ thống sẽ cấp phát một ô nhớ hợp nhất trên Heap chứa toàn bộ các thuộc tính của cả lớp cha (\`Animal.Name\`) và lớp con (\`Dog.Fetch()\`).
- Sơ đồ UML tĩnh sẽ biểu thị mối liên kết này bằng một mũi tên rỗng chỉ từ lớp con lên lớp cha, giúp mô tả trực quan cấu trúc phân cấp.`,
        keywordTags: ['memory allocation', 'heap', 'sodo uml']
      }
    ]
  },
  polymorphism: {
    id: 'oop-polymorphism',
    title: 'Tính Đa Hình (Polymorphism)',
    sections: [
      {
        id: 'poly-concept',
        title: '1. Khái niệm Đa hình',
        content: `**Tính đa hình (Polymorphism)** có nghĩa là "nhiều dạng". Nó cho phép một thông điệp (cuộc gọi phương thức) được gửi đến các đối tượng thuộc các lớp khác nhau, và mỗi đối tượng sẽ phản hồi theo cách đặc trưng riêng của nó.

Trong C#, đa hình Runtime được thực hiện qua các từ khóa \`virtual\`, \`override\`, và liên kết động (Dynamic Binding).`,
        keywordTags: ['da hinh', 'polymorphism', 'nhieu dang', 'runtime']
      },
      {
        id: 'virtual-override',
        title: '2. Virtual & Override',
        content: `- \`virtual\`: Khai báo ở lớp cha, báo hiệu rằng phương thức này có thể được ghi đè ở lớp con.
- \`override\`: Khai báo ở lớp con để cung cấp định nghĩa mới cho phương thức ảo của lớp cha.`,
        codeSample: `public class Animal {
    public virtual void Speak() {
        Console.WriteLine("Animal đang phát ra âm thanh...");
    }
}

public class Dog : Animal {
    public override void Speak() {
        Console.WriteLine("Gâu Gâu!");
    }
}`,
        keywordTags: ['virtual', 'override', 'animal', 'dog', 'speak']
      },
      {
        id: 'dynamic-dispatch',
        title: '3. Liên kết động & VTable (Bảng Phương thức Ảo)',
        content: `Khi bạn gọi \`animal.Speak()\` với biến kiểu cha trỏ đến đối tượng con:
- \`Animal pet = new Dog(); pet.Speak();\`
- Hệ thống C# Runtime không gọi phương thức của \`Animal\` mà dùng địa chỉ đối tượng để tra cứu bảng **VTable (Virtual Method Table)** trên Heap.
- Bảng tra cứu này sẽ trỏ chính xác đến phương thức được ghi đè (\`Dog.Speak()\`). Quá trình này được gọi là **Dynamic Dispatch / Runtime Dispatch**.`,
        keywordTags: ['dynamic dispatch', 'vtable', 'phuong thuc ao', 'runtime dispatch']
      }
    ]
  },
  abstraction: {
    id: 'oop-abstraction',
    title: 'Tính Trừu Tượng (Abstraction)',
    sections: [
      {
        id: 'abstract-concept',
        title: '1. Khái niệm Trừu tượng',
        content: `**Tính trừu tượng (Abstraction)** tập trung vào việc ẩn đi các chi tiết cài đặt phức tạp bên trong và chỉ phơi bày ra các tính năng thiết yếu của đối tượng cho người dùng.

Nó giống như việc bạn lái xe ô tô: Bạn chỉ cần biết dùng Vô lăng, Chân ga và Phanh, mà không cần hiểu chi tiết cơ cấu pittông trong động cơ hoạt động thế nào.`,
        keywordTags: ['truu tuong', 'abstraction', 'chi tiet', 'o to']
      },
      {
        id: 'abstract-class',
        title: '2. Lớp Trừu tượng (Abstract Class)',
        content: `- Lớp trừu tượng là lớp không hoàn chỉnh, được khai báo bằng từ khóa \`abstract\`.
- Bạn **không thể khởi tạo đối tượng trực tiếp** từ lớp trừu tượng (ví dụ: \`new Animal()\` sẽ báo lỗi).
- Lớp trừu tượng có thể chứa các phương thức trừu tượng (\`abstract method\`) không có thân hàm, bắt buộc các lớp con kế thừa phải tự điền phần cài đặt chi tiết.`,
        codeSample: `public abstract class Vehicle {
    public string Brand { get; set; }
    
    // Phương thức trừu tượng - không có thân hàm
    public abstract void StartEngine();
}

public class Car : Vehicle {
    public override void StartEngine() {
        Console.WriteLine("Động cơ xe hơi nổ máy: Vrooom!");
    }
}`,
        keywordTags: ['abstract class', 'abstract method', 'vehicle', 'car', 'khong khoi tao']
      },
      {
        id: 'abstract-purpose',
        title: '3. Ý nghĩa của Lớp Trừu tượng',
        content: `Lớp trừu tượng đóng vai trò là một **Bản thiết kế mẫu** thống nhất các quy chuẩn chung. Nó ép buộc tất cả các lớp con phải thực thi cụ thể các phương thức trừu tượng, tạo ra tính đồng bộ và tin cậy cao cho toàn bộ hệ thống code.`,
        keywordTags: ['ban thiet ke', 'y nghia', 'quy chuan']
      }
    ]
  },
  interface: {
    id: 'oop-interface',
    title: 'Giao diện (Interface)',
    sections: [
      {
        id: 'interface-concept',
        title: '1. Định nghĩa Interface',
        content: `**Interface (Giao diện)** là một bản cam kết (Contract) quy định các hành vi mà một lớp bắt buộc phải thực thi.

Interface không chứa bất kỳ trường dữ liệu hay phần cài đặt logic nào (hoàn toàn trống), chỉ bao gồm khai báo tên phương thức và kiểu trả về. Một lớp có thể thực thi nhiều Interface cùng lúc (đa kế thừa hành vi).`,
        keywordTags: ['interface', 'giao dien', 'hop dong', 'contract']
      },
      {
        id: 'interface-syntax',
        title: '2. Khai báo & Thực thi Interface',
        content: `Trong C#, Interface thường được bắt đầu bằng chữ cái \`I\` viết hoa để phân biệt.`,
        codeSample: `public interface IPaymentGateway {
    void ProcessPayment(decimal amount);
}

public class MoMoPayment : IPaymentGateway {
    public void ProcessPayment(decimal amount) {
        Console.WriteLine("Đang thanh toán " + amount + "đ qua Ví điện tử MoMo...");
    }
}`,
        keywordTags: ['ipaymentgateway', 'momo', 'processpayment', 'thuc thi']
      },
      {
        id: 'interface-loose-coupling',
        title: '3. Liên kết lỏng (Loose Coupling)',
        content: `Sử dụng Interface giúp tách rời sự phụ thuộc trực tiếp giữa các module (Loose Coupling). Lớp gọi thanh toán chỉ cần phụ thuộc vào cổng giao tiếp tổng quát \`IPaymentGateway\`, thay vì gắn chặt vào một nhà cung cấp cụ thể như \`MoMoPayment\` hay \`ZaloPay\`.`,
        keywordTags: ['lien ket long', 'loose coupling', 'phu thuoc']
      }
    ]
  }
};
